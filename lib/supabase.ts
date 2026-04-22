
import { createClient } from '@supabase/supabase-js';
import { UserStats } from '../types';
import { PLANET_IMAGES } from '../constants';

// @ts-ignore: Vite handles import.meta.env
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
// @ts-ignore: Vite handles import.meta.env
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL veya Anon Key eksik! Lütfen .env dosyasını kontrol edin.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Firebase UID'sini deterministik bir UUID formatına dönüştürür (Postgres UUID tipi için)
 */
export const toUUID = (uid: string) => {
  // Eğer zaten UUID formatındaysa dokunma
  if (uid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return uid;
  
  // Firebase UID'den deterministik bir hex dizesi oluştur
  let hex = '';
  for (let i = 0; i < uid.length; i++) {
    hex += uid.charCodeAt(i).toString(16);
  }
  // 32 karaktere tamamla veya kes
  hex = hex.padEnd(32, '0').substring(0, 32);
  
  // UUID formatına sok: 8-4-4-4-12
  return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20, 32)}`;
};

// Eksik sütunları takip etmek için basit bir önbellek
const missingColumnsCache: Record<string, Set<string>> = {};

/**
 * Supabase üzerinde manuel upsert işlemi gerçekleştir
 */
const robustUpsert = async (table: string, data: any, uid: string, useRawUid = false) => {
  // Supabase genellikle UUID bekler, bu yüzden varsayılan olarak toUUID kullanıyoruz
  const currentUid = useRawUid ? uid : toUUID(uid);
  
  // Bu tablo için daha önce tespit edilmiş eksik sütunları temizle
  let cleanData = { ...data };
  if (missingColumnsCache[table]) {
    missingColumnsCache[table].forEach(col => {
      delete cleanData[col];
    });
  }
  
  try {
    // 1. Önce kaydın var olup olmadığını kontrol et
    const { data: existing, error: fetchError } = await supabase
      .from(table)
      .select('user_id')
      .eq('user_id', currentUid)
      .maybeSingle();

    // UUID hatası kontrolü (Eğer UUID ile denediysek ve hata aldıysak raw UID ile dene)
    if (fetchError && fetchError.message.includes('invalid input syntax for type uuid') && !useRawUid) {
      return robustUpsert(table, data, uid, true);
    }

    if (existing) {
      // 2. Kayıt varsa güncelle
      const { error: updateError } = await supabase
        .from(table)
        .update(cleanData)
        .eq('user_id', currentUid);

      if (updateError) {
        // RLS Hatası
        if (updateError.message.includes('row-level security')) {
          console.error(`Supabase RLS Hatası (${table}): Lütfen Supabase panelinden RLS politikalarını kontrol edin.`);
          return; 
        }
        
        // Sütun hatası kontrolü
        const isColumnError = updateError.message.includes('column') && 
                             (updateError.message.includes('not found') || updateError.message.includes('Could not find'));
        
        if (isColumnError) {
          const fieldMatch = updateError.message.match(/column ['"]([^'"]+)['"]|['"]([^'"]+)['"] column/i);
          const columnName = fieldMatch ? (fieldMatch[1] || fieldMatch[2]) : null;
          
          if (columnName) {
            if (!missingColumnsCache[table]) missingColumnsCache[table] = new Set();
            missingColumnsCache[table].add(columnName);
            
            const { [columnName]: _, ...newData } = cleanData;
            return robustUpsert(table, newData, uid, useRawUid);
          }
        }
        throw updateError;
      }
    } else {
      // 3. Kayıt yoksa ekle
      const { error: insertError } = await supabase
        .from(table)
        .insert({ ...cleanData, user_id: currentUid });
      
      if (insertError) {
        if (insertError.message.includes('row-level security')) return;
        
        if (insertError.message.includes('invalid input syntax for type uuid') && !useRawUid) {
          return robustUpsert(table, data, uid, true);
        }

        const isColumnError = insertError.message.includes('column') && 
                             (insertError.message.includes('not found') || insertError.message.includes('Could not find'));
                             
        if (isColumnError) {
          const fieldMatch = insertError.message.match(/column ['"]([^'"]+)['"]|['"]([^'"]+)['"] column/i);
          const columnName = fieldMatch ? (fieldMatch[1] || fieldMatch[2]) : null;

          if (columnName) {
            if (!missingColumnsCache[table]) missingColumnsCache[table] = new Set();
            missingColumnsCache[table].add(columnName);
            
            const { [columnName]: _, ...newData } = cleanData;
            return robustUpsert(table, newData, uid, useRawUid);
          }
        }
        throw insertError;
      }
    }
  } catch (error: any) {
    // Sessizce başarısız ol, konsolu kirletme (zaten yukarıda kritik hataları bastık)
  }
};

/**
 * Supabase üzerinden kullanıcı verilerini senkronize et
 */
export const syncSupabaseStats = async (uid: string, stats: UserStats, displayName: string, photoURL: string): Promise<void> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase sync skipped: URL or Key missing.");
    return;
  }

  try {
    const score = (stats.level * 1000) + (stats.stars * 50) + Math.floor(stats.coins / 10);
    
    // 1. User Progress Sync
    const progressData: any = { 
      current_level: stats.level,
      total_xp: stats.stars,
      current_score_in_level: stats.streak,
      updated_at: new Date().toISOString()
    };

    try {
      await robustUpsert('user_progress', progressData, uid);
    } catch (e: any) {
      console.warn("User progress sync failed, trying minimal fallback...");
      const { updated_at, ...minimal } = progressData;
      await robustUpsert('user_progress', minimal, uid).catch(err => console.error("Final progress sync fail:", err));
    }
    
    // 2. Leaderboard Sync
    const planet = Math.ceil(stats.level / 6);
    const gate = ((stats.level - 1) % 6) + 1;

    const leaderboardData: any = {
      username: displayName || "Gezgin",
      score: score,
      level: stats.level,
      stars: stats.stars,
      planet: planet,
      gate: gate,
      updated_at: new Date().toISOString()
    };

    if (photoURL) {
      leaderboardData.photo_url = photoURL;
    }

    try {
      await robustUpsert('leaderboard', leaderboardData, uid);
    } catch (e: any) {
      console.warn("Leaderboard sync failed, trying minimal fallback...");
      const { updated_at, photo_url, ...minimal } = leaderboardData;
      // photo_url'i de çıkaralım çünkü bazen çok uzun olabiliyor
      await robustUpsert('leaderboard', minimal, uid).catch(err => console.error("Final leaderboard sync fail:", err));
    }
    
    console.log("Supabase sync successful for user:", uid, "Score:", score);
    // Konsola tablo olarak yazdıralım ki hata ayıklama kolaylaşsın
    console.log("Leaderboard Data Sent:", leaderboardData);
  } catch (error) {
    console.error("Supabase sync process failed:", error);
  }
};

export const fetchSupabaseStats = async (uid: string): Promise<UserStats | null> => {
  try {
    // Supabase için UUID formatını kullan
    const currentUid = toUUID(uid);
    
    let { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', currentUid)
      .maybeSingle();

    // Eğer UUID ile bulunamadıysa (eski kayıtlar için) raw UID ile dene
    if (!data && !error) {
      const { data: rawData, error: rawError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();
      data = rawData;
      error = rawError;
    }

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    if (!data) return null;

    // Map Supabase data back to UserStats
    return {
      level: data.current_level || 1,
      stars: data.total_xp || 0,
      coins: 0,
      hearts: 5,
      lastLifeRefillTime: Date.now(),
      hintsFreeze: 0,
      claimedMissions: [],
      lastMissionsRefresh: Date.now(),
      lastChestOpenTime: 0,
      difficultyFactor: 1.0,
      performanceHistory: [],
      streak: data.current_score_in_level || 0,
      maxStreak: 0,
      levelStars: {}
    } as UserStats;
  } catch (error) {
    console.error("Supabase fetch error:", error);
  }
  return null;
};

/**
 * Supabase'den soruları çek (matching image schema)
 */
export const fetchQuestions = async () => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('Target_Word, Dist_1, Dist_2, Dist_3, language, Planet_ID, Planet_Name, Ques_ID, DDS')
      .order('Ques_ID', { ascending: true });

    if (error) throw error;
    
    // VERİ DÜZELTME KATMANI (Supabase'deki hatalı kayıtlar için manuel müdahale)
    const MANUAL_FIXES: Record<number, { target?: string, distractors?: string[] }> = {
      178: { target: "PAPAZ", distractors: ["HAPAZ", "PAPAK", "PATAK"] } // HAPAZ-PAPAZ karışıklığı düzeltildi
    };

    // Map to the format used in the app
    return data.map(q => {
      const fix = MANUAL_FIXES[q.Ques_ID];
      const target = fix?.target || q.Target_Word;
      const distractors = fix?.distractors || [q.Dist_1, q.Dist_2, q.Dist_3].filter(Boolean);

      return {
        target: target,
        distractors: distractors,
        language: q.language,
        planetId: q.Planet_ID,
        planetName: q.Planet_Name,
        quesId: q.Ques_ID,
        difficulty: q.DDS,
        planetImage: `Planet${q.Planet_ID}.png` 
      };
    });
  } catch (error) {
    console.error("Supabase questions fetch error:", error);
    return null;
  }
};

/**
 * Liderlik tablosunu çek (matching image schema)
 */
export const fetchLeaderboard = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }
    return data || [];
  } catch (error) {
    console.error("Supabase leaderboard fetch error:", error);
    throw error;
  }
};

/**
 * Belirli bir kullanıcının liderlik tablosu verisini çek
 */
export const fetchUserRank = async (uid: string) => {
  try {
    const currentUid = toUUID(uid);
    let { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('user_id', currentUid)
      .maybeSingle();

    if (!data && !error) {
      const { data: rawData, error: rawError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();
      data = rawData;
      error = rawError;
    }

    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    console.error("Supabase user rank fetch error:", error);
    throw error;
  }
};

/**
 * Supabase storage'dan gezegen görsellerini çek
 */
export const fetchPlanetImages = async (): Promise<string[]> => {
  try {
    const bucketNames = ['Lumina', 'lumina', 'planets', 'assets'];
    console.log("Supabase: Gezegen görselleri taranıyor...");

    for (const bucket of bucketNames) {
      const { data, error } = await supabase
        .storage
        .from(bucket)
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
        });

      if (!error && data && data.length > 0) {
        const urls = processStorageData(bucket, data);
        if (urls.length > 0) {
          console.log(`Supabase: '${bucket}' bucket'ında ${urls.length} görsel bulundu.`);
          return urls;
        }
      }
    }

    // Eğer hiçbir bucket'ta bulunamazsa uyarı ver ama varsayılanları döndür
    console.info("Supabase: Dinamik gezegen görselleri bulunamadı, varsayılan sabit görseller kullanılıyor.");
    return PLANET_IMAGES;
  } catch (error) {
    console.error("Supabase storage fetch error:", error);
    return PLANET_IMAGES;
  }
};

/**
 * Storage verilerini işleyen yardımcı fonksiyon
 */
const processStorageData = (bucketName: string, data: any[]): string[] => {
    console.log(`Supabase: '${bucketName}' bucket'ında ${data.length} dosya bulundu, filtreleniyor...`);

    // Gezegen dosyalarını filtrele ve sayısal olarak sırala (Planet1, Planet2, ..., Planet10)
    const planetFiles = data
      .filter(file => 
        file.name.toLowerCase().startsWith('planet') && 
        (file.name.toLowerCase().endsWith('.png') || 
         file.name.toLowerCase().endsWith('.jpg') || 
         file.name.toLowerCase().endsWith('.jpeg') ||
         file.name.toLowerCase().endsWith('.webp'))
      )
      .sort((a, b) => {
        const numA = parseInt(a.name.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.name.replace(/\D/g, '')) || 0;
        return numA - numB;
      });

    console.log(`Supabase: Filtrelenmiş ve sıralanmış dosyalar:`, planetFiles.map(f => f.name).join(', '));

    if (planetFiles.length === 0) {
      console.warn(`Supabase: '${bucketName}' bucket'ında 'Planet' ile başlayan görsel bulunamadı.`);
      return [];
    }

    const finalUrls = planetFiles.map(file => {
      const { data: { publicUrl } } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(file.name);
      return publicUrl;
    });

    console.log(`Supabase: ${finalUrls.length} gezegen görseli sayısal sırayla başarıyla çekildi.`);
    return finalUrls;
};

/**
 * Supabase'den benzersiz gezegen isimlerini çek (Önbellekli ve Kademeli)
 */
export const fetchPlanetNames = async (): Promise<Record<number, string>> => {
  const CACHE_KEY = 'lumina_planet_names_cache';
  let namesMap: Record<number, string> = {};
  
  // 1. Mevcut önbelleği yükle
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      namesMap = JSON.parse(cached);
      // Eğer 100 gezegenin tamamı zaten varsa hemen döndür
      if (Object.keys(namesMap).length >= 100) {
        console.log("Supabase: 100 gezegen ismi önbellekten yüklendi.");
        return namesMap;
      }
    }
  } catch (e) {
    console.error("Cache read error:", e);
  }

  try {
    let offset = 0;
    const limit = 1000;
    let hasMore = true;
    let totalFetched = 0;
    let newNamesFound = 0;

    console.log(`Supabase: Gezegen isimleri taranıyor... (Mevcut: ${Object.keys(namesMap).length})`);

    // Tüm gezegenleri (1-100) bulana kadar veya veri bitene kadar çek
    // Güvenlik sınırı olarak 50.000 satıra kadar tarıyoruz
    while (Object.keys(namesMap).length < 100 && hasMore && totalFetched < 50000) {
      const { data, error } = await supabase
        .from('questions')
        .select('Planet_ID, Planet_Name')
        .range(offset, offset + limit - 1);

      if (error) throw error;

      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }

      data.forEach(q => {
        const id = Number(q.Planet_ID);
        if (!isNaN(id) && q.Planet_Name) {
          if (!namesMap[id]) {
            namesMap[id] = q.Planet_Name.toString().toUpperCase();
            newNamesFound++;
          }
        }
      });

      totalFetched += data.length;
      offset += limit;
      
      if (data.length < limit) {
        hasMore = false;
      }

      // Her 5000 satırda bir ara kayıt yap (ilerlemeyi kaybetmemek için)
      if (totalFetched % 5000 === 0 && newNamesFound > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(namesMap));
      }
    }
    
    console.log(`Supabase: Tarama bitti. Toplam ${totalFetched} satır, ${Object.keys(namesMap).length} gezegen ismi.`);
    
    // 2. Nihai sonucu yerel depolamaya kaydet
    if (Object.keys(namesMap).length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(namesMap));
    }

    return namesMap;
  } catch (error) {
    console.error("Supabase planet names fetch error:", error);
    return namesMap; // Hata olsa bile elimizdekini döndür
  }
};
