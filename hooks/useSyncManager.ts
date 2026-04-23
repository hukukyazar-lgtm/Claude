
import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, fetchCloudStats, syncUserStats, reconcileStats, secureSyncStats } from '../lib/firebase.ts';
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
      const result = await secureSyncStats({
        sessionCoinsEarned,
        starsEarned,
        levelCompleted
      });
      
      // Update local state with the authoritative data from server
      if (result.data && (result.data as any).newStats) {
        const newStats = (result.data as any).newStats;
        setStats(prev => ({
          ...prev,
          coins: newStats.coins,
          level: newStats.level,
          stars: newStats.stars
        }));
      }
    } catch (e) {
      console.error("Secure sync failed:", e);
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
