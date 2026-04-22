import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL veya Anon Key eksik!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function updateBatch(wordPairs: [string, string, string, string][], startOffset: number) {
  console.log(`${startOffset + 1}. satırdan itibaren ${wordPairs.length} kelime işleniyor...`);
  
  // Ques_ID'leri al
  const { data: questions, error: fetchError } = await supabase
    .from('questions')
    .select('Ques_ID')
    .order('Ques_ID', { ascending: true })
    .range(startOffset, startOffset + wordPairs.length - 1);
    
  if (fetchError) {
    console.error("Sorular çekilirken hata oluştu:", fetchError);
    return;
  }
  
  if (!questions || questions.length === 0) {
    console.error("Güncellenecek soru bulunamadı!");
    return;
  }
  
  let successCount = 0;
  let skipCount = 0;
  
  for (let i = 0; i < questions.length; i++) {
    const [target, dist1, dist2, dist3] = wordPairs[i];
    const quesId = questions[i].Ques_ID;
    
    // Check if target is same as any distractor
    if (target === dist1 || target === dist2 || target === dist3) {
      console.warn(`ID ${quesId} atlanıyor: Hedef kelime çeldiricilerden biriyle aynı (${target})`);
      skipCount++;
      continue;
    }
    
    const { error: updateError } = await supabase
      .from('questions')
      .update({ 
        Target_Word: target,
        Dist_1: dist1,
        Dist_2: dist2,
        Dist_3: dist3
      })
      .eq('Ques_ID', quesId);
      
    if (updateError) {
      console.error(`ID ${quesId} güncellenirken hata:`, updateError);
    } else {
      successCount++;
      if ((successCount + skipCount) % 100 === 0) {
        console.log(`${successCount + skipCount} satır işlendi...`);
      }
    }
  }
  
  console.log(`Bölüm tamamlandı! Başarılı: ${successCount}, Atlanan: ${skipCount}`);
}

export { updateBatch };
