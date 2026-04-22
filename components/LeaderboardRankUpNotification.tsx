
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, ArrowUp, Star, Sparkles, TrendingUp } from 'lucide-react';
import { SoundManager } from '../managers/SoundManager';

interface LeaderboardRankUpNotificationProps {
  newRank: number;
  oldRank: number | null;
  onClose: () => void;
}

export const LeaderboardRankUpNotification: React.FC<LeaderboardRankUpNotificationProps> = ({ newRank, oldRank, onClose }) => {
  useEffect(() => {
    if (newRank && oldRank && newRank < oldRank) {
      SoundManager.getInstance().playJackpot();
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [newRank, oldRank, onClose]);

  if (!oldRank || newRank >= oldRank) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2100] flex items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm pointer-events-auto"
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: -50 }}
          className="relative z-10 w-full max-w-xs px-6 pointer-events-auto"
        >
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-[40px] p-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] border-2 border-white/30 overflow-hidden flex flex-col items-center text-center">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 mix-blend-screen" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"
            />

            <div className="relative mb-6">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-2xl"
              >
                <Trophy className="w-10 h-10 text-indigo-600" />
              </motion.div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg"
              >
                <ArrowUp className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-white/80 font-black text-[10px] tracking-[0.4em] uppercase mb-1 italic">DÜNYA SIRALAMASI</h3>
              <div className="flex items-baseline justify-center gap-2 mb-2">
                <span className="text-white/40 text-xl font-black line-through italic">#{oldRank}</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-white text-5xl font-black italic drop-shadow-xl">#{newRank}</span>
              </div>
              <h2 className="text-white font-black text-lg uppercase tracking-tight italic mb-4">SIRALAMADA YÜKSELDİN!</h2>
              
              <div className="bg-black/20 rounded-2xl py-3 px-4 backdrop-blur-md border border-white/10">
                <p className="text-white/90 text-xs font-bold leading-tight">
                  Rakiplerini geride bıraktın! <br/>Zirveye bir adım daha yaklaştın.
                </p>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="mt-8 w-full py-4 bg-white text-indigo-600 font-black rounded-2xl tracking-widest shadow-xl hover:bg-indigo-50 transition-colors"
            >
              HARİKA!
            </motion.button>
          </div>

          {/* Floating Stars */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1, 0],
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
              }}
              transition={{ 
                duration: 1.5 + Math.random(), 
                repeat: Infinity,
                delay: Math.random()
              }}
              className="absolute top-1/2 left-1/2"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
