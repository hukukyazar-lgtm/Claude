
import { useState, useEffect, useCallback } from 'react';
import { UserStats, LeaderboardRankData, RankUpData, LeaderboardEntry } from '../types';
import { User } from 'firebase/auth';
import { fetchLeaderboard, toUUID } from '../lib/supabase.ts';
import { generateBots } from '../utils/generateBots';

export const useLeaderboard = (stats: UserStats, currentUser: User | null) => {
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [leaderboardRankData, setLeaderboardRankData] = useState<LeaderboardRankData | null>(null);
  const [rankUpData, setRankUpData] = useState<RankUpData | null>(null);

  const checkLeaderboardRank = useCallback(async (newStats: UserStats) => {
    if (!currentUser) return;
    
    try {
      const data = await fetchLeaderboard();
      
      // UTC gün bazlı seed (deterministik sıralama için)
      const daySeed = Math.floor(Date.now() / 86400000);
      const bots = generateBots(daySeed);
      
      // Puan hesaplama
      const score = (newStats.level * 1000) + (newStats.stars * 50) + Math.floor(newStats.coins / 10);
      
      // Gerçek kullanıcılar ve botları birleştir ve skorlara göre sırala
      const combined: LeaderboardEntry[] = [...(data || []), ...bots].sort((a, b) => (b.score || 0) - (a.score || 0));
      
      const uuid = toUUID(currentUser.uid);
      const index = combined.findIndex(p => p.user_id === currentUser.uid || p.user_id === uuid);
      
      if (index !== -1) {
        const newRank = index + 1;
        if (currentRank && newRank < currentRank) {
          setLeaderboardRankData({ newRank, oldRank: currentRank });
        }
        setCurrentRank(newRank);
      }
    } catch (e) {
      console.error("Rank check failed:", e);
    }
  }, [currentUser, currentRank]);

  // Initial rank check
  useEffect(() => {
    if (currentUser && stats.level > 0) {
      checkLeaderboardRank(stats);
    }
  }, [currentUser]);

  // Rank Title (Titles/Colors) Logic
  useEffect(() => {
    const sys = Math.ceil(stats.level / 6);
    const titleIdx = sys - 1;
    const titles = ["SEYYAH", "KAŞIF", "YILDIZ TOZU", "NEBULA", "GEZEGEN", "YILDIZ", "GALAKSİ", "EVREN", "KOZMİK TANRI", "SONSUZLUK"];
    const colors = ["#94a3b8", "#64748b", "#22d3ee", "#06b6d4", "#818cf8", "#6366f1", "#f472b6", "#d946ef", "#fbbf24", "#ffffff"];
    
    const currentTitle = titles[Math.min(titleIdx, titles.length - 1)];
    const currentColor = colors[Math.min(titleIdx, colors.length - 1)];

    const lastTitle = localStorage.getItem('lumina_last_title');
    if (lastTitle && lastTitle !== currentTitle) {
      setRankUpData({ title: currentTitle, color: currentColor });
    }
    localStorage.setItem('lumina_last_title', currentTitle);
  }, [stats.level]);

  return {
    currentRank,
    leaderboardRankData,
    rankUpData,
    setRankUpData,
    setLeaderboardRankData,
    checkLeaderboardRank
  };
};
