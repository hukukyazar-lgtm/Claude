
import React from 'react';
import { Button } from './Button';
import { Zap, Rocket, Orbit, Swords, ChevronRight, Search, Users, Trophy, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TeamModalProps {
  onClose: () => void;
}

export const TeamModal: React.FC<TeamModalProps> = ({ onClose }) => {
  const teams = [
    { name: "NEBULA HUNTERS", members: "45/50", level: 12, icon: Zap, color: "#818cf8", variant: 'indigo' as const },
    { name: "STAR COMMAND", members: "48/50", level: 15, icon: Rocket, color: "#22d3ee", variant: 'cyan' as const },
    { name: "COSMOS SQUAD", members: "32/50", level: 8, icon: Orbit, color: "#fbbf24", variant: 'amber' as const },
    { name: "NOVA WARRIORS", members: "12/50", level: 4, icon: Swords, color: "#f472b6", variant: 'pink' as const }
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.2
            }}
            animate={{ 
              y: [null, '-100%'],
              opacity: [0, 0.2, 0]
            }}
            transition={{ 
              duration: Math.random() * 12 + 12, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-1 h-1 bg-indigo-400 rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-10 right-6 w-12 h-12 glass-morphism-bright rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all z-[110] border-white/20 group"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="w-6 h-6 opacity-40 group-hover:opacity-100 transition-opacity">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Header */}
      <div className="pt-20 pb-8 px-8 text-center shrink-0 z-20">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase drop-shadow-2xl italic">
            TAKIMLAR
          </h1>
          <div className="w-24 h-1.5 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full mt-2 shadow-[0_0_15px_rgba(129,140,248,0.5)] mx-auto" />
        </motion.div>
      </div>

      <div className="flex-1 px-6 flex flex-col gap-6 overflow-hidden relative z-10">
        {/* Search Section */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-morphism-bright rounded-[40px] p-8 shadow-2xl flex flex-col gap-6 border-white/20 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
          <div className="flex items-center gap-2 mb-1 relative z-10">
            <Search className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.6em] opacity-80">TAKIM ARA</span>
          </div>
          <div className="flex gap-4 relative z-10">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="TAKIM KODU VEYA İSİM..." 
                className="w-full h-16 bg-white/5 border border-white/10 rounded-[24px] px-6 text-lg font-black text-white outline-none focus:border-indigo-500/50 transition-all uppercase placeholder:text-white/10 tracking-widest shadow-inner"
              />
              <div className="absolute inset-0 rounded-[24px] border border-white/5 pointer-events-none" />
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 bg-indigo-600 border border-indigo-500/50 rounded-[24px] flex items-center justify-center text-white shadow-xl shadow-indigo-500/20"
            >
               <ChevronRight className="w-8 h-8" />
            </motion.button>
          </div>
        </motion.div>

        {/* Team List */}
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-5 pb-32 mt-2">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-white/5" />
            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">TAVSİYE EDİLENLER</span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>

          {teams.map((team, i) => (
            <motion.div 
              key={i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              whileHover={{ x: 5, backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="glass-morphism rounded-[40px] p-6 flex items-center justify-between shadow-2xl transition-all border-white/5 relative overflow-hidden group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-20 h-20 glass-morphism rounded-[28px] flex items-center justify-center shadow-inner border border-white/10 group-hover:scale-110 transition-transform duration-500 relative">
                  <div className="absolute inset-0 bg-white/5 rounded-[28px] blur-sm" />
                  <team.icon className="w-10 h-10 relative z-10" style={{ color: team.color, filter: `drop-shadow(0 0 10px ${team.color}44)` }} />
                </div>
                <div>
                  <div className="text-white font-black text-2xl leading-none uppercase tracking-tighter mb-2 drop-shadow-lg italic">{team.name}</div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">{team.members}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">LVL {team.level}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="flex flex-col items-end mr-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-black text-white/80 tracking-tighter">PREMIUM</span>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-white shadow-xl backdrop-blur-xl bg-white/5"
                >
                  <ChevronRight className="w-7 h-7 opacity-60" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-20" />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
      `}</style>
    </motion.div>
  );
};

