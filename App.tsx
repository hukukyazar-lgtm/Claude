
import React, { useState, useEffect } from 'react';
import { GameState, UserStats, HubSubView, Question } from './types';
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
import { SoundManager } from './managers/SoundManager';
import { ThemeProvider, useTheme } from './ThemeProvider';
import { PlanetProvider, usePlanets } from './PlanetProvider';
import { fetchQuestions } from './lib/supabase.ts';

// Hooks
import { useGameFlow } from './hooks/useGameFlow';
import { usePlayerEconomy } from './hooks/usePlayerEconomy';
import { useSyncManager } from './hooks/useSyncManager';
import { useMissions } from './hooks/useMissions';
import { useLeaderboard } from './hooks/useLeaderboard';
import { useGameUI } from './hooks/useGameUI';
import { useSettings } from './hooks/useSettings';

interface AppMainProps {
  stats: UserStats;
  sync: ReturnType<typeof useSyncManager>;
  flow: ReturnType<typeof useGameFlow>;
  economy: ReturnType<typeof usePlayerEconomy>;
  missions: ReturnType<typeof useMissions>;
  rank: ReturnType<typeof useLeaderboard>;
  ui: ReturnType<typeof useGameUI>;
  settings: ReturnType<typeof useSettings>;
  gameData: {
    questions: Question[];
    fullWordPool: string[];
    targetWords: string[];
    currentPlanetImage: string;
    handlePuzzleComplete: (earned: number, targets: string[], distractors: string[]) => void;
    handleGameComplete: (count: number) => void;
    handleGoToMenu: () => void;
    handleContinueNextLevel: () => void;
  };
  privacy: { showPrivacy: boolean; setShowPrivacy: (v: boolean) => void; };
}

const AppMain: React.FC<AppMainProps> = ({ stats, sync, flow, economy, missions, rank, ui, settings, gameData, privacy }) => {
  const { palette } = useTheme();
  const level = flow.replayingLevel || stats.level;

  const renderScreen = () => {
    switch (flow.gameState) {
      case GameState.SPLASH: return <SplashScreen onFinished={() => flow.changeGameState(GameState.LOADING)} />;
      case GameState.LOADING: return <LoadingScreen backgroundUrl={gameData.currentPlanetImage} onFinished={() => flow.changeGameState(GameState.HUB)} />;
      case GameState.HUB: return <HubScreen stats={stats} currentUser={sync.currentUser} isSyncing={sync.isSyncing} hubSubView={ui.hubSubView} setHubSubView={ui.setHubSubView} onStartGame={economy.handleStartGame} onAddCoins={(amt) => economy.updateStats({ coins: stats.coins + amt })} onBuyHearts={(c, a) => economy.handleBuyItem(c, 'HEART', a)} onBuyItem={economy.handleBuyItem} onWatchVideo={economy.handleWatchVideo} onOpenChest={() => ui.setShowChest(true)} onClaimMission={missions.handleClaimMission} levelStars={stats.levelStars} settings={settings.settings} onUpdateSettings={settings.onUpdateSettings} onOpenPrivacy={() => privacy.setShowPrivacy(true)} />;
      case GameState.WORD_PUZZLE: return <WordPuzzle stats={stats} level={level} questions={gameData.questions} onComplete={gameData.handlePuzzleComplete} onExit={economy.handleExitWithPenalty} onUpdateStats={economy.updateStats} />;
      case GameState.MEMORY_PREPARE: return (
        <MemoryTransitionModal 
          currentCoins={stats.coins}
          onConfirm={(bet) => {
            if (bet) economy.handleApplyRisk(bet);
            flow.changeGameState(GameState.MEMORY_GAME);
          }} 
          onExit={economy.handleExitWithPenalty} 
        />
      );
      case GameState.MEMORY_GAME: return <MemoryGame stats={stats} level={level} backgroundUrl="" words={gameData.fullWordPool} targetWords={gameData.targetWords} onNext={gameData.handleGameComplete} onFail={economy.handleLevelFail} onExit={economy.handleExitWithPenalty} onUpdateStats={economy.updateStats} initialScore={ui.sessionScore} />;
      case GameState.LEVEL_COMPLETE: return <LevelCompleteModal level={level} coinsEarned={ui.sessionScore + ui.bonusEarned} starsEarned={ui.starsEarnedInLevel} riskReward={ui.riskReward} onContinue={gameData.handleContinueNextLevel} onMenu={gameData.handleGoToMenu} />;
      case GameState.NEXT_LEVEL_TRANSITION: return <LevelTransition level={level} onFinished={() => flow.changeGameState(GameState.WORD_PUZZLE)} />;
      case GameState.LEVEL_FAIL: return <LevelFailModal hearts={stats.hearts} lastLifeRefillTime={stats.lastLifeRefillTime} onRetry={() => stats.hearts > 0 ? flow.changeGameState(GameState.WORD_PUZZLE) : ui.setHubSubView(HubSubView.SHOP)} onShop={() => { flow.changeGameState(GameState.HUB); ui.setHubSubView(HubSubView.SHOP); }} onExit={() => { flow.setReplayingLevel(null); flow.changeGameState(GameState.HUB); }} onWatchVideo={economy.handleWatchVideo} />;
      default: return <LoadingScreen backgroundUrl={gameData.currentPlanetImage} />;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden select-none">
      <div className="absolute inset-0 opacity-70 pointer-events-none mix-blend-color-dodge" style={{ backgroundImage: `linear-gradient(to top right, ${palette[0]}99 0%, ${palette[1]}77 25%, ${palette[2]}55 50%, ${palette[3]}33 75%, ${palette[4]}11 100%)` }} />
      <div className={`relative z-10 w-full h-full transition-all duration-500 ${flow.transitionState === 'animating' ? 'opacity-0 scale-95 blur-md' : 'opacity-100'}`}>
        {renderScreen()}
        {ui.showChest && <ChestModal onClose={() => ui.setShowChest(false)} onReward={economy.handleOpenChest} rewardAmount={ui.bonusEarned} />}
        <RankUpNotification data={rank.rankUpData} onClose={() => rank.setRankUpData(null)} />
        {rank.leaderboardRankData && <LeaderboardRankUpNotification newRank={rank.leaderboardRankData.newRank} oldRank={rank.leaderboardRankData.oldRank} onClose={() => rank.setLeaderboardRankData(null)} />}
        {privacy.showPrivacy && <PrivacyPolicyModal onClose={() => privacy.setShowPrivacy(false)} />}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const ui = useGameUI(); const flow = useGameFlow(); const settings = useSettings();
  const economy = usePlayerEconomy(ui.setSessionScore, ui.setBonusEarned, flow.setReplayingLevel, flow.changeGameState, ui.setHubSubView);
  const sync = useSyncManager(economy.stats, economy.setStats);
  const rank = useLeaderboard(economy.stats, sync.currentUser);
  const missions = useMissions(economy.stats, economy.updateStats, sync.currentUser, rank.checkLeaderboardRank);
  const [game, setGame] = useState<{ questions: Question[]; targetWords: string[]; prevTargets: string[]; fullWordPool: string[] }>({ 
    questions: [], targetWords: [], prevTargets: [], fullWordPool: [] 
  });
  const [showPrivacy, setShowPrivacy] = useState(false);
  const { planetImages } = usePlanets();

  useEffect(() => { 
    fetchQuestions().then(d => {
      if (d) setGame(p => ({...p, questions: d as Question[]}));
    });
  }, []);
  const currentPlanetImage = planetImages[(Math.ceil(economy.stats.level / 6) - 1) % planetImages.length] || planetImages[0];

  const handlePuzzleComplete = (earned: number, targets: string[], distractors: string[]) => {
    ui.setSessionScore(earned);
    setGame(p => ({...p, targetWords: targets}));

    // Deduplication logic for Memory Game word pool
    // Ensure targets are always included, then add unique distractors
    const extraDistractors = game.prevTargets.filter(w => !targets.includes(w) && !distractors.includes(w));
    const allUniqueDistractors = Array.from(new Set([...distractors, ...extraDistractors])).sort(() => 0.5 - Math.random());
    
    // Total 12 words: 5 targets + 7 unique distractors
    const finalPool = [...targets, ...allUniqueDistractors.slice(0, 7)].sort(() => 0.5 - Math.random());

    setGame(p => ({...p, fullWordPool: finalPool, prevTargets: targets})); 
    flow.changeGameState(GameState.MEMORY_PREPARE);
  };

  const handleGameComplete = (count: number) => {
    const actualCorrectCount = Math.min(5, count);
    const speedBonusCount = Math.max(0, count - 5);
    
    const stars = actualCorrectCount === 5 ? 3 : actualCorrectCount >= 4 ? 2 : 1; 
    let baseBonus = actualCorrectCount * 50;
    
    // Calculate total earned in this session
    let totalLvlCoins = ui.sessionScore + baseBonus + (speedBonusCount * 100);
    
    // RİSK DEĞERLENDİRMESİ
    const activeRisk = economy.stats.activeRisk;
    let riskRewardAmount = 0;
    if (activeRisk > 0) {
      if (stars === 3) {
        // Risk kazandı!
        const multiplier = activeRisk === 500 ? 5 : 3;
        riskRewardAmount = activeRisk * multiplier;
        totalLvlCoins += riskRewardAmount;
        SoundManager.getInstance().playJackpot();
      } else {
        // Risk kaybetti
        SoundManager.getInstance().playFire();
      }
    }

    // ADRENALİN MODU: Son candayken tüm ödüller 2 katı!
    const isAdrenaline = economy.stats.hearts === 1;
    if (isAdrenaline) {
      totalLvlCoins *= 2;
      riskRewardAmount *= 2; // Ödül de katlanır!
      SoundManager.getInstance().playJackpot();
    }

    ui.setStarsEarnedInLevel(stars);
    ui.setRiskReward(riskRewardAmount);
    ui.setBonusEarned(totalLvlCoins - ui.sessionScore);
    
    const lvl = flow.replayingLevel || economy.stats.level;
    const improvedStars = Math.max(0, stars - (economy.stats.levelStars[lvl] || 0));
    
    economy.setStats(p => ({ 
      ...p, 
      stars: p.stars + improvedStars, 
      coins: p.coins + totalLvlCoins, 
      activeRisk: 0, // Riski sıfırla
      levelStars: { ...p.levelStars, [lvl]: Math.max(p.levelStars[lvl] || 0, stars) } 
    }));
    
    flow.changeGameState(GameState.LEVEL_COMPLETE);
  };

  const gameData = { ...game, currentPlanetImage, handlePuzzleComplete, handleGameComplete, handleGoToMenu: () => { if (!flow.replayingLevel) economy.setStats(p => ({...p, level: p.level + 1, activeRisk: 0})); flow.setReplayingLevel(null); flow.changeGameState(GameState.HUB); }, handleContinueNextLevel: () => { if (!flow.replayingLevel) economy.setStats(p => ({...p, level: p.level + 1, activeRisk: 0})); flow.setReplayingLevel(null); flow.changeGameState(GameState.NEXT_LEVEL_TRANSITION); } };

  return (
    <ThemeProvider planetImageUrl={currentPlanetImage}>
      <AppMain stats={economy.stats} sync={sync} flow={flow} economy={economy} missions={missions} rank={rank} ui={ui} settings={settings} gameData={gameData} privacy={{showPrivacy, setShowPrivacy}} />
    </ThemeProvider>
  );
};

export default function App() { return <PlanetProvider><AppContent /></PlanetProvider>; }
