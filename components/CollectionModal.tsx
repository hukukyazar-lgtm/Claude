import React, { useMemo, useState } from 'react';
import { Cube3D } from './Cube3D';
import { Image as ImageIcon, ArrowRight, Crown, Sparkles, Filter, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CollectionModalProps {
  level: number;
  onClose: () => void;
}

const BASE_NAMES = ["DÜNYA", "MARS", "VENÜS", "MERKÜR", "JÜPİTER", "SATÜRN", "URANÜS", "NEPTÜN", "PLÜTON", "LUMINA"];
const CARD_IMAGES = [
  "1614730321146-b6fa6a46bc46", 
  "1614728894747-a83421e2b9c9", 
  "1614732414444-096e5f1122d5", 
  "1534796636912-3b95b3ab5986",
  "1446776811953-b23d57bd21aa",
  "1451187580459-43490279c0fa",
  "1446941611752-94270ba21bf6"
];

const rarities = [
  { label: "YAYGIN", color: "#94a3b8", gradient: "from-[#94a3b8] to-[#1e293b]", shadow: "rgba(148, 163, 184, 0.3)" },
  { label: "NADİR", color: "#22d3ee", gradient: "from-[#22d3ee] to-[#0891b2]", shadow: "rgba(34, 211, 238, 0.4)" },
  { label: "EPİK", color: "#f472b6", gradient: "from-[#f472b6] to-[#831843]", shadow: "rgba(244, 114, 182, 0.4)" },
  { label: "EFSANEVİ", color: "#fbbf24", gradient: "from-[#fbbf24] to-[#78350f]", shadow: "rgba(251, 191, 36, 0.5)" }
];

export const CollectionModal: React.FC<CollectionModalProps> = ({ level, onClose }) => {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const currentPlanetId = Math.ceil(level / 6);

  const inventory = useMemo(() => {
    return Array.from({ length: 100 }, (_, i) => {
      const id = i + 1;
      const planetName = id === 100 ? "LUMINA" : `${BASE_NAMES[i % BASE_NAMES.length]}-${Math.floor(i / 10) + 1}`;
      const imageId = CARD_IMAGES[i % CARD_IMAGES.length];
      const isOwned = currentPlanetId >= id;
      
      let rarityIdx = 0;
      if (id === 100) rarityIdx = 3;
      else if (id % 10 === 0) rarityIdx = 2;
      else if (id % 5 === 0) rarityIdx = 1;

      return {
        id,
        name: planetName,
        rarity: rarities[rarityIdx],
        image: `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&q=80&w=400`,
        owned: isOwned,
        galaxy: Math.floor(i / 10) + 1
      };
    });
  }, [currentPlanetId]);

  const galaxies = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const ownedCount = inventory.filter(c => c.owned).length;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full h-full flex flex-col bg-[#020617] overflow-hidden relative font-montserrat"
    >
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
      
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * 100 + '%', 
              y: Math.random() * 100 + '%',
              opacity: Math.random() * 0.3
            }}
            animate={{ 
              y: [null, '-100%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 10
            }}
            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* Header Section */}
      <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 h-24 sm:h-32 flex items-center justify-center z-[200] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent backdrop-blur-sm">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-[0.4em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            ALBÜM
          </h1>
        </motion.div>

        <button 
          onClick={onClose}
          className="absolute right-6 sm:right-10 w-8 h-8 sm:w-10 sm:h-10 glass-morphism-bright rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border-white/20 group"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-40 relative z-10 pt-32 sm:pt-40">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 glass-morphism-bright rounded-[36px] p-6 flex justify-between items-center shadow-2xl relative overflow-hidden group border-white/10"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
           <div className="flex flex-col items-start relative z-10">
              <span className="text-[9px] font-black text-indigo-400 tracking-[0.4em] uppercase mb-1 opacity-80">KOLEKSİYON TAMAMLANMA</span>
              <div className="flex items-center gap-2">
                 <span className="text-3xl font-black text-white tracking-tighter italic">{ownedCount}</span>
                 <span className="text-white/20 font-black text-lg">/ 100</span>
              </div>
           </div>
           <div className="h-14 w-14 glass-morphism rounded-2xl flex items-center justify-center border border-white/10 relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-400/20 to-transparent animate-pulse" />
              <ImageIcon className="w-7 h-7 text-white/40 z-10" />
           </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 px-8 pb-6 overflow-x-auto custom-scrollbar shrink-0 z-20">
         <div className="flex items-center gap-2 mr-2 opacity-40">
           <Filter className="w-4 h-4 text-white" />
         </div>
         {rarities.map((r, i) => (
           <motion.button 
             key={i}
             initial={{ x: 20, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 0.4 + i * 0.05 }}
             onClick={() => setActiveFilter(activeFilter === r.label ? null : r.label)}
             whileTap={{ scale: 0.95 }}
             className={`px-6 py-3 rounded-2xl border font-black text-[10px] tracking-widest uppercase transition-all whitespace-nowrap active:scale-95 flex items-center gap-2 ${activeFilter === r.label ? 'bg-white text-[#0f172a] border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/30 border-white/10'}`}
           >
             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
             {r.label}
           </motion.button>
         ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar z-10 pb-32">
        {galaxies.map((galaxyNum) => {
          const galaxyCards = inventory.filter(c => c.galaxy === galaxyNum && (!activeFilter || c.rarity.label === activeFilter));
          if (galaxyCards.length === 0) return null;

          return (
            <div key={galaxyNum} className="mb-12">
               <div className="px-8 mb-4 flex justify-between items-end">
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-indigo-400/40" />
                    <h3 className="text-white/20 font-black text-[11px] tracking-[0.6em] uppercase">GALAKSİ #{galaxyNum}</h3>
                  </div>
                  <span className="text-[9px] font-black text-white/10 uppercase flex items-center gap-1 tracking-widest">KAYDIR <ArrowRight className="w-3 h-3" /></span>
               </div>
               
               <div className="flex gap-6 overflow-x-auto px-8 py-4 snap-x custom-scrollbar perspective-[1000px]">
                  {galaxyCards.map((card, idx) => (
                    <motion.div 
                      key={card.id} 
                      initial={{ scale: 0.8, opacity: 0, rotateY: 20 }}
                      whileInView={{ scale: 1, opacity: 1, rotateY: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, type: 'spring', damping: 20 }}
                      className={`relative flex-shrink-0 w-52 aspect-[3/4.8] rounded-[44px] border overflow-hidden transition-all duration-500 snap-center shadow-2xl backdrop-blur-xl group ${card.owned ? 'scale-100 border-white/20' : 'opacity-20 grayscale scale-90 border-white/5'}`}
                      style={{ 
                          boxShadow: card.owned ? `0 20px 40px ${card.rarity.shadow}` : 'none'
                      }}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.rarity.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                      
                      {card.owned && (
                        <>
                          <img src={card.image} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay scale-110 group-hover:scale-125 transition-transform duration-1000" alt="" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />
                        </>
                      )}

                      <div className="absolute inset-0 p-6 flex flex-col items-center justify-between z-10 text-center">
                         <div className="w-full flex justify-between items-center">
                            <span className="text-[9px] font-black bg-black/60 px-3 py-1 rounded-xl text-white/80 border border-white/10 uppercase tracking-widest">#{card.id}</span>
                            {card.owned ? (
                              card.rarity.label === 'EFSANEVİ' && <Crown className="w-5 h-5 text-amber-500 animate-bounce" />
                            ) : (
                              <Lock className="w-4 h-4 text-white/20" />
                            )}
                         </div>

                         <div className="w-24 h-24 flex items-center justify-center relative group/cube">
                            <Cube3D 
                                size={70} 
                                color={card.owned ? card.rarity.color : '#475569'} 
                                speed={card.owned ? 5 : 0} 
                                label={card.owned ? "" : "?"}
                                isGlassy={true}
                                opacity={card.owned ? 1 : 0.2}
                            />
                            {card.owned && (
                              <div className="absolute inset-0 bg-white/5 rounded-full blur-2xl opacity-0 group-hover/cube:opacity-100 transition-opacity" />
                            )}
                         </div>

                         <div className="w-full">
                            <h4 className="text-white font-black text-xl tracking-tighter uppercase truncate mb-1 italic drop-shadow-lg">{card.owned ? card.name : '???'}</h4>
                            <div className="text-[9px] font-black uppercase tracking-[0.3em] drop-shadow-sm" style={{ color: card.rarity.color }}>{card.rarity.label}</div>
                         </div>
                      </div>
                      
                      {/* Shimmer Effect */}
                      {card.owned && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                      )}
                    </motion.div>
                  ))}
               </div>
            </div>
          );
        })}
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
