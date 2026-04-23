import React from 'react';
import { Button } from './Button';
import { Heart, Coins, Tv, Sparkles, ArrowLeft, Eye, SearchX, X, Zap, ShoppingBag, Box, Package } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { motion } from 'motion/react';

interface ShopModalProps {
  onClose: () => void;
  coins: number;
  hearts: number;
  onBuyHearts: (cost: number, type: 'HEART' | 'FREEZE' | 'REVEAL', amount: number) => void;
  onWatchVideo: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ coins, hearts, onBuyHearts, onWatchVideo, onClose }) => {
  const shopItems = [
    { id: 'p1', amount: 1, cost: 450, color: '#22d3ee', icon: Eye, label: 'GÖREMEDİM', desc: 'DONDURUCU', type: 'FREEZE' as const },
    { id: 'p3', amount: 3, cost: 1200, color: '#22d3ee', icon: Eye, label: 'GÖREMEDİM', desc: 'STOK PAKETİ', type: 'FREEZE' as const },
    { id: 'b1', amount: 1, cost: 800, color: '#fbbf24', icon: SearchX, label: 'BULAMADIM', desc: 'RADAR', type: 'REVEAL' as const },
    { id: 'b3', amount: 3, cost: 2100, color: '#fbbf24', icon: SearchX, label: 'BULAMADIM', desc: 'AŞIRI GÖRÜŞ', type: 'REVEAL' as const },
    { id: 'h1', amount: 1, cost: 500, color: '#f87171', icon: Heart, label: 'CAN', desc: 'HÜCRESEL', type: 'HEART' as const },
    { id: 'h5', amount: 5, cost: 2000, color: '#ec4899', icon: Heart, label: 'CAN', desc: 'MOLEKÜLER', type: 'HEART' as const },
  ];

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full h-full flex flex-col bg-[#020617] overflow-hidden relative font-montserrat"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 pointer-events-none" />

      {/* Header Section - Synced with other modals */}
      <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 h-24 sm:h-32 flex items-center justify-center z-[200] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent backdrop-blur-sm">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-[0.4em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            MARKET
          </h1>
        </motion.div>

        <button 
          onClick={onClose}
          className="absolute right-6 sm:right-10 w-8 h-8 sm:w-10 sm:h-10 glass-morphism-bright rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border-white/20 group hover:bg-white/10"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 flex flex-col px-6 sm:px-12 pt-24 sm:pt-32 pb-6 relative z-10 max-h-full">
        
        {/* Wallet Dashboard - Strictly no scroll compact panel */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="flex-1 glass-morphism border-white/5 rounded-[24px] p-4 flex items-center justify-between shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-3 relative z-10">
               <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <Coins className="w-5 h-5 text-amber-500" />
               </div>
               <div>
                  <span className="block text-[8px] font-black text-white/40 uppercase tracking-[0.2em] mb-0.5">Mevcut Bakiyen</span>
                  <div className="flex items-center gap-1.5 font-black text-xl text-white italic leading-none truncate">
                    {(coins || 0).toLocaleString()} <span className="text-[10px] text-amber-400 not-italic">RP</span>
                  </div>
               </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onWatchVideo}
              disabled={hearts >= 5}
              className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all relative z-10 shadow-lg border
                ${hearts >= 5 
                  ? 'bg-white/5 border-white/5 opacity-30 cursor-not-allowed' 
                  : 'bg-white text-black border-transparent active:scale-95'}`}
            >
               <Tv className="w-3.5 h-3.5" />
               <div className="flex flex-col items-start leading-none gap-0.5">
                  <span className="text-[10px] font-black uppercase">YENİLE</span>
                  <span className="text-[6px] font-bold opacity-40 uppercase">REKLAM</span>
               </div>
            </motion.button>
          </div>
        </div>

        {/* Item Grid - Adjusted for zero scroll on most screen sizes */}
        <div className="grid grid-cols-2 gap-2 flex-1">
          {shopItems.map((item, idx) => (
            <motion.div 
              key={`${item.id}-${idx}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="relative group h-full max-h-[150px] sm:max-h-none"
            >
               <div className="glass-morphism border-white/5 rounded-[24px] p-3 flex flex-col justify-between items-center text-center transition-all duration-500 hover:border-white/20 active:scale-[0.98] h-full shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  {/* Redesigned Quantity Tag - Moved to Top Left */}
                  <div className="absolute top-0 left-0 px-3 py-1 bg-white/10 backdrop-blur-md rounded-br-2xl border-r border-b border-white/10 shadow-lg">
                    <span className="text-[9px] font-black text-white italic tracking-widest opacity-80">x{item.amount}</span>
                  </div>

                  <div className="relative mt-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                       <item.icon className="w-6 h-6 transition-all duration-500" style={{ color: item.color, filter: `drop-shadow(0 0 10px ${item.color}66)` }} />
                    </div>
                  </div>

                  <div className="mt-1">
                    <h3 className="text-[11px] font-black text-white/90 uppercase tracking-tight italic">{item.label}</h3>
                    <p className="text-[8px] font-bold text-white/20 uppercase tracking-widest">{item.desc}</p>
                  </div>

                  <button 
                    onClick={() => onBuyHearts(item.cost, item.type, item.amount)}
                    disabled={coins < item.cost || (item.type === 'HEART' && hearts >= 5)}
                    className={`w-full py-2.5 rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 transition-all
                      ${(coins < item.cost || (item.type === 'HEART' && hearts >= 5)) 
                        ? 'bg-white/5 text-white/10 border border-white/5 cursor-not-allowed' 
                        : 'bg-white/10 border border-white/10 text-white hover:bg-white/20 shadow-md transform'}`}
                  >
                     {item.type === 'HEART' && hearts >= 5 ? (
                       <span className="text-white/20 tracking-widest">DOLU</span>
                     ) : (
                       <>
                         <span>{item.cost.toLocaleString()}</span>
                         <Coins className="w-3.5 h-3.5 text-amber-500" />
                       </>
                     )}
                  </button>
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
