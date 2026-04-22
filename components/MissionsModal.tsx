
import React, { useState, useEffect } from 'react';
import { UserStats } from '../types';
import { Button } from './Button';
import { SoundManager } from '../managers/SoundManager';
import { Rocket, Target, Timer, Zap, CheckCircle2, Sparkles, X, Map } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Cube3D } from './Cube3D';

interface MissionsModalProps {
  onClose?: () => void;
  stats: UserStats;
  onClaimReward: (id: number, reward: number) => void;
}

const MISSIONS_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

export const MissionsModal: React.FC<MissionsModalProps> = ({ onClose, stats, onClaimReward }) => {
  const { palette } = useTheme();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const nextReset = stats.lastMissionsRefresh + MISSIONS_REFRESH_INTERVAL;
      const diff = Math.max(0, nextReset - now);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [stats.lastMissionsRefresh]);

  const missionDefinitions = [
    { 
      id: 1, 
      title: "2 GEÇİT TAMAMLA", 
      progress: stats.level - 1, 
      total: 2, 
      reward: 500, 
      color: palette[0], 
      icon: Rocket,
      desc: "KEŞİF"
    },
    { 
      id: 2, 
      title: "1 GEZEGEN DEĞİŞTİR", 
      progress: Math.floor((stats.level - 1) / 6), 
      total: 1, 
      reward: 2500, 
      color: palette[3] || palette[0], 
      icon: Map,
      desc: "YOLCULUK"
    },
    { 
      id: 3, 
      title: "18 YILDIZ TOPLA", 
      progress: stats.stars, 
      total: 18, 
      reward: 1200, 
      color: palette[1] || palette[0], 
      icon: Target,
      desc: "USTALIK"
    },
    { 
      id: 4, 
      title: "6 KOMBO YAP", 
      progress: stats.maxStreak >= 6 ? 1 : 0, 
      total: 1, 
      reward: 800, 
      color: palette[2] || palette[0], 
      icon: Zap,
      desc: "ODAK"
    },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full h-full flex flex-col bg-[#020617] overflow-hidden relative font-montserrat"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_70%)] opacity-50 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />

      {/* Header Section */}
      <div className="absolute top-0 left-0 right-0 px-6 h-16 sm:h-20 flex items-center justify-center z-[200] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent backdrop-blur-sm">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-base sm:text-lg font-bold text-white tracking-[0.4em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            GÖREVLER
          </h1>
        </motion.div>

        {onClose && (
          <button 
            onClick={onClose}
            className="absolute right-6 w-8 h-8 glass-morphism-bright rounded-lg flex items-center justify-center shadow-2xl active:scale-90 transition-all border-white/20 group"
          >
            <X className="w-4 h-4 text-white opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
          </button>
        )}
      </div>

      <div className="flex-1 px-4 pb-4 flex flex-col gap-4 overflow-hidden relative z-10 pt-16 sm:pt-20">
        {/* Timer Card - Compact */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full glass-morphism-bright rounded-[24px] p-4 sm:p-6 shadow-2xl relative overflow-hidden flex items-center justify-center border-white/20 group cursor-default"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 via-transparent to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
           <div className="flex flex-col items-center relative z-20">
              <span className="text-white font-black text-4xl sm:text-7xl tracking-tighter tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">{timeLeft}</span>
           </div>
        </motion.div>

        {/* Missions Grid */}
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 min-h-0">
            {missionDefinitions.map((mission, idx) => {
              const isDone = mission.progress >= mission.total;
              const isClaimed = stats.claimedMissions.includes(mission.id);

              return (
                <motion.div 
                  key={mission.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + idx * 0.1 }}
                  className="relative group h-full"
                >
                  <div className={`w-full h-full glass-morphism rounded-[28px] p-4 sm:p-6 shadow-2xl relative overflow-hidden transition-all duration-500 border-white/10 flex flex-col items-center justify-between text-center
                    ${isClaimed 
                      ? 'opacity-40 grayscale-[0.8]' 
                      : isDone 
                      ? 'bg-amber-500/20 border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.2)]'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000" />
                    
                    <div className={`w-14 h-14 sm:w-20 sm:h-20 glass-morphism-bright rounded-3xl flex items-center justify-center border-white/20 shadow-xl mb-4 group-hover:scale-110 transition-all duration-500 ${isDone && !isClaimed ? 'animate-bounce' : ''}`}>
                      <mission.icon className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: mission.color, filter: `drop-shadow(0 0 15px ${mission.color}66)` }} />
                    </div>

                    <div className="flex flex-col items-center min-w-0 flex-1 justify-center mb-4">
                      <span className="text-white font-black text-sm sm:text-xl tracking-tight uppercase mb-2 italic leading-tight drop-shadow-lg">{mission.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-lg font-black text-amber-400">+{mission.reward}</span>
                        <div className="shrink-0 mt-0.5">
                          <Cube3D 
                            size={window.innerWidth < 640 ? 14 : 18} 
                            color="#fbbf24" 
                            speed={0} 
                            visualStyle="LUMINA" 
                            noShading={false} 
                            rotationAxis="TUMBLE" 
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full mt-auto">
                      {isClaimed ? (
                        <div className="bg-emerald-500/20 py-3 rounded-2xl border border-emerald-500/30 flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                      ) : isDone ? (
                        <Button 
                          variant="amber" 
                          onClick={() => {
                            SoundManager.getInstance().playCoin();
                            onClaimReward(mission.id, mission.reward);
                          }}
                          className="!py-3.5 !px-3 w-full !rounded-2xl shadow-xl !border-none !bg-amber-400 !text-amber-950 animate-pulse transition-all relative overflow-hidden"
                        >
                          <span className="font-black tracking-tighter text-xs sm:text-sm italic relative z-10">ÖDÜLÜ AL</span>
                        </Button>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex gap-2">
                            {[...Array(mission.total)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-3 h-3 rounded-full transition-all duration-700 border
                                  ${(i + 1) <= mission.progress 
                                    ? 'shadow-[0_0_12px_rgba(255,255,255,0.7)] border-white' 
                                    : 'bg-white/5 border-white/10'}`}
                                style={{ backgroundColor: (i + 1) <= mission.progress ? mission.color : undefined }}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-black text-white/40 italic">{Math.min(mission.progress, mission.total)}/{mission.total}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-20" />

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </motion.div>
  );
};
