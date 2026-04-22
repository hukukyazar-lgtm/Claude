
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from './Button';
import { Cube3D } from './Cube3D';
import { Sphere3D } from './Sphere3D';
import { SoundManager } from '../managers/SoundManager';
import { usePlanets } from '../PlanetProvider';
import { Coins, Star, Trophy, Orbit, ArrowRight, Sparkles, Crown, MapPin, Rocket, Zap } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';

interface LevelCompleteModalProps {
  level: number;
  coinsEarned: number;
  starsEarned: number;
  onContinue: () => void;
  onMenu: () => void;
}

const BASE_NAMES = ["DÜNYA", "MARS", "VENÜS", "MERKÜR", "JÜPİTER", "SATÜRN", "URANÜS", "NEPTÜN", "PLÜTON", "LUMINA"];

const SuccessParticles = ({ intense = false }: { intense?: boolean }) => {
  const { palette } = useTheme();
  const count = intense ? 60 : 30;
  const particles = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * (intense ? 10 : 5) + 3,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 2,
    color: palette[i % palette.length],
    angle: Math.random() * 360,
    distance: Math.random() * 300 + 100
  })), [palette, intense, count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map(p => (
        <motion.div 
          key={p.id}
          initial={{ top: '50%', left: '50%', opacity: 0, scale: 0 }}
          animate={{ 
            top: [`${50}%`, `${50 + Math.sin(p.angle * Math.PI / 180) * 100}%`],
            left: [`${50}%`, `${50 + Math.cos(p.angle * Math.PI / 180) * 100}%`],
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1, 0],
            rotate: 360
          }}
          transition={{ 
            duration: p.duration, 
            repeat: Infinity, 
            delay: p.delay,
            ease: "easeOut"
          }}
          className="absolute"
        >
          <div 
            className="rounded-full blur-[1px]" 
            style={{ 
              width: p.size, 
              height: p.size, 
              backgroundColor: p.color,
              boxShadow: `0 0 15px ${p.color}, 0 0 30px ${p.color}88`
            }} 
          />
        </motion.div>
      ))}
    </div>
  );
};

const PlanetDiscoveryOverlay: React.FC<{ planetName: string, planetImage: string, onComplete: () => void }> = ({ planetName, planetImage, onComplete }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[4000] bg-black flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Hyperdrive Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0, x: '50%', y: '50%', opacity: 0 }}
            animate={{ 
              scaleX: [0, 20, 0],
              x: [`${50}%`, `${50 + (Math.random() - 0.5) * 200}%`],
              y: [`${50}%`, `${50 + (Math.random() - 0.5) * 200}%`],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "circIn"
            }}
            className="absolute w-1 h-[1px] bg-white blur-[1px]"
            style={{ transformOrigin: 'left center' }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0, rotate: -180, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 50, delay: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative w-64 h-64 sm:w-96 sm:h-96 mb-12">
          <motion.div 
            animate={{ 
              boxShadow: [
                "0 0 50px rgba(56,189,248,0.3)",
                "0 0 100px rgba(56,189,248,0.6)",
                "0 0 50px rgba(56,189,248,0.3)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-cyan-500/20 blur-3xl" 
          />
          <motion.img 
            src={planetImage}
            alt={planetName}
            className="w-full h-full object-cover rounded-full shadow-2xl relative z-10"
            initial={{ filter: 'brightness(0) blur(20px)' }}
            animate={{ filter: 'brightness(1.2) blur(0px)' }}
            transition={{ duration: 2, delay: 1 }}
            referrerPolicy="no-referrer"
          />
        </div>

        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
          className="text-center"
        >
          <h2 className="text-cyan-400 font-black text-xl tracking-[1em] mb-4 uppercase">YENİ DÜNYA KEŞFEDİLDİ</h2>
          <h1 className="text-white font-black text-6xl sm:text-8xl tracking-tighter uppercase italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">{planetName}</h1>
        </motion.div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        onClick={onComplete}
        className="absolute bottom-12 px-12 py-4 bg-white text-black font-black rounded-full tracking-widest hover:scale-110 transition-transform z-20"
      >
        İNİŞ YAP
      </motion.button>
    </motion.div>
  );
};

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({ 
  level, 
  coinsEarned, 
  starsEarned,
  onContinue,
  onMenu
}) => {
  const { palette } = useTheme();
  const { planetImages, planetNames } = usePlanets();
  const [visibleStars, setVisibleStars] = useState(0);
  const [displayCoins, setDisplayCoins] = useState(0);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [hasShownDiscovery, setHasShownDiscovery] = useState(false);

  const currentSystemIndex = Math.floor((level - 1) / 6);
  const nextSystemIndex = currentSystemIndex + 1;
  const isSystemFinalLevel = level % 6 === 0;
  
  const currentPlanetId = currentSystemIndex + 1;
  const nextPlanetId = nextSystemIndex + 1;

  const currentSystemName = planetNames[currentPlanetId] || BASE_NAMES[currentSystemIndex % BASE_NAMES.length];
  const nextSystemName = planetNames[nextPlanetId] || BASE_NAMES[nextSystemIndex % BASE_NAMES.length];
  const nextSystemColor = palette[nextSystemIndex % palette.length];
  
  const currentPlanetImage = planetImages[(currentPlanetId - 1) % planetImages.length];
  const nextPlanetImage = planetImages[(nextPlanetId - 1) % planetImages.length];

  const progressInSystem = ((level - 1) % 6) + 1;

  useEffect(() => {
    SoundManager.getInstance().playJackpot();

    let starTimer: NodeJS.Timeout;
    let coinTimer: NodeJS.Timeout;

    if (isSystemFinalLevel && !hasShownDiscovery) {
      const discoveryTimer = setTimeout(() => {
        setShowDiscovery(true);
        setHasShownDiscovery(true);
      }, 3000);
      return () => clearTimeout(discoveryTimer);
    }

    starTimer = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        if (count < starsEarned) {
          count++;
          setVisibleStars(count);
          SoundManager.getInstance().playPop();
        } else {
          clearInterval(interval);
        }
      }, 400);
      return () => clearInterval(interval);
    }, 600);

    coinTimer = setTimeout(() => {
      let start = 0;
      const end = coinsEarned;
      const counter = setInterval(() => {
        start += Math.ceil(end / 30);
        if (start >= end) {
          setDisplayCoins(end);
          clearInterval(counter);
        } else {
          setDisplayCoins(start);
        }
      }, 30);
      return () => clearInterval(counter);
    }, 1200);

    return () => {
      clearTimeout(starTimer);
      clearTimeout(coinTimer);
    };
  }, [starsEarned, coinsEarned, isSystemFinalLevel, hasShownDiscovery]);

  return (
    <AnimatePresence>
      {showDiscovery ? (
        <PlanetDiscoveryOverlay 
          key="discovery"
          planetName={nextSystemName} 
          planetImage={nextPlanetImage} 
          onComplete={() => setShowDiscovery(false)} 
        />
      ) : (
        <motion.div 
          key="modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[3000] flex flex-col items-center bg-[#020617]/90 backdrop-blur-md overflow-hidden font-montserrat select-none"
        >
          <SuccessParticles intense={isSystemFinalLevel} />

          <div className={`absolute inset-0 transition-opacity duration-1000 ${isSystemFinalLevel ? 'bg-[radial-gradient(circle_at_50%_40%,_rgba(251,191,36,0.3)_0%,_transparent_70%)]' : 'bg-[radial-gradient(circle_at_50%_40%,_rgba(34,211,238,0.2)_0%,_transparent_70%)]'} pointer-events-none`} />
          
          {/* Flash Effect on Entry */}
          <motion.div 
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-white z-[600] pointer-events-none"
          />

          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ 
              y: 0, 
              opacity: 1, 
              scale: 1,
              rotate: isSystemFinalLevel ? [0, -1, 1, -1, 0] : 0
            }}
            transition={{ 
              type: "spring", 
              damping: 20, 
              stiffness: 100,
              rotate: { duration: 0.5, repeat: isSystemFinalLevel ? 2 : 0 }
            }}
            className="flex-1 w-full max-w-sm flex flex-col items-center px-6 pt-12 pb-6 z-10"
          >
            
            <div className="text-center w-full mb-6 shrink-0 relative">
              <div className="relative">
                <motion.h1 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, type: "spring", damping: 12 }}
                  className="text-white text-3xl sm:text-6xl font-black tracking-tighter uppercase leading-none drop-shadow-[0_8px_0_#0f172a] italic transform -skew-x-6"
                >
                  {isSystemFinalLevel ? "GEZEGEN KEŞFİ!" : "GEÇİT TAMAM!"}
                </motion.h1>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '80%' }}
                  transition={{ delay: 0.8, duration: 1 }}
                  className="absolute -bottom-2 sm:-bottom-3 left-1/2 -translate-x-1/2 h-1 sm:h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full blur-[1px]" 
                />
              </div>
            </div>

            <div className="relative w-full aspect-square max-h-[35vh] perspective-[2000px] mb-6 flex-shrink min-h-0">
               <div className="relative w-full h-full">
                  {/* MAIN CARD */}
                  <motion.div 
                    animate={isSystemFinalLevel ? {
                      boxShadow: [
                        "0 40px 80px rgba(0,0,0,0.5)",
                        "0 40px 120px rgba(251,191,36,0.3)",
                        "0 40px 80px rgba(0,0,0,0.5)"
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-[48px] bg-gradient-to-br from-white/20 via-white/5 to-transparent border-2 border-white/30 shadow-[0_40px_80px_rgba(0,0,0,0.5)] backdrop-blur-3xl p-6 flex flex-col items-center justify-between"
                  >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15)_0%,_transparent_60%)] pointer-events-none" />
                      
                      <div className="w-full flex justify-between items-start z-10 gap-2">
                         <div className="bg-black/30 rounded-2xl p-3 sm:p-4 border border-white/10 backdrop-blur-2xl shadow-inner shrink-0">
                            <span className="text-[8px] sm:text-[9px] font-black text-white/40 uppercase tracking-[0.3em] block mb-1 italic">KAZANÇ</span>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <span className="text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] italic">{displayCoins}</span>
                              <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-[0_0_20px_#fbbf24]"
                              >
                                <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-950" />
                              </motion.div>
                            </div>
                         </div>
                         <div className="flex flex-col items-end gap-2 shrink-0 relative">
                            <AnimatePresence>
                              {starsEarned === 3 && (
                                <motion.div 
                                  initial={{ scale: 0, y: 10 }}
                                  animate={{ scale: 1, y: 0 }}
                                  className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[8px] sm:text-[10px] font-black px-3 py-1 rounded-lg shadow-xl border border-white/20 uppercase tracking-tighter italic whitespace-nowrap mb-1"
                                >
                                  KUSURSUZ!
                                </motion.div>
                              )}
                            </AnimatePresence>
                            <div className="flex gap-1.5 sm:gap-2">
                              {[1, 2, 3].map(i => (
                                <motion.div 
                                  key={i}
                                  initial={{ scale: 0 }}
                                  animate={{ 
                                    scale: visibleStars >= i ? 1.1 : 0.7,
                                    opacity: visibleStars >= i ? 1 : 0.2
                                  }}
                                  className={`transition-all duration-500 ${visibleStars >= i ? 'drop-shadow-[0_0_20px_#fbbf24]' : 'grayscale'}`}
                                >
                                  <Star className={`w-7 h-7 sm:w-9 sm:h-9 ${visibleStars >= i ? 'text-amber-400 fill-amber-400' : 'text-white/20'}`} />
                                </motion.div>
                              ))}
                            </div>
                         </div>
                      </div>

                      <div className="relative w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center -my-2">
                          {/* Inner soft glow */}
                          <motion.div 
                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className={`absolute inset-0 rounded-full blur-[30px] sm:blur-[50px] ${isSystemFinalLevel ? 'bg-amber-400/60' : 'bg-cyan-400/60'}`} 
                          />
                          
                          {/* Integrated Sphere Container - Removed border and background for seamless integration */}
                          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center group">
                              {/* 3D Depth Overlays - Kept light overlays for volume but removed heavy shadows */}
                              <div className="absolute inset-0 rounded-full shadow-[inset_0_2px_10px_rgba(255,255,255,0.4)] z-20 pointer-events-none" />
                              
                              <motion.img 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                                src={currentPlanetImage} 
                                alt={currentSystemName}
                                className="w-full h-full object-cover z-10 hover:scale-125 transition-transform duration-1000"
                                referrerPolicy="no-referrer"
                              />
                          </div>
                      </div>

                      <div className="flex flex-col items-center gap-1 mt-2">
                        <span className="text-white font-black text-2xl sm:text-4xl uppercase tracking-tighter italic drop-shadow-lg leading-none">{currentSystemName}</span>
                        <div className="w-24 h-1 bg-white/20 rounded-full mt-2" />
                      </div>
                  </motion.div>
               </div>
            </div>

            <div className="w-full space-y-6 shrink-0">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="bg-white/10 border-2 border-white/20 rounded-[44px] p-6 backdrop-blur-3xl shadow-2xl flex flex-col items-center gap-5 relative overflow-hidden group"
              >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                  
                  <div className="flex items-center gap-5 w-full relative z-10">
                     <div className="w-14 h-14 shrink-0 flex items-center justify-center drop-shadow-2xl overflow-hidden rounded-2xl">
                        <img 
                          src={nextPlanetImage} 
                          alt={nextSystemName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                     </div>
                     <div className="flex flex-col min-w-0">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-1 italic">SIRADAKİ HEDEF</span>
                        <h4 className="text-white text-xl font-black tracking-tighter uppercase truncate drop-shadow-md italic">{nextSystemName}</h4>
                     </div>
                  </div>

                  <div className="w-full flex justify-between items-center px-2 gap-3 relative z-10">
                     {[1, 2, 3, 4, 5, 6].map((port) => {
                        const isPortActive = port <= progressInSystem;
                        return (
                          <div key={port} className="flex-1 flex flex-col items-center gap-2">
                             <div 
                              className={`w-full h-2 rounded-full transition-all duration-700 ${isPortActive ? 'bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.7)]' : 'bg-white/10'}`} 
                             />
                             <motion.div 
                              animate={{ scale: isPortActive ? 1.2 : 0.8 }}
                              className={`w-2.5 h-2.5 rounded-full transition-all duration-1000 ${isPortActive ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.9)]' : 'bg-white/10'}`} 
                             />
                          </div>
                        );
                     })}
                  </div>
              </motion.div>

              <div className="flex flex-col gap-5">
                <Button 
                  variant={isSystemFinalLevel ? "amber" : "cyan"} 
                  onClick={onContinue}
                  className="w-full !py-5 sm:!py-7 !text-xl sm:!text-3xl !rounded-[32px] sm:!rounded-[36px] !border-b-[8px] sm:!border-b-[12px] !border-x-[4px] !shadow-[0_20px_40px_rgba(0,0,0,0.7)] active:!border-b-[4px] active:!translate-y-2 transition-all group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="flex items-center justify-center gap-4 sm:gap-5 relative z-10">
                     <span className="font-black italic tracking-tighter uppercase">{isSystemFinalLevel ? "SİSTEME ATLA" : "YOLA DEVAM ET"}</span>
                     <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 animate-bounce-x" />
                  </div>
                </Button>

                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMenu}
                  className="w-full py-4 flex flex-col items-center gap-3 group transition-all"
                >
                  <span className="text-white/40 group-hover:text-white font-black uppercase text-sm tracking-[0.6em] transition-all drop-shadow-xl italic">MENÜYE DÖN</span>
                  <div className="w-12 h-1 bg-white/10 rounded-full group-hover:w-32 group-hover:bg-white/40 transition-all duration-700" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
