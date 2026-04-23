
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Zap, ShieldAlert, Rocket, X, Crown, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Cube3D } from './Cube3D';
import { SoundManager } from '../managers/SoundManager';

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBet: (amount: number) => void;
  currentCoins: number;
}

export const BettingModal: React.FC<BettingModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectBet, 
  currentCoins 
}) => {
  const bets = [
    { 
      amount: 0, 
      multiplier: 1, 
      label: "STANDART SEYİR", 
      desc: "Herhangi bir veri taahhüdü yok.",
      icon: Rocket,
      color: "#94a3b8"
    },
    { 
      amount: 200, 
      multiplier: 3, 
      label: "GÜMÜŞ KONTRAT", 
      desc: "Hatasız veri akışı için 3 katı verim.",
      icon: ShieldAlert,
      color: "#fbbf24"
    },
    { 
      amount: 500, 
      multiplier: 5, 
      label: "ALTIN ANLAŞMA", 
      desc: "Mükemmel senkronizasyon için 5 katı verim!",
      icon: Crown,
      color: "#d946ef"
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#020617]/95 backdrop-blur-xl"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-[#0a0a0a] rounded-[40px] border border-white/5 shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden relative"
          >
            {/* Technical Detail Lines */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
               <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            {/* Header */}
            <div className="p-10 pb-4 text-center relative overflow-hidden">
               <motion.div 
                 animate={{ opacity: [0.2, 0.5, 0.2] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-indigo-500 blur-sm" 
               />
               <h2 className="text-3xl font-black text-white tracking-[0.3em] mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">NOVA PROTOKOLÜ</h2>
               <p className="text-indigo-400/60 text-[10px] font-black tracking-[0.4em] uppercase">Sistem Entegrasyon Onayı Gerekli</p>
            </div>

            {/* Options */}
            <div className="p-8 flex flex-col gap-4">
              {bets.map((bet, i) => {
                const canAfford = currentCoins >= bet.amount;
                return (
                  <motion.button
                    key={i}
                    whileHover={canAfford ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.03)' } : {}}
                    whileTap={canAfford ? { scale: 0.98 } : {}}
                    onClick={() => canAfford && onSelectBet(bet.amount)}
                    disabled={!canAfford}
                    className={`
                      w-full flex items-center gap-6 p-6 rounded-3xl border transition-all relative overflow-hidden group
                      ${bet.amount === 0 ? 'bg-white/5 border-white/10' : 
                        canAfford ? 'bg-indigo-500/5 border-white/10 hover:border-indigo-500/50' :
                        'bg-red-500/5 border-red-500/10 opacity-30 grayscale'
                      }
                    `}
                  >
                    {/* Visual ID Tag */}
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                       <span className="text-[8px] font-mono text-white">PX-00{i+1}</span>
                    </div>

                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center border border-white/10 bg-black/40 shadow-inner group-hover:rotate-12 transition-transform duration-500`}>
                       <bet.icon className="w-8 h-8" style={{ color: bet.color }} />
                    </div>

                    <div className="flex-1 text-left">
                       <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-black text-white text-lg tracking-tight uppercase italic group-hover:text-indigo-300 transition-colors">{bet.label}</span>
                          {bet.amount > 0 && (
                             <span className="bg-indigo-500/20 text-indigo-400 text-[8px] font-black px-2 py-0.5 rounded-full border border-indigo-500/30">x{bet.multiplier} VERİM</span>
                          )}
                       </div>
                       <p className="text-white/30 text-[10px] font-medium leading-relaxed">{bet.desc}</p>
                    </div>

                    {bet.amount > 0 && (
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                         <div className="flex items-center gap-2">
                            <span className={`font-black text-lg ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>{bet.amount}</span>
                            <div className="mt-0.5">
                               <Cube3D size={16} color={canAfford ? "#fbbf24" : "#f87171"} speed={0} visualStyle="LUMINA" />
                            </div>
                         </div>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            <div className="p-10 pt-0 flex flex-col gap-6">
               <div className="bg-white/2 p-5 rounded-3xl border border-white/5 flex items-start gap-4">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 animate-pulse" />
                  <p className="text-white/40 text-[9px] font-bold leading-relaxed uppercase tracking-wider">
                     UYARI: Protokol ödülleri için <span className="text-white">SIFIR HATA</span> standardı zorunludur. Senkronizasyon bozulursa veri paketi (yatırılan miktar) geri döndürülemez.
                  </p>
               </div>

               <Button 
                 variant="ghost" 
                 onClick={onClose} 
                 className="w-full !py-5 opacity-30 hover:opacity-100 font-black tracking-[0.3em] text-[10px] transition-all"
               >
                 PROTOKOLÜ İPTAL ET
               </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
