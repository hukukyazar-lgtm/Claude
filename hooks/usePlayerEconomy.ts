
import { useState, useCallback, useEffect } from 'react';
import { UserStats, GameState, HubSubView } from '../types';

const STORAGE_KEY = 'lumina_stats';

const DEFAULT_STATS: UserStats = {
  coins: 2063,
  hearts: 5,
  stars: 12,
  level: 1,
  lastLifeRefillTime: Date.now(),
  hintsFreeze: 3,
  hintsReveal: 3,
  claimedMissions: [],
  lastMissionsRefresh: Date.now(),
  lastChestOpenTime: 0,
  difficultyFactor: 1.0,
  performanceHistory: [],
  streak: 0,
  maxStreak: 0,
  levelStars: {},
  activeRisk: 0
};

export const usePlayerEconomy = (
  setSessionScore: (score: number) => void,
  setBonusEarned: (bonus: number) => void,
  setReplayingLevel: (lvl: number | null) => void,
  changeGameState: (gs: GameState) => void,
  setHubSubView: (view: HubSubView) => void
) => {
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          levelStars: parsed.levelStars || {},
          activeRisk: 0 // Her oturumda sıfırla
        };
      } catch (e) {
        console.error("Failed to parse saved stats:", e);
      }
    }
    return DEFAULT_STATS;
  });

  const updateStats = useCallback((updates: Partial<UserStats>) => {
    setStats(prev => {
      const newState = { ...prev, ...updates };
      // LocalStorage sync
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      return newState;
    });
  }, []);

  const handleApplyRisk = useCallback((amount: number) => {
    if (stats.coins < amount) return false;
    updateStats({ 
      coins: stats.coins - amount,
      activeRisk: amount 
    });
    return true;
  }, [stats.coins, updateStats]);

  /**
   * HEART REFILL LOGIC
   * Note: This is currently client-side and localStorage-based.
   * Documentation Limitation: Players can technically manipulate their 
   * local clock to refill hearts instantly. This is a known trade-off 
   * for offline-first responsiveness in this version.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      if (stats.hearts < 5) {
        const now = Date.now();
        const diff = now - stats.lastLifeRefillTime;
        const refillRate = 15 * 60 * 1000;
        
        if (diff >= refillRate) {
          const heartsToAdd = Math.floor(diff / refillRate);
          const newHearts = Math.min(5, stats.hearts + heartsToAdd);
          updateStats({ 
            hearts: newHearts, 
            lastLifeRefillTime: now - (diff % refillRate) 
          });
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [stats.hearts, stats.lastLifeRefillTime, updateStats]);

  const handleBuyItem = useCallback((cost: number, type: 'HEART' | 'FREEZE' | 'REVEAL', amount: number) => {
    if (stats.coins < cost) return;
    if (type === 'HEART' && stats.hearts >= 5) return;
    
    setStats(prev => {
      const next = { ...prev, coins: prev.coins - cost };
      if (type === 'HEART') next.hearts = Math.min(5, prev.hearts + amount);
      if (type === 'FREEZE') next.hintsFreeze += amount;
      if (type === 'REVEAL') next.hintsReveal += amount;
      return next;
    });
  }, [stats.coins, stats.hearts]);

  const handleOpenChest = useCallback(() => {
    const rewards = [100, 250, 500, 750, 1000];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    setBonusEarned(randomReward);
    updateStats({ 
      coins: stats.coins + randomReward,
      lastChestOpenTime: Date.now()
    });
  }, [stats.coins, setBonusEarned, updateStats]);

  const handleWatchVideo = useCallback(() => {
    if (stats.hearts < 5) {
      updateStats({ hearts: stats.hearts + 1 });
    }
  }, [stats.hearts, updateStats]);

  const handleLevelFail = useCallback(() => {
    updateStats({ hearts: Math.max(0, stats.hearts - 1) });
    changeGameState(GameState.LEVEL_FAIL);
  }, [stats.hearts, updateStats, changeGameState]);

  const handleExitWithPenalty = useCallback(() => {
    updateStats({ hearts: Math.max(0, stats.hearts - 1) });
    setReplayingLevel(null);
    changeGameState(GameState.HUB);
  }, [stats.hearts, updateStats, setReplayingLevel, changeGameState]);

  const handleStartGame = useCallback((levelId?: number) => {
    if (stats.hearts > 0) {
      setSessionScore(0);
      setReplayingLevel(levelId || null);
      
      const hasSeenTutorial = localStorage.getItem('eva_tutorial_seen');
      if (!hasSeenTutorial && stats.level === 1 && !levelId) {
        changeGameState(GameState.TUTORIAL);
      } else {
        changeGameState(GameState.WORD_PUZZLE);
      }
    } else {
      setHubSubView(HubSubView.SHOP);
    }
  }, [stats.hearts, stats.level, setSessionScore, setReplayingLevel, changeGameState, setHubSubView]);

  return {
    stats,
    setStats,
    updateStats,
    handleBuyItem,
    handleOpenChest,
    handleWatchVideo,
    handleLevelFail,
    handleExitWithPenalty,
    handleStartGame,
    handleApplyRisk
  };
};
