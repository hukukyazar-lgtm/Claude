
import React from 'react';
import { Button } from './Button';
import { Heart, Snowflake, Target, Coins, Tv, Sparkles, ShoppingBag, ArrowRight, Eye, SearchX, X } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';

interface ShopModalProps {
  onClose: () => void;
  coins: number;
  hearts: number;
  onBuyHearts: (cost: number, type: 'HEART' | 'FREEZE' | 'REVEAL', amount: number) => void;
  onWatchVideo: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ coins, hearts, onBuyHearts, onWatchVideo, onClose }) => {
  const { palette } = useTheme();
  
  const shopItems = [
    { id: 'h1', amount: 1, cost: 500, color: '#f87171', icon: Heart, label: '1 CAN', desc: 'TAKVIYE', type: 'HEART' as const },
    { id: 'h5', amount: 5, cost: 2000, color: '#ec4899', icon: Heart, label: 'TAM CAN', desc: 'MAKSIMUM', type: 'HEART' as const, popular: true },
    { id: 'p3', amount: 3, cost: 1500, color: '#22d3ee', icon: Eye, label: '3 GÖREMEDİM', desc: 'HARFLERİ GÖR', type: 'FREEZE' as const },
    { id: 'b3', amount: 3, cost: 1500, color: '#fbbf24', icon: SearchX, label: '3 BULAMADIM', desc: 'DOĞRUYU SEÇ', type: 'REVEAL' as const },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      className="w-full h-full flex flex-col bg-[#020617] overflow-hidden relative font-montserrat"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_70%)] opacity-80 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-screen transition-colors duration-1000"
        style={{ backgroundImage: `radial-gradient(circle at 100% 0%, #fbbf2433 0%, transparent 40%), radial-gradient(circle at 0% 100%, #f8717133 0%, transparent 40%)` }}
      />

      {/* Modern Compact Header */}
      <div className="absolute top-0 left-0 right-0 px-6 h-16 sm:h-20 flex items-center justify-between z-[200]">
        <button 
          onClick={onClose}
          className="w-8 h-8 sm:w-10 sm:h-10 glass-morphism-bright rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border-white/10 group bg-white/5"
        >
          <ArrowRight className="w-4 h-4 text-white opacity-40 group-hover:opacity-100 transition-opacity rotate-180" strokeWidth={3} />
        </button>

        <div className="text-center">
          <h1 className="text-[10px] sm:text-xs font-black text-white/40 tracking-[0.4em] uppercase italic">
            PORTAL MARKET
          </h1>
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 px-4 sm:px-10 flex flex-col gap-4 sm:gap-6 overflow-y-auto custom-scrollbar relative z-10 pt-16 sm:pt-20 pb-6">
        
        {/* Wallet Bento Card - Compact */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full glass-morphism border-white/10 p-5 sm:p-6 rounded-[32px] shadow-2xl relative overflow-hidden flex items-center justify-between gap-4 group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
          
          <div className="flex flex-col items-start relative z-20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span className="text-amber-400 font-black text-[8px] uppercase tracking-[0.2em]">MEVCUT BAKİYE</span>
            </div>
            <div className="text-white font-[1000] text-3xl sm:text-5xl tracking-tighter flex items-center gap-2 italic shrink-0">
              {(coins || 0).toLocaleString()} 
              <Coins className="w-6 h-6 sm:w-10 sm:h-10 text-amber-400" />
            </div>
          </div>
          
          <motion.button
            whileHover={hearts < 5 ? { scale: 1.05 } : {}}
            whileTap={hearts < 5 ? { scale: 0.95 } : {}}
            onClick={onWatchVideo}
            disabled={hearts >= 5}
            className={`px-6 py-4 rounded-[24px] border flex flex-col items-center gap-1 transition-all relative overflow-hidden group
              ${hearts >= 5 
                ? 'bg-white/5 border-white/5 opacity-40 cursor-not-allowed' 
                : 'bg-white text-black border-transparent shadow-xl active:scale-95'}`}
          >
            <Tv className={`w-5 h-5 ${hearts >= 5 ? 'opacity-40' : 'animate-pulse'}`} />
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-[1000] tracking-widest text-inherit uppercase">{hearts >= 5 ? 'DOLU' : 'YENİLE'}</span>
              <span className="text-[7px] font-bold opacity-40 uppercase tracking-tighter">REKLAM</span>
            </div>
          </motion.button>
        </motion.div>

        {/* Section Label */}
        <div className="flex items-center gap-4 px-2">
           <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] italic shrink-0">GÜÇLENDİRİCİLER & ÖZEL</span>
           <div className="h-[1px] flex-1 bg-white/5" />
        </div>

        {/* Item Grid - Tighter Bento Style */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {shopItems.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="relative group"
            >
              {item.popular && (
                <div className="absolute -top-2 left-6 z-30 bg-amber-500 px-2 py-0.5 rounded-full border border-[#020617]">
                  <span className="text-[6px] font-black text-white tracking-widest uppercase italic">POPÜLER</span>
                </div>
              )}
              
              <div className={`h-full glass-morphism rounded-[32px] p-5 shadow-xl relative overflow-hidden flex flex-col gap-4 transition-all duration-700 border-white/10 ${item.popular ? 'border-amber-500/20 bg-amber-500/[0.03]' : ''}`}>
                  <div className="flex items-center justify-between relative z-10">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: item.color }} />
                    </div>
                    <div className="text-right">
                      <h4 className="text-white font-[1000] text-sm sm:text-base tracking-tight uppercase leading-tight italic">{item.label}</h4>
                    </div>
                  </div>
                  
                  <div className="relative z-10">
                    <button 
                      onClick={() => onBuyHearts(item.cost, item.type, item.amount)}
                      disabled={coins < item.cost || (item.type === 'HEART' && hearts >= 5)}
                      className={`w-full py-3 rounded-xl font-[1000] tracking-widest text-[9px] flex items-center justify-center gap-2 transition-all uppercase italic
                        ${(coins < item.cost || (item.type === 'HEART' && hearts >= 5)) 
                          ? 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed opacity-50' 
                          : 'bg-white/10 border border-white/10 text-white hover:bg-white/20 active:scale-95'}`}
                    >
                      {item.type === 'HEART' && hearts >= 5 ? (
                        <span className="text-white/40">DOLU</span>
                      ) : (
                        <>
                          <span>{item.cost}</span>
                          <Coins className={`w-3 h-3 text-amber-400 ${coins < item.cost ? 'opacity-20' : ''}`} />
                        </>
                      )}
                    </button>
                    {coins < item.cost && !(item.type === 'HEART' && hearts >= 5) && (
                      <p className="text-[6px] text-red-500/40 text-center mt-2 font-bold uppercase tracking-widest">Yetersiz</p>
                    )}
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
      `}</style>
    </motion.div>
  );
};
