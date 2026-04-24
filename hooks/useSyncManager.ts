
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, fetchCloudStats, syncUserStats, reconcileStats } from '../lib/firebase.ts';
import { syncSupabaseStats } from '../lib/supabase.ts';
import { UserStats } from '../types';

const STORAGE_KEY = 'lumina_stats';

export const useSyncManager = (stats: UserStats, setStats: React.Dispatch<React.SetStateAction<UserStats>>) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSecureSync = async (sessionCoinsEarned: number, starsEarned: number, levelCompleted: boolean) => {
    if (!currentUser) return;
    setIsSyncing(true);
    
    try {
      // Doğrudan Firestore'a yazıyoruz, Güvenlik Kuralları (Security Rules) 
      // coins, stars ve level artışlarını sunucu tarafında doğrular.
      const newStats = {
        ...stats,
        coins: stats.coins + sessionCoinsEarned,
        stars: stats.stars + starsEarned,
        level: stats.level + (levelCompleted ? 1 : 0)
      };

      await syncUserStats(
        currentUser.uid, 
        newStats, 
        currentUser.displayName || "Gezgin", 
        currentUser.photoURL || ""
      );
      
      setStats(newStats);
      console.log("Güvenli senkronizasyon tamamlandı (Security Rules doğrulandı).");
    } catch (e) {
      console.error("Güvenlik kuralı ihlali veya yazma hatası:", e);
      // Hata durumunda local stats'ı cloud'dan tekrar çekip düzeltmek iyi bir pratiktir
      const cloudData = await fetchCloudStats(currentUser.uid);
      if (cloudData) setStats(cloudData);
    } finally {
      setIsSyncing(false);
    }
  };

  // Auth Listener and Initial Cloud Fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        try {
          const cloudData = await fetchCloudStats(user.uid);
          if (cloudData) {
            setStats(prev => reconcileStats(prev, cloudData));
          }
        } catch (e) {
          console.error("Initial cloud fetch failed:", e);
        } finally {
          setIsSyncing(false);
        }
      }
    });
    return () => unsubscribe();
  }, [setStats]);

  // Local Storage Persistence and Cloud Auto-Sync
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    
    if (currentUser) {
      const timeout = setTimeout(async () => {
        setIsSyncing(true);
        try {
          await Promise.all([
            syncUserStats(currentUser.uid, stats, currentUser.displayName || "", currentUser.photoURL || ""),
            syncSupabaseStats(currentUser.uid, stats, currentUser.displayName || "", currentUser.photoURL || "")
          ]);
        } catch (e) {
          console.error("Auto-sync failed:", e);
        } finally {
          setIsSyncing(false);
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [stats, currentUser]);

  return {
    currentUser,
    isSyncing,
    setIsSyncing,
    handleSecureSync
  };
};
