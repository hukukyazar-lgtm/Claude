
import React, { useMemo } from 'react';
import { UserStats, HubSubView } from '../types';
import { Header } from '../components/Header';
import { ParticleBackground } from '../components/ParticleBackground';
import { PlanetMenuModal } from '../components/PlanetMenuModal';
import { SettingsModal } from '../components/SettingsModal';
import { ProfileModal } from '../components/ProfileModal';
import { RankingModal } from '../components/RankingModal';
import { ShopModal } from '../components/ShopModal';
import { MissionsModal } from '../components/MissionsModal';
import { Portal3D } from '../components/Portal3D';
import { Button } from '../components/Button';
import { User as FirebaseUser } from "firebase/auth";
import { Map, Trophy, Play, ClipboardList, ShoppingBag, Gift, Tv, ChevronRight, Settings } from 'lucide-react';
import { usePlanets } from '../PlanetProvider';
import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';

interface HubScreenProps {
  stats: UserStats;
  currentUser: FirebaseUser | null;
  isSyncing: boolean;
  hubSubView: HubSubView;
  setHubSubView: (view: HubSubView) => void;
  onStartGame: (levelId?: number) => void;
  onAddCoins: (amount: number) => void;
  onBuyHearts: (cost: number, amount: number) => void;
  onBuyItem: (cost: number, type: 'HEART' | 'FREEZE' | 'REVEAL', amount: number) => void;
  onWatchVideo: () => void;
  onOpenChest: () => void;
  onClaimMission: (id: number, reward: number) => void;
  levelStars: Record<number, number>;
  settings: any;
  onUpdateSettings: (s: any) => void;
  onOpenPrivacy: () => void;
}

const NavItem = ({ active, color, icon: Icon, noBg }: { active: boolean, color: string, icon?: any, noBg?: boolean }) => (
  <div className={`transition-all duration-500 relative flex items-center justify-center ${active ? 'scale-110' : 'scale-100'}`}>
    <AnimatePresence>
      {active && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.2 }}
          exit={{ scale: 0, opacity: 0 }}
          className="absolute inset-[-20px] blur-2xl rounded-full" 
          style={{ backgroundColor: color }} 
        />
      )}
    </AnimatePresence>
    <div 
      className={`relative z-10 p-3.5 rounded-2xl transition-all duration-500 flex items-center justify-center overflow-hidden ${active && !noBg ? 'glass-morphism-bright border-white/30 shadow-xl' : ''}`}
    >
      {noBg && (
        <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-25deg] group-hover:animate-[shimmer_1.5s_infinite]" />
      )}
      {typeof Icon === 'string' ? Icon : <Icon className={`transition-all duration-500 ${noBg ? 'w-9 h-9' : 'w-7 h-7'} ${active ? 'opacity-100 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'opacity-60 scale-100'}`} style={{ color: active ? color : '#fff' }} />}
    </div>
  </div>
);

// @ts-ignore: Updated functional component to include new props
export const HubScreen: React.FC<HubScreenProps> = ({ 
  stats, 
  currentUser,
  isSyncing,
  hubSubView, 
  setHubSubView, 
  onStartGame, 
  onAddCoins, 
  onBuyHearts,
  onBuyItem,
  onWatchVideo,
  onOpenChest, 
  onClaimMission, 
  levelStars,
  settings,
  onUpdateSettings,
  onOpenPrivacy
}) => {
  const { palette } = useTheme();
  const { planetImages, planetNames } = usePlanets();
  const isMain = hubSubView === HubSubView.MAIN;
  
  const isLeftSideView = hubSubView === HubSubView.PLANETS || hubSubView === HubSubView.RANKING || hubSubView === HubSubView.SETTINGS;
  const isRightSideView = hubSubView === HubSubView.SHOP || hubSubView === HubSubView.MISSIONS || hubSubView === HubSubView.PROFILE;

  const stageTransform = isLeftSideView ? 'translateX(100%)' : isRightSideView ? 'translateX(-100%)' : 'translateX(0)';

  const navItems = [
    { view: HubSubView.PLANETS, color: palette[0], icon: Map },
    { view: HubSubView.RANKING, color: palette[4] || palette[0], icon: Trophy },
    { view: HubSubView.MAIN, isCustom: true, color: palette[0], icon: Play },
    { view: HubSubView.MISSIONS, color: palette[1] || palette[0], icon: ClipboardList },
    { view: HubSubView.SETTINGS, color: palette[3] || palette[0], icon: Settings },
  ];

  const planetId = Math.ceil(stats.level / 6);
  const currentPlanetImage = planetImages[(planetId - 1) % planetImages.length] || planetImages[0];

  const planetInfo = useMemo(() => {
    const BASE_NAMES = ["DÜNYA", "MARS", "VENÜS", "MERKÜR", "JÜPİTER", "SATÜRN", "URANÜS", "NEPTÜN", "PLÜTON", "LUMINA"];
    const planetId = Math.ceil(stats.level / 6);
    const i = planetId - 1;
    
    const current = planetId >= 100 ? "LUMINA" : (planetNames[planetId] || BASE_NAMES[i % (BASE_NAMES.length - 1)]);
    const source = planetId >= 100 ? "LUMINA" : (planetNames[planetId] || BASE_NAMES[i % (BASE_NAMES.length - 1)]);
    const target = planetId >= 99 ? "LUMINA" : (planetNames[planetId + 1] || BASE_NAMES[(i + 1) % (BASE_NAMES.length - 1)]);
    
    return { current, source, target };
  }, [stats.level, planetNames]);

  const isChestAvailable = useMemo(() => {
    if (!stats.lastChestOpenTime) return true;
    const lastOpen = new Date(stats.lastChestOpenTime);
    const now = new Date();
    return lastOpen.getDate() !== now.getDate() || 
           lastOpen.getMonth() !== now.getMonth() || 
           lastOpen.getFullYear() !== now.getFullYear();
  }, [stats.lastChestOpenTime]);

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-transparent">
      <ParticleBackground themeColor={palette[0]} />

      {/* Subtle Radial Vignette for legibility - Matching Loading Screen */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_transparent_0%,_rgba(2,6,23,0.4)_70%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(56,189,248,0.15)_0%,_transparent_60%)] animate-pulse z-0" />

      {/* Planet Background */}
      <motion.div 
        animate={{ 
          opacity: isMain ? 1 : 0,
          scale: isMain ? 1 : 0.9,
          filter: isMain ? 'blur(0px)' : 'blur(10px)'
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute top-1/2 -translate-y-1/2 -right-[15%] w-[85vh] h-[85vh] pointer-events-none z-[1]"
      >
         <div className="w-full h-full relative planet-tilt rounded-full overflow-hidden">
           <img 
             src={currentPlanetImage} 
             alt="" 
             className="w-full h-full object-cover brightness-125 contrast-110 animate-planet-rotate scale-110"
             style={{ 
               clipPath: 'circle(48%)',
               maskImage: 'radial-gradient(circle, black 65%, transparent 75%)',
               WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 75%)'
             }}
             referrerPolicy="no-referrer"
             crossOrigin="anonymous"
           />
         </div>
      </motion.div>

      {/* Header & Side Buttons */}
      <div className={`transition-all duration-700 fixed top-0 left-0 right-0 ${!isMain ? 'z-[50] opacity-0 pointer-events-none -translate-y-10' : 'z-[250] opacity-100 pointer-events-auto translate-y-0'}`}>
        <Header 
          stats={stats} 
          userPhoto={currentUser?.photoURL}
          isSyncing={isSyncing}
          onSettings={() => setHubSubView(HubSubView.SETTINGS)} 
          onProfile={() => setHubSubView(HubSubView.PROFILE)} 
          onShop={() => setHubSubView(HubSubView.SHOP)} 
        />
        
        <div className="absolute top-36 left-6 flex flex-col gap-4 z-[40] pointer-events-auto">
          {isChestAvailable && (
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onOpenChest}
              className="w-12 h-12 flex items-center justify-center glass-morphism border-white/10 rounded-2xl group relative shadow-2xl"
            >
               <Gift className="w-6 h-6 text-white/60 group-hover:text-amber-400 transition-colors relative z-10" />
               <div className="absolute inset-0 bg-amber-400/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
            </motion.button>
          )}
        </div>

        {/* Galaxy Progress Bar */}
        <div className="absolute top-[120px] left-1/2 -translate-x-1/2 z-[250] w-full max-w-[90vw] sm:max-w-none px-4">
          <div className="flex items-center justify-center gap-2 sm:gap-4 overflow-hidden">
            <span 
              className="text-[10px] sm:text-xs md:text-sm font-[900] text-white uppercase tracking-[0.1em] italic shrink-0 truncate max-w-[80px] sm:max-w-[120px] text-right drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              title={planetInfo.source}
            >
              {planetInfo.source}
            </span>
            
            <div className="w-32 sm:w-48 md:w-64 h-3 sm:h-3.5 bg-white/5 rounded-full overflow-hidden border border-white/10 backdrop-blur-xl relative shadow-inner shrink-0">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${((stats.level - 1) % 6) / 6 * 100}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>

            <span 
              className="text-[10px] sm:text-xs md:text-sm font-[900] text-white/70 uppercase tracking-[0.1em] italic shrink-0 truncate max-w-[80px] sm:max-w-[120px] text-left drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              title={planetInfo.target}
            >
              {planetInfo.target}
            </span>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <div className="flex-1 w-full relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-[150]" style={{ transform: stageTransform }}>
        
        {/* Left Side Modals */}
        <div className="absolute inset-0 -left-full w-full z-[160] overflow-hidden bg-transparent shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
          {hubSubView === HubSubView.PLANETS && <PlanetMenuModal onClose={() => setHubSubView(HubSubView.MAIN)} onStartGame={onStartGame} currentLevel={stats.level} levelStars={stats.levelStars} />}
          {hubSubView === HubSubView.RANKING && <RankingModal onClose={() => setHubSubView(HubSubView.MAIN)} stats={stats} currentUser={currentUser} isSyncing={isSyncing} />}
          {hubSubView === HubSubView.SETTINGS && <SettingsModal onClose={() => setHubSubView(HubSubView.MAIN)} settings={settings} onUpdateSettings={onUpdateSettings} onOpenPrivacy={onOpenPrivacy} />}
        </div>
        
        {/* Center Content */}
        <div className={`w-full h-full flex flex-col items-center transition-all duration-700 z-[10] ${!isMain ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
            <div className="flex-1 w-full flex flex-col items-center justify-center p-8 relative">
               <Portal3D level={stats.level} active={isMain} variant="full" />
            </div>
        </div>

        {/* Right Side Modals */}
        <div className="absolute inset-0 left-full w-full z-[160] overflow-hidden bg-transparent shadow-[-20px_0_40px_rgba(0,0,0,0.5)]">
          {hubSubView === HubSubView.SHOP && (
            <ShopModal 
              coins={stats.coins} 
              hearts={stats.hearts}
              onBuyHearts={onBuyItem} 
              onWatchVideo={onWatchVideo}
              onClose={() => setHubSubView(HubSubView.MAIN)} 
            />
          )}
          {hubSubView === HubSubView.PROFILE && <ProfileModal level={stats.level} stats={stats} onClose={() => setHubSubView(HubSubView.MAIN)} />}
          {hubSubView === HubSubView.MISSIONS && <MissionsModal onClose={() => setHubSubView(HubSubView.MAIN)} stats={stats} onClaimReward={onClaimMission} />}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className={`absolute bottom-6 sm:bottom-10 left-0 right-0 h-[80px] sm:h-[90px] z-[200] pb-safe bg-transparent transition-all duration-700 ${!isMain ? 'translate-y-32 opacity-0' : 'translate-y-0 opacity-100'}`}>
          <nav className="mx-auto max-w-[360px] h-full flex px-4 sm:px-6 items-center justify-between glass-morphism rounded-[32px] sm:rounded-[36px] border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
              {navItems.map((item, idx) => (
                <motion.button 
                  key={idx} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    if (item.isCustom) {
                      onStartGame();
                    } else {
                      setHubSubView(item.view as HubSubView);
                    }
                  }} 
                  className={`flex items-center justify-center relative transition-all duration-500 group ${item.isCustom ? 'w-16 h-16 sm:w-20 sm:h-20 translate-y-0 bg-gradient-to-br from-white/20 to-white/5 glass-morphism-bright rounded-[24px] sm:rounded-[30px] shadow-[0_0_30px_rgba(255,255,255,0.2)] border-white/40 ring-2 ring-white/20' : 'w-12 h-12 sm:w-14 sm:h-14'}`}
                >
                  {item.isCustom && (
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-white rounded-[24px] sm:rounded-[30px] blur-xl"
                    />
                  )}
                  <NavItem active={hubSubView === item.view} color={item.color || '#fff'} icon={item.icon} noBg={item.isCustom} />
                </motion.button>
              ))}
          </nav>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
