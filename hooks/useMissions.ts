
import { useEffect, useCallback } from 'react';
import { UserStats } from '../types';
import { User } from 'firebase/auth';
import { syncSupabaseStats } from '../lib/supabase.ts';

const MISSIONS_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

export const useMissions = (
  stats: UserStats,
  updateStats: (updates: Partial<UserStats>) => void,
  currentUser: User | null,
  checkLeaderboardRank: (newStats: UserStats) => Promise<void>
) => {
  
  // Mission Refresh Logic
  useEffect(() => {
    const now = Date.now();
    if (now - stats.lastMissionsRefresh >= MISSIONS_REFRESH_INTERVAL) {
      updateStats({
        claimedMissions: [],
        lastMissionsRefresh: now
      });
    }
  }, [stats.lastMissionsRefresh, updateStats]);

  const handleClaimMission = useCallback((id: number, reward: number) => {
    const newStats = {
      ...stats,
      coins: stats.coins + reward,
      claimedMissions: [...stats.claimedMissions, id]
    };
    
    updateStats({
      coins: newStats.coins,
      claimedMissions: newStats.claimedMissions
    });

    if (currentUser) {
      syncSupabaseStats(currentUser.uid, newStats, currentUser.displayName || "", currentUser.photoURL || "");
      checkLeaderboardRank(newStats);
    }
  }, [stats, currentUser, updateStats, checkLeaderboardRank]);

  return {
    handleClaimMission
  };
};
