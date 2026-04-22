
import React from 'react';
import { UserStats } from '../types';
import { Star, Heart, Coins, User, Cloud, Plus, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Cube3D } from './Cube3D';

interface HeaderProps {
  stats: UserStats;
  userPhoto?: string | null;
  isSyncing?: boolean;
  onSettings?: () => void;
  onProfile?: () => void;
  onShop?: () => void;
}

const StatBox = ({ icon: Icon, value, color, onClick, className = "", showPlus = false, customIcon }: { 
  icon?: any, 
  value: string | number, 
  color: string, 
  onClick?: () => void,
  className?: string,
  showPlus?: boolean,
  customIcon?: React.ReactNode
}) => (
  <div className="relative">
    {/* Icon in top-left OUTER corner */}
    <div className="absolute -top-2 -left-2 sm:-top-4 sm:-left-4 z-30 pointer-events-none">
      {customIcon ? customIcon : (
        <div 
          className="relative" 
          style={{ 
            transform: 'perspective(500px) rotateX(0deg) rotateY(0deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          <Icon 
            className="w-6 h-6 sm:w-10 sm:h-10" 
            style={{ 
              color,
              filter: `
                drop-shadow(1px 1px 0px ${color}aa) 
                drop-shadow(2px 2px 0px ${color}88) 
                drop-shadow(3px 3px 0px ${color}66)
                drop-shadow(0 8px 12px rgba(0,0,0,0.4))
              `
            }} 
            fill={color} 
            fillOpacity={0.95} 
          />
          {/* Glossy overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-40 rounded-full blur-[2px] pointer-events-none" />
        </div>
      )}
    </div>

    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex flex-col items-center justify-center transition-all rounded-xl sm:rounded-2xl relative overflow-visible pointer-events-auto shrink glass-morphism border-white/10 shadow-xl ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Plus button - Centered on corner */}
      {showPlus && (
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 bg-emerald-500 rounded-full p-0.5 sm:p-1 shadow-lg border border-white/20 z-40">
          <Plus className="w-2.5 sm:w-4 h-2.5 sm:h-4 text-white" strokeWidth={4} />
        </div>
      )}

      {/* Large Value */}
      <span className="text-white text-[20px] sm:text-[32px] font-black tracking-tighter z-10 uppercase drop-shadow-md italic truncate">
        {value}
      </span>
      
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] rounded-xl sm:rounded-2xl" />
    </motion.div>
  </div>
);

export const Header: React.FC<HeaderProps> = ({ stats, userPhoto, isSyncing, onSettings, onProfile, onShop }) => {
  return (
    <div className="absolute top-8 sm:top-20 left-4 sm:left-10 right-4 sm:right-10 flex items-center justify-between pointer-events-none z-[300] gap-2 sm:gap-4">
      {/* Left: Profile & Stars Group - Fixed width slot to avoid pushing center */}
      <div className="flex-1 flex items-center justify-start gap-2 sm:gap-8 pointer-events-none">
        <div className="flex items-center gap-2 sm:gap-8 pointer-events-auto">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="relative"
          >
            <button 
              onClick={onProfile}
              className="w-10 h-10 sm:w-14 sm:h-14 glass-morphism-bright rounded-xl sm:rounded-2xl flex items-center justify-center active:scale-90 transition-all group relative overflow-hidden border-white/20 shadow-2xl"
            >
              {userPhoto ? (
                <img src={userPhoto} className="w-full h-full object-cover relative z-10 opacity-90 group-hover:opacity-100 transition-opacity" alt="Profile" />
              ) : (
                <User className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-white/40 group-hover:text-white transition-all relative z-10" />
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            {/* Sync Indicator */}
            <AnimatePresence>
              {isSyncing && (
                <motion.div 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-5 sm:h-5 bg-cyan-500 border-2 border-[#020617] rounded-full flex items-center justify-center z-20 shadow-lg"
                >
                  <Cloud className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <StatBox 
              customIcon={
                <div className="relative -mt-1 sm:-mt-2 -ml-1 sm:-ml-2">
                  <Star 
                    className="w-6 h-6 sm:w-10 sm:h-10" 
                    style={{ 
                      color: "#22d3ee",
                      filter: `
                        drop-shadow(1px 1px 0px #22d3eeaa) 
                        drop-shadow(2px 2px 0px #22d3ee88) 
                        drop-shadow(3px 3px 0px #22d3ee66)
                        drop-shadow(0 8px 12px rgba(0,0,0,0.4))
                      `
                    }} 
                    fill="#22d3ee" 
                    fillOpacity={0.95} 
                  />
                </div>
              }
              value={stats.stars} 
              color="#22d3ee" 
              className="h-9 sm:h-14 px-2 sm:px-8 min-w-[50px] sm:min-w-[120px]" 
            />
          </motion.div>
        </div>
      </div>

      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-none flex justify-center items-center pointer-events-auto z-50"
      >
        <div 
          onClick={onShop}
          className="glass-morphism border-white/10 px-2 sm:px-6 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl flex items-center gap-1 sm:gap-2 cursor-pointer hover:scale-105 transition-transform shrink-0"
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="relative shrink-0"
            >
              <Heart 
                className={`w-4 h-4 sm:w-8 sm:h-8 transition-all duration-300 ${
                  i < stats.hearts 
                    ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]' 
                    : 'text-white/10 fill-transparent'
                }`}
                strokeWidth={2.5}
              />
              {i < stats.hearts && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  className="absolute inset-0 bg-red-500/20 blur-md rounded-full pointer-events-none"
                />
              )}
            </motion.div>
          ))}
          
          {stats.hearts < 5 && (
            <motion.div 
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="ml-1 sm:ml-2 bg-emerald-500 rounded-full p-0.5 sm:p-1 shadow-lg border border-white/20 shrink-0"
            >
              <Plus className="w-2 sm:w-3 h-2 sm:h-3 text-white" strokeWidth={4} />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Right: Coins Stat - Fixed width slot */}
      <div className="flex-1 flex justify-end pointer-events-none">
        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="pointer-events-auto"
        >
          <StatBox 
            customIcon={
              <div className="relative mt-0 sm:mt-0.5 ml-1 sm:ml-2 group">
                <Cube3D 
                  size={window.innerWidth < 640 ? 16 : 26} 
                  color="#fbbf24" 
                  speed={0} 
                  visualStyle="LUMINA" 
                  noShading={false} 
                  rotationAxis="TUMBLE" 
                />
                {/* Professional subtle glow for Lumina cube */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-yellow-400 blur-lg rounded-full pointer-events-none -z-10 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                />
              </div>
            }
            value={(stats.coins || 0).toLocaleString()} 
            color="#fbbf24" 
            onClick={onShop} 
            showPlus 
            className="h-9 sm:h-14 px-2 sm:px-8 min-w-[60px] sm:min-w-[150px]" 
          />
        </motion.div>
      </div>
    </div>
  );
};
