
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GameState, UserStats, HubSubView } from './types';
import { LoadingScreen } from './screens/LoadingScreen';
import { HubScreen } from './screens/HubScreen';
import { MemoryGame } from './screens/MemoryGame';
import { WordPuzzle } from './screens/WordPuzzle';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { LevelFailModal } from './components/LevelFailModal';
import { ChestModal } from './components/ChestModal';
import { MemoryTransitionModal } from './components/MemoryTransitionModal';
import { LevelTransition } from './components/LevelTransition';
import { SplashScreen } from './components/SplashScreen';
import { RankUpNotification } from './components/RankUpNotification';
import { LeaderboardRankUpNotification } from './components/LeaderboardRankUpNotification';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { auth, fetchCloudStats, syncUserStats, reconcileStats } from './lib/firebase.ts';
import { syncSupabaseStats, fetchSupabaseStats, fetchQuestions, fetchLeaderboard, toUUID } from './lib/supabase.ts';
import { onAuthStateChanged, User } from "firebase/auth";
import { ThemeProvider, useTheme } from './ThemeProvider';
import { PlanetProvider, usePlanets } from './PlanetProvider';
import { SoundManager } from './managers/SoundManager';

const STORAGE_KEY = 'lumina_stats';
const MISSIONS_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

const AppMain: React.FC<{
  stats: UserStats;
  setStats: React.Dispatch<React.SetStateAction<UserStats>>;
  currentUser: User | null;
  isSyncing: boolean;
  hubSubView: HubSubView;
  setHubSubView: React.Dispatch<React.SetStateAction<HubSubView>>;
  updateStats: (updates: Partial<UserStats>) => void;
  handleClaimMission: (id: number, reward: number) => void;
  handleStartGame: (levelId?: number) => void;
  handleExitWithPenalty: () => void;
  handlePuzzleComplete: (earned: number, allTargets: string[], allDistractors: string[]) => void;
  handleGameComplete: (correctCount: number) => void;
  handleLevelFail: () => void;
  handleWatchVideo: () => void;
  handleOpenChest: () => void;
  handleBuyItem: (cost: number, type: 'HEART' | 'FREEZE' | 'REVEAL', amount: number) => void;
  handleContinueNextLevel: () => void;
  questions: any[];
  gameState: GameState;
  changeGameState: (newState: GameState) => void;
  transitionState: 'idle' | 'animating';
  showChest: boolean;
  setShowChest: React.Dispatch<React.SetStateAction<boolean>>;
  bonusEarned: number;
  sessionScore: number;
  starsEarnedInLevel: number;
  fullWordPool: string[];
  targetWords: string[];
  currentPlanetImage: string;
  rankUpData: { title: string; color: string } | null;
  onCloseRankUp: () => void;
  leaderboardRankData: { newRank: number; oldRank: number | null } | null;
  onCloseLeaderboardRankUp: () => void;
  replayingLevel: number | null;
  setReplayingLevel: (level: number | null) => void;
  settings: any;
  onUpdateSettings: (s: any) => void;
  onOpenPrivacy: () => void;
  showPrivacy: boolean;
  setShowPrivacy: (v: boolean) => void;
}> = ({
  stats, setStats, currentUser, isSyncing, hubSubView, setHubSubView,
  updateStats, handleClaimMission, handleStartGame, handleExitWithPenalty,
  handlePuzzleComplete, handleGameComplete, handleLevelFail, handleWatchVideo,
  handleOpenChest, handleBuyItem, handleContinueNextLevel, questions, gameState, changeGameState,
  transitionState, showChest, setShowChest, bonusEarned, sessionScore,
  starsEarnedInLevel, fullWordPool, targetWords, currentPlanetImage,
  rankUpData, onCloseRankUp, leaderboardRankData, onCloseLeaderboardRankUp,
  replayingLevel, setReplayingLevel, settings, onUpdateSettings,
  onOpenPrivacy,
  showPrivacy,
  setShowPrivacy
}) => {
  const { palette } = useTheme();

  const renderScreen = () => {
    switch (gameState) {
      case GameState.SPLASH: return <SplashScreen onFinished={() => changeGameState(GameState.LOADING)} />;
      case GameState.LOADING: return <LoadingScreen backgroundUrl={currentPlanetImage} onFinished={() => changeGameState(GameState.HUB)} />;
      case GameState.HUB: return <HubScreen stats={stats} currentUser={currentUser} isSyncing={isSyncing} hubSubView={hubSubView} setHubSubView={setHubSubView} onStartGame={handleStartGame} onAddCoins={(amt) => updateStats({ coins: stats.coins + amt })} onBuyHearts={(c, a) => handleBuyItem(c, 'HEART', a)} onBuyItem={handleBuyItem} onWatchVideo={handleWatchVideo} onOpenChest={() => setShowChest(true)} onClaimMission={handleClaimMission} levelStars={stats.levelStars} settings={settings} onUpdateSettings={onUpdateSettings} onOpenPrivacy={onOpenPrivacy} />;
      case GameState.WORD_PUZZLE: return <WordPuzzle stats={stats} level={replayingLevel || stats.level} questions={questions} onComplete={handlePuzzleComplete} onExit={handleExitWithPenalty} onUpdateStats={updateStats} />;
      case GameState.MEMORY_PREPARE: return <MemoryTransitionModal onConfirm={() => changeGameState(GameState.MEMORY_GAME)} onExit={handleExitWithPenalty} />;
      case GameState.MEMORY_GAME: return <MemoryGame stats={stats} level={replayingLevel || stats.level} backgroundUrl="" words={fullWordPool} targetWords={targetWords} onNext={handleGameComplete} onFail={handleLevelFail} onExit={handleExitWithPenalty} onUpdateStats={updateStats} initialScore={sessionScore} />;
      case GameState.LEVEL_COMPLETE: return <LevelCompleteModal level={replayingLevel || stats.level} coinsEarned={sessionScore + bonusEarned} starsEarned={starsEarnedInLevel} onContinue={handleContinueNextLevel} onMenu={() => { if (!replayingLevel) { setStats(p => ({...p, level: p.level + 1})); } setReplayingLevel(null); changeGameState(GameState.HUB); }} />;
      case GameState.NEXT_LEVEL_TRANSITION: return <LevelTransition level={replayingLevel || stats.level} onFinished={() => changeGameState(GameState.WORD_PUZZLE)} />;
      case GameState.LEVEL_FAIL: return <LevelFailModal hearts={stats.hearts} lastLifeRefillTime={stats.lastLifeRefillTime} onRetry={() => { if(stats.hearts > 0) changeGameState(GameState.WORD_PUZZLE); else setHubSubView(HubSubView.SHOP); }} onShop={() => { changeGameState(GameState.HUB); setHubSubView(HubSubView.SHOP); }} onExit={() => { setReplayingLevel(null); changeGameState(GameState.HUB); }} onWatchVideo={handleWatchVideo} />;
      default: return <LoadingScreen backgroundUrl={currentPlanetImage} />;
    }
  };

  const currentGradient = `linear-gradient(to top right, ${palette[0]}99 0%, ${palette[1]}77 25%, ${palette[2]}55 50%, ${palette[3]}33 75%, ${palette[4]}11 100%)`;

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none">
      {/* Dinamik Renk Katmanı - Gezegenden sağ üst köşeye 5 renkli geçiş */}
      <div 
        className="absolute inset-0 opacity-70 pointer-events-none mix-blend-color-dodge"
        style={{ backgroundImage: currentGradient }}
      />
      
      {/* İkinci bir katman - Daha yumuşak bir overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: `radial-gradient(circle_at_50%_120%, ${palette[0]} 0%, transparent 70%)` }}
      />
      
      <div className={`relative z-10 w-full h-full transition-all duration-500 ease-out ${transitionState === 'animating' ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'}`}>
        {renderScreen()}
        {showChest && <ChestModal onClose={() => setShowChest(false)} onReward={handleOpenChest} rewardAmount={bonusEarned} />}
        <RankUpNotification data={rankUpData} onClose={onCloseRankUp} />
        {leaderboardRankData && (
          <LeaderboardRankUpNotification 
            newRank={leaderboardRankData.newRank} 
            oldRank={leaderboardRankData.oldRank} 
            onClose={onCloseLeaderboardRankUp} 
          />
        )}
      </div>

      <AnimatePresence>
        {showPrivacy && <PrivacyPolicyModal onClose={() => setShowPrivacy(false)} />}
      </AnimatePresence>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SPLASH);
  const [hubSubView, setHubSubView] = useState<HubSubView>(HubSubView.MAIN);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { planetImages } = usePlanets();
  
  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          levelStars: parsed.levelStars || {}
        };
      } catch (e) { console.error(e); }
    }
    return {
      coins: 2063, hearts: 5, stars: 12, level: 1,
      lastLifeRefillTime: Date.now(),
      hintsFreeze: 3, hintsReveal: 3,
      claimedMissions: [],
      lastMissionsRefresh: Date.now(),
      lastChestOpenTime: 0,
      difficultyFactor: 1.0, performanceHistory: [],
      streak: 0, maxStreak: 0,
      levelStars: {}
    };
  });

  const planetId = Math.ceil(stats.level / 6);
  const currentPlanetImage = planetImages[(planetId - 1) % planetImages.length] || planetImages[0];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setIsSyncing(true);
        // Firebase sync
        const cloudData = await fetchCloudStats(user.uid);
        if (cloudData) {
          const merged = reconcileStats(stats, cloudData);
          setStats(merged);
        }
        setIsSyncing(false);
      }
    });
    return () => unsubscribe();
  }, []);

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
      }, 1000); // Debounce süresini 1 saniyeye indirdim
      return () => clearTimeout(timeout);
    }
  }, [stats, currentUser]);

  useEffect(() => {
    const now = Date.now();
    if (now - stats.lastMissionsRefresh >= MISSIONS_REFRESH_INTERVAL) {
      setStats(prev => ({
        ...prev,
        claimedMissions: [],
        lastMissionsRefresh: now
      }));
    }
  }, [stats.lastMissionsRefresh]);

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
  }, [stats.hearts, stats.lastLifeRefillTime]);

  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [previousTargetWords, setPreviousTargetWords] = useState<string[]>([]);
  const [fullWordPool, setFullWordPool] = useState<string[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showChest, setShowChest] = useState(false);
  const [bonusEarned, setBonusEarned] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [starsEarnedInLevel, setStarsEarnedInLevel] = useState(0);
  const [transitionState, setTransitionState] = useState<'idle' | 'animating'>('idle');
  const [rankUpData, setRankUpData] = useState<{ title: string; color: string } | null>(null);
  const [leaderboardRankData, setLeaderboardRankData] = useState<{ newRank: number; oldRank: number | null } | null>(null);
  const [currentRank, setCurrentRank] = useState<number | null>(null);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (currentUser && stats.level > 0) {
      checkLeaderboardRank(stats);
    }
  }, [currentUser]);

  const changeGameState = (newState: GameState) => {
    setTransitionState('animating');
    setTimeout(() => {
      setGameState(newState);
      setTransitionState('idle');
    }, 300);
  };

  const updateStats = (updates: Partial<UserStats>) => {
    setStats(prev => ({ ...prev, ...updates }));
  };

  const checkLeaderboardRank = async (newStats: UserStats) => {
    if (!currentUser) return;
    
    try {
      const data = await fetchLeaderboard();
      const botNames = ["Nova", "Astro", "Cosmo", "Stellar", "Nebula", "Orion", "Lyra", "Vega", "Altair", "Sirius"];
      const score = (newStats.level * 1000) + (newStats.stars * 50) + Math.floor(newStats.coins / 10);
      
      const bots = botNames.map((name, index) => ({
        user_id: `bot-${index}`,
        score: 50000 - (index * 1200) + Math.floor(Math.random() * 500)
      }));

      const combined = [...(data || []), ...bots].sort((a, b) => (b.score || 0) - (a.score || 0));
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
  };

  const handleClaimMission = (id: number, reward: number) => {
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
  };

  const [replayingLevel, setReplayingLevel] = useState<number | null>(null);
  const [settings, setSettings] = useState({
    music: true,
    sound: true,
    highQuality: true
  });

  // Ayarları yükle ve uygula
  useEffect(() => {
    const saved = localStorage.getItem('lumina_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        const sm = SoundManager.getInstance();
        sm.setMusicEnabled(parsed.music);
        sm.setSoundEnabled(parsed.sound);
        document.documentElement.setAttribute('data-quality', parsed.highQuality ? 'high' : 'low');
      } catch (e) {
        console.error("Settings load error:", e);
      }
    }
  }, []);

  const handleUpdateSettings = (newSettings: any) => {
    setSettings(newSettings);
    localStorage.setItem('lumina_settings', JSON.stringify(newSettings));
    const sm = SoundManager.getInstance();
    sm.setMusicEnabled(newSettings.music);
    sm.setSoundEnabled(newSettings.sound);
    document.documentElement.setAttribute('data-quality', newSettings.highQuality ? 'high' : 'low');
  };

  const handleStartGame = (levelId?: number) => {
    if (stats.hearts > 0) {
      setSessionScore(0);
      setReplayingLevel(levelId || null);
      changeGameState(GameState.WORD_PUZZLE);
    } else {
      setHubSubView(HubSubView.SHOP);
    }
  };

  const handleExitWithPenalty = () => {
    updateStats({ hearts: Math.max(0, stats.hearts - 1) });
    setReplayingLevel(null);
    changeGameState(GameState.HUB);
  };

  const handlePuzzleComplete = (earned: number, allTargets: string[], allDistractors: string[]) => {
    setSessionScore(earned);
    
    // 5 Güncel Hedef Kelime
    setTargetWords(allTargets);
    
    // 5 Rastgele Çeldirici (Bulmacadan gelenler içinden)
    const shuffledDistractors = [...allDistractors].sort(() => Math.random() - 0.5).slice(0, 5);
    
    // 5 Bir Önceki Seviyenin Hedef Kelimeleri (Eğer yoksa mevcut çeldiricilerden ekle ki 15 olsun)
    let prevTargets = [...previousTargetWords];
    if (prevTargets.length < 5) {
      // İlk seviyelerde veya eksiklikte geri kalanları yine çeldiricilerden tamamla
      const moreDistractors = [...allDistractors]
        .filter(w => !shuffledDistractors.includes(w) && !allTargets.includes(w))
        .sort(() => Math.random() - 0.5)
        .slice(0, 5 - prevTargets.length);
      prevTargets = [...prevTargets, ...moreDistractors];
    }
    prevTargets = prevTargets.slice(0, 5);

    // Toplam 15 Kelime Havuzu oluştur ve karıştır
    const pooledWords = [...allTargets, ...shuffledDistractors, ...prevTargets].sort(() => Math.random() - 0.5);
    
    setFullWordPool(pooledWords);
    
    // Bir sonraki seviye için mevcut hedefleri "önceki" olarak sakla
    setPreviousTargetWords(allTargets);
    
    changeGameState(GameState.MEMORY_PREPARE);
  };

  const handleGameComplete = (correctCount: number) => {
    let stars = correctCount === 5 ? 3 : correctCount >= 4 ? 2 : 1;
    let bonus = correctCount * 50;
    setStarsEarnedInLevel(stars);
    setBonusEarned(bonus);
    
    const targetLevel = replayingLevel || stats.level;
    const currentLevelStars = stats.levelStars[targetLevel] || 0;
    const improvedStars = Math.max(0, stars - currentLevelStars);

    // Puan kazanınca hemen senkronizasyonu tetikle
    if (currentUser) {
      const newLevelStars = { ...stats.levelStars, [targetLevel]: Math.max(currentLevelStars, stars) };
      const newStats = { 
        ...stats, 
        stars: stats.stars + improvedStars, 
        coins: stats.coins + sessionScore + bonus,
        levelStars: newLevelStars
      };
      syncSupabaseStats(currentUser.uid, newStats, currentUser.displayName || "", currentUser.photoURL || "");
      checkLeaderboardRank(newStats);
    }
    
    setStats(prev => ({
      ...prev,
      stars: prev.stars + improvedStars,
      coins: prev.coins + sessionScore + bonus,
      levelStars: { ...prev.levelStars, [targetLevel]: Math.max(currentLevelStars, stars) }
    }));

    changeGameState(GameState.LEVEL_COMPLETE);
  };

  const handleLevelFail = () => {
    updateStats({ hearts: Math.max(0, stats.hearts - 1) });
    changeGameState(GameState.LEVEL_FAIL);
  };

  const handleWatchVideo = () => {
    if (stats.hearts < 5) {
      updateStats({ hearts: stats.hearts + 1 });
    }
  };

  const handleOpenChest = () => {
    const rewards = [100, 250, 500, 750, 1000];
    const randomReward = rewards[Math.floor(Math.random() * rewards.length)];
    setBonusEarned(randomReward);
    updateStats({ 
      coins: stats.coins + randomReward,
      lastChestOpenTime: Date.now()
    });
  };

  const handleBuyItem = (cost: number, type: 'HEART' | 'FREEZE' | 'REVEAL', amount: number) => {
    if (stats.coins < cost) return;
    if (type === 'HEART' && stats.hearts >= 5) return;
    
    setStats(prev => {
      const next = { ...prev, coins: prev.coins - cost };
      if (type === 'HEART') next.hearts = Math.min(5, prev.hearts + amount);
      if (type === 'FREEZE') next.hintsFreeze += amount;
      if (type === 'REVEAL') next.hintsReveal += amount;
      return next;
    });
  };

  const handleContinueNextLevel = () => {
    if (!replayingLevel) {
      setStats(prev => ({ ...prev, level: prev.level + 1 }));
    }
    setReplayingLevel(null);
    changeGameState(GameState.NEXT_LEVEL_TRANSITION);
  };

  useEffect(() => {
    const loadInitialData = async () => {
      const qData = await fetchQuestions();
      if (qData) setQuestions(qData);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const sys = Math.ceil(stats.level / 6);
    const titleIdx = sys - 1;
    const titles = ["GÖZLEMCİ", "KAYITÇI", "ANIMSATICI", "ARŞİVCİ", "MUHAFIZ", "ODAKLAYICI", "KODLAYICI", "GERİÇAĞIRICI", "SIR-KÂŞİFİ", "MUTLAK BELLEK"];
    const colors = ["#94a3b8", "#64748b", "#22d3ee", "#06b6d4", "#818cf8", "#6366f1", "#f472b6", "#d946ef", "#fbbf24", "#ffffff"];
    
    const currentTitle = titles[Math.min(titleIdx, titles.length - 1)];
    const currentColor = colors[Math.min(titleIdx, colors.length - 1)];

    const lastTitle = localStorage.getItem('lumina_last_title');
    if (lastTitle && lastTitle !== currentTitle) {
      setRankUpData({ title: currentTitle, color: currentColor });
    }
    localStorage.setItem('lumina_last_title', currentTitle);
  }, [stats.level]);

  return (
    <ThemeProvider planetImageUrl={currentPlanetImage}>
      <AppMain 
        stats={stats} setStats={setStats} currentUser={currentUser} isSyncing={isSyncing}
        hubSubView={hubSubView} setHubSubView={setHubSubView} updateStats={updateStats}
        handleClaimMission={handleClaimMission} handleStartGame={handleStartGame}
        handleExitWithPenalty={handleExitWithPenalty} handlePuzzleComplete={handlePuzzleComplete}
        handleGameComplete={handleGameComplete} handleLevelFail={handleLevelFail}
        handleWatchVideo={handleWatchVideo} handleOpenChest={handleOpenChest}
        handleBuyItem={handleBuyItem} handleContinueNextLevel={handleContinueNextLevel} questions={questions} gameState={gameState}
        changeGameState={changeGameState} transitionState={transitionState}
        showChest={showChest} setShowChest={setShowChest} bonusEarned={bonusEarned}
        sessionScore={sessionScore} starsEarnedInLevel={starsEarnedInLevel}
        fullWordPool={fullWordPool} targetWords={targetWords}
        currentPlanetImage={currentPlanetImage}
        rankUpData={rankUpData}
        onCloseRankUp={() => setRankUpData(null)}
        leaderboardRankData={leaderboardRankData}
        onCloseLeaderboardRankUp={() => setLeaderboardRankData(null)}
        replayingLevel={replayingLevel}
        setReplayingLevel={setReplayingLevel}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onOpenPrivacy={() => setShowPrivacy(true)}
        showPrivacy={showPrivacy}
        setShowPrivacy={setShowPrivacy}
      />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <PlanetProvider>
      <AppContent />
    </PlanetProvider>
  );
};

export default App;
