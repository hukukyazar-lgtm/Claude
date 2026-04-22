
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, Crown, Star } from 'lucide-react';
import { SoundManager } from '../managers/SoundManager';

interface RankUpNotificationProps {
  data: { title: string; color: string } | null;
  onClose: () => void;
}

export const RankUpNotification: React.FC<RankUpNotificationProps> = ({ data, onClose }) => {
  useEffect(() => {
    if (data) {
      SoundManager.getInstance().playJackpot();
      const timer = setTimeout(onClose, 6000);
      return () => clearTimeout(timer);
    }
  }, [data, onClose]);

  return (
    <AnimatePresence>
      {data && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center pointer-events-none">
          {/* Backdrop Glow */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0, rotate: -20, y: 100 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0, opacity: 0, y: -100 }}
            transition={{ type: "spring", damping: 15, stiffness: 100 }}
            className="relative z-10 w-full max-w-sm px-6 pointer-events-auto"
          >
            <div className="relative glass-morphism-bright rounded-[48px] p-8 border-2 border-white/30 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center text-center">
              {/* Animated Background Parallax */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              <motion.div 
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"
              />

              <div className="relative mb-6">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400 to-amber-600 rounded-[32px] flex items-center justify-center shadow-[0_20px_40px_rgba(251,191,36,0.4)] border-4 border-white"
                >
                  <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-white drop-shadow-lg" />
                </motion.div>
                <motion.div 
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl"
                >
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h3 className="text-white/60 font-black text-xs sm:text-sm tracking-[0.6em] uppercase mb-2 italic">YENİ RÜTBE KAZANILDI</h3>
                <h1 className="text-white font-black text-4xl sm:text-6xl tracking-tighter uppercase italic drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] mb-4" style={{ color: data.color }}>
                  {data.title}
                </h1>
                <div className="w-24 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
                <p className="text-white/80 text-sm sm:text-base font-medium leading-relaxed max-w-[240px] mx-auto">
                  Evrenin sırlarını çözmeye bir adım daha yaklaştın. Yolculuğun devam ediyor!
                </p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="mt-8 px-10 py-4 bg-white text-black font-black rounded-2xl tracking-widest shadow-2xl hover:bg-amber-50 transition-colors"
              >
                DEVAM ET
              </motion.button>
            </div>

            {/* Floating Particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1, 0],
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                }}
                transition={{ 
                  duration: 2 + Math.random() * 2, 
                  repeat: Infinity,
                  delay: Math.random() * 2
                }}
                className="absolute top-1/2 left-1/2"
              >
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
