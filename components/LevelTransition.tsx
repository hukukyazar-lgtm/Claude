
import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeProvider';
import { usePlanets } from '../PlanetProvider';
import { Rocket, Zap } from 'lucide-react';

interface LevelTransitionProps {
  level: number;
  onFinished: () => void;
}

export const LevelTransition: React.FC<LevelTransitionProps> = ({ level, onFinished }) => {
  const { palette } = useTheme();
  const { planetImages } = usePlanets();
  
  const planetId = Math.ceil(level / 6);
  const currentPlanetImage = planetImages[(planetId - 1) % planetImages.length] || planetImages[0];

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[5000] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Hyperdrive Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(150)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0, x: '50%', y: '50%', opacity: 0 }}
            animate={{ 
              scaleX: [0, 40, 0],
              x: [`${50}%`, `${50 + (Math.random() - 0.5) * 300}%`],
              y: [`${50}%`, `${50 + (Math.random() - 0.5) * 300}%`],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: 0.8, 
              repeat: Infinity, 
              delay: Math.random() * 1,
              ease: "circIn"
            }}
            className="absolute w-2 h-[1px] bg-white blur-[1px]"
            style={{ 
              transformOrigin: 'left center',
              backgroundColor: palette[i % palette.length]
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative w-48 h-48 mb-8">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full blur-3xl"
              style={{ backgroundColor: palette[0] }}
            />
            <motion.img 
              src={currentPlanetImage}
              alt=""
              className="w-full h-full object-cover rounded-full shadow-2xl relative z-10"
              initial={{ filter: 'brightness(0) blur(20px)' }}
              animate={{ filter: 'brightness(1.2) blur(0px)' }}
              transition={{ duration: 1 }}
              referrerPolicy="no-referrer"
            />
        </div>

        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-black text-sm tracking-[0.6em] uppercase italic">IŞINLANIYOR</span>
            <Zap className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <h2 className="text-white font-[1000] text-5xl sm:text-7xl tracking-tighter uppercase italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            {level}. GEÇİT
          </h2>
          <div className="mt-4 flex items-center justify-center gap-2">
            <motion.div 
              animate={{ x: [-5, 5, -5] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Rocket className="w-5 h-5 text-white/40" />
            </motion.div>
            <span className="text-white/40 font-bold text-xs uppercase tracking-[0.2em]">SONRAKİ HEDEFE DOĞRU...</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Screen Flash at End */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{ duration: 2.5, times: [0, 0.8, 1] }}
        className="absolute inset-0 bg-white z-[6000] pointer-events-none"
      />
    </div>
  );
};
