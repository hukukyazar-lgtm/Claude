
import React, { useEffect, useRef, useMemo, memo } from 'react';
// @ts-ignore
import { Vibrant } from 'node-vibrant/browser';
import { Cube3D } from './Cube3D';
import { Sphere3D } from './Sphere3D';
import { PLANET_IMAGES } from '../constants';
import { usePlanets } from '../PlanetProvider';
import { useTheme } from '../ThemeProvider';
import { SoundManager } from '../managers/SoundManager';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, X, Lock, Sparkles, Star } from 'lucide-react';

interface PlanetMenuModalProps {
  onClose: () => void;
  onStartGame: (levelId?: number) => void;
  currentLevel: number;
  levelStars: Record<number, number>;
}

const PlanetCard = memo(({ planet, currentLevel, levelStars, onStartGame }: {
  planet: any;
  currentLevel: number;
  levelStars: Record<number, number>;
  onStartGame: (levelId?: number) => void;
}) => {
  const isCompleted = currentLevel > planet.id * 6;
  const isCurrent = !isCompleted && currentLevel > (planet.id - 1) * 6;
  const isLocked = !isCompleted && !isCurrent;
  const isLumina = planet.id === 100;

  // Calculate stars for this planet's 6 gates
  const gates = Array.from({ length: 6 }, (_, i) => {
    const levelId = (planet.id - 1) * 6 + (i + 1);
    const stars = (levelStars && levelStars[levelId]) || 0;
    const isLevelLocked = levelId > currentLevel;
    const isLevelCurrent = levelId === currentLevel;
    return { id: levelId, stars, isLocked: isLevelLocked, isCurrent: isLevelCurrent };
  });

  return (
    <motion.div 
      id={`planet-${planet.id}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "200px" }}
      className={`relative w-full flex flex-col items-center min-h-[500px] sm:min-h-[700px] ${isLocked ? 'opacity-30 grayscale' : 'opacity-100'}`}
    >
      <div 
        className={`w-full max-w-md glass-morphism rounded-[32px] p-4 shadow-2xl relative transition-all duration-700 flex flex-col items-center group overflow-hidden ${isCurrent ? 'ring-2 ring-white/40' : ''}`}
        style={{ 
            borderColor: isLocked ? 'rgba(255,255,255,0.05)' : `${planet.color}44`, 
            boxShadow: !isLocked ? `0 15px 40px ${planet.color}15` : 'none',
            background: !isLocked ? `linear-gradient(180deg, ${planet.color}08 0%, rgba(255,255,255,0.02) 100%)` : undefined
        }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_5s_infinite_linear] pointer-events-none" />
        
        {!isLocked && (
          <div className="absolute inset-0 blur-[80px] rounded-full opacity-10 animate-pulse pointer-events-none" style={{ backgroundColor: planet.color }} />
        )}

        <div className="relative z-10 flex flex-col items-center w-full py-6">
            {/* Planet Image - Maximized */}
            <div className={`mb-4 transition-all duration-1000 ${isCurrent ? 'scale-110' : 'scale-100 group-hover:scale-105'}`}>
              <div className="relative">
                {isLumina ? (
                  <Cube3D 
                    size={260} 
                    color={isLocked ? '#475569' : '#fbbf24'} 
                    speed={8} 
                    label="L"
                    visualStyle="LUMINA"
                    isGlassy={false}
                    opacity={isLocked ? 0.2 : 1}
                    rotationAxis="TUMBLE"
                    noShading={true}
                  />
                ) : (
                  <div className="relative w-88 h-88 sm:w-[420px] sm:h-[420px]">
                    <img 
                      src={planet.imageUrl} 
                      alt={planet.name}
                      className={`w-full h-full object-contain animate-planet-rotate drop-shadow-[0_0_50px_rgba(255,255,255,0.2)] ${isLocked ? 'brightness-50' : 'brightness-110 contrast-110'}`}
                      style={{ 
                        filter: isCurrent ? `drop-shadow(0 0 60px ${planet.color}66)` : 'none'
                      }}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-12 h-12 text-white/40" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="text-center">
              <h2 className={`text-4xl font-black tracking-tighter uppercase italic mb-1 ${isLocked ? 'text-white/20' : 'text-white'}`}>
                {isLocked ? '???' : planet.name}
              </h2>
              <p className="text-xs font-black text-white/60 uppercase tracking-[0.5em] italic">GEZEGEN {planet.id.toString().padStart(3, '0')}</p>
            </div>

            {isLocked && (
                <div className="mt-6 px-8 py-3 bg-white/5 border border-white/10 rounded-full flex items-center gap-3 opacity-50">
                   <Lock className="w-4 h-4 text-white/20" />
                   <span className="text-white/20 font-black text-xs uppercase tracking-[0.2em] italic">KİLİTLİ</span>
                </div>
            )}
        </div>
      </div>

      {/* Gates & Stars Grid - Moved Outside Card */}
      {!isLocked && (
        <div className="w-full max-w-md mt-6 px-4">
          <div className="grid grid-cols-3 gap-3 w-full">
            {gates.map((gate, idx) => {
              const isClickable = !gate.isLocked && gate.stars < 3;
              return (
                <motion.button 
                  key={idx} 
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.15)' } : {}}
                  whileTap={isClickable ? { scale: 0.92 } : {}}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isClickable) {
                      SoundManager.getInstance().playPop();
                      onStartGame(gate.id);
                    }
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-colors
                    ${gate.isLocked ? 'bg-black/20 border-white/5 opacity-30 cursor-not-allowed' : 
                      gate.stars === 3 ? 'bg-emerald-500/10 border-emerald-500/30 opacity-80 cursor-default' :
                      gate.isCurrent ? 'bg-white/10 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 
                      'bg-white/5 border-white/10'}`}
                >
                  <span className="text-[10px] font-bold text-white/90 uppercase tracking-tighter">GEÇİT {idx + 1}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(s => (
                      <Star 
                        key={s} 
                        className={`w-4 h-4 ${s <= gate.stars ? 'text-amber-400 fill-amber-400' : 'text-white/30'}`} 
                      />
                    ))}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
      
      {planet.id !== 1 && (
        <div className="flex flex-col items-center gap-4 py-10 opacity-30">
            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-400 shadow-[0_0_15px_#4ade80]' : 'bg-white/40'}`} />
            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-400 shadow-[0_0_15px_#4ade80]' : 'bg-white/40'}`} />
            <div className={`w-2 h-2 rounded-full ${isCompleted ? 'bg-emerald-400 shadow-[0_0_15px_#4ade80]' : 'bg-white/40'}`} />
        </div>
      )}
    </motion.div>
  );
});

export const PlanetMenuModal: React.FC<PlanetMenuModalProps> = ({ onClose, onStartGame, currentLevel, levelStars }) => {
  const { palette } = useTheme();
  const { planetImages, planetNames } = usePlanets();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const PLANETS = useMemo(() => Array.from({ length: 100 }, (_, i) => {
    const id = i + 1;
    const name = id === 100 ? "LUMINA" : (planetNames[id] || `GEZEGEN ${id.toString().padStart(3, '0')}`);
    
    const planetColor = id === 100 ? '#fbbf24' : palette[i % palette.length];

    // Use images from Supabase bucket if available
    const imageUrl = planetImages[i % planetImages.length] || planetImages[0];

    return {
      id,
      name,
      color: planetColor,
      imageUrl
    };
  }), [palette, planetImages, planetNames]);

  const sortedPlanets = useMemo(() => [...PLANETS].reverse(), [PLANETS]);
  const activePlanetId = useMemo(() => Math.max(1, Math.ceil(currentLevel / 6)), [currentLevel]);

  useEffect(() => {
    const scroll = () => {
      const container = scrollContainerRef.current;
      const activeElement = document.getElementById(`planet-${activePlanetId}`);
      
      if (activeElement && container) {
        // Use offsetTop for more reliability during modal animations
        const elementTop = activeElement.offsetTop;
        
        // The dots section above the card ends at elementTop.
        // The bottom dot is 40px (bottom padding) + 8px (dot height) above elementTop.
        // Bottom dot top position = elementTop - 48px.
        
        const headerHeight = window.innerWidth < 640 ? 96 : 128; // h-24 or h-32
        
        let targetScroll;
        if (activePlanetId === 100) {
          // No dots above Planet 100, just scroll to the very top
          targetScroll = 0;
        } else {
          const dotTop = elementTop - 48;
          // Align dotTop with the bottom edge of the header
          targetScroll = dotTop - headerHeight;
        }
        
        container.scrollTo({
          top: targetScroll,
          behavior: 'auto'
        });
      }
    };

    // Multiple attempts with increasing delays to ensure layout is stable
    const timers = [
      setTimeout(scroll, 50),
      setTimeout(scroll, 200),
      setTimeout(scroll, 500),
      setTimeout(scroll, 1200)
    ];
    
    return () => timers.forEach(clearTimeout);
  }, [activePlanetId, sortedPlanets]);

  const scrollToTop = () => scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () => scrollContainerRef.current?.scrollTo({ top: scrollContainerRef.current.scrollHeight, behavior: 'smooth' });

  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full h-full flex flex-col bg-[#020617] overflow-hidden relative font-sans"
    >
      {/* Background Collage Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
      
      {/* Vintage Atlas Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10">
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/20" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/20" />
        <div className="absolute top-1/4 left-0 w-full h-[1px] bg-white/10" />
        <div className="absolute top-3/4 left-0 w-full h-[1px] bg-white/10" />
      </div>

      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-20 -right-20 w-[400px] h-[400px] opacity-20 blur-sm pointer-events-none"
      >
        <img 
          src={PLANET_IMAGES[2]} 
          alt="" 
          className="w-full h-full object-contain" 
          style={{ 
            clipPath: 'circle(48%)',
            maskImage: 'radial-gradient(circle, black 65%, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 75%)'
          }}
          referrerPolicy="no-referrer" 
        />
      </motion.div>
      {/* Header Section */}
      <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 h-24 sm:h-32 flex items-center justify-center z-[200] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent backdrop-blur-sm">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-[0.4em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            YILDIZ HARİTASI
          </h1>
        </motion.div>

        <button 
          onClick={onClose}
          className="absolute right-6 sm:right-10 w-8 h-8 sm:w-10 sm:h-10 glass-morphism-bright rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border-white/20 group"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
        </button>
      </div>

      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-[110]">
        <button onClick={scrollToTop} className="w-12 h-12 glass-morphism-bright rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all group border-white/10">
          <ChevronUp className="w-6 h-6 text-white opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
        </button>
        <button onClick={scrollToBottom} className="w-12 h-12 glass-morphism-bright rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all group border-white/10">
          <ChevronDown className="w-6 h-6 text-white opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
        </button>
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-8 space-y-0 custom-scrollbar pb-12 pt-32 sm:pt-40 relative z-10">
        {sortedPlanets.map((planet) => (
          <PlanetCard 
            key={planet.id} 
            planet={planet} 
            currentLevel={currentLevel} 
            levelStars={levelStars}
            onStartGame={onStartGame} 
          />
        ))}
      </div>

      <style>{`
        @keyframes planet-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
      `}</style>
    </motion.div>
  );
};
