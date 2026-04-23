
import React, { useState } from 'react';
import { Button } from './Button';
import { Cube3D } from './Cube3D';
import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Coins, X } from 'lucide-react';

interface MemoryTransitionModalProps {
  onConfirm: (bet?: number) => void;
  onExit?: () => void;
  currentCoins: number;
}

export const MemoryTransitionModal: React.FC<MemoryTransitionModalProps> = ({ onConfirm, onExit, currentCoins }) => {
  const { palette } = useTheme();
  const themeColor = palette[0];
  const [showRiskSelector, setShowRiskSelector] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const riskOptions = [
    { amount: 100, label: "100" },
    { amount: 250, label: "250" },
    { amount: 500, label: "500" },
    { amount: 1000, label: "1000" }
  ];

  const handleSelectRisk = (amount: number) => {
    setSelectedAmount(amount);
    setShowConfirmation(true);
  };

  const handleConfirmRisk = () => {
    if (selectedAmount !== null) {
      onConfirm(selectedAmount);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-8 bg-transparent backdrop-blur-3xl animate-[fadeIn_0.6s_cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, ${themeColor}33 0%, transparent 70%)` }} />
      
      {/* Background Animated Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[1px] h-full animate-[scanline_4s_linear_infinite]" style={{ backgroundColor: themeColor }} />
        <div className="absolute top-0 left-3/4 w-[1px] h-full animate-[scanline_4s_linear_infinite_2s]" style={{ backgroundColor: themeColor }} />
      </div>

      <div className="w-full max-w-sm flex flex-col items-center text-center z-10">
        <AnimatePresence mode="wait">
          {showConfirmation ? (
            <motion.div 
              key="confirmation"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              <div className="mb-8 text-center">
                 <div className="w-20 h-20 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                    <Zap className="w-10 h-10 text-rose-500 fill-rose-500 animate-pulse" />
                 </div>
                 <h3 className="text-white font-[900] text-4xl tracking-tighter uppercase italic mb-4">EMİN MİSİN?</h3>
                 <p className="text-white/60 text-sm font-medium tracking-wide">
                   <span className="text-rose-400 font-black">{selectedAmount === currentCoins ? 'TÜM' : selectedAmount}</span> PUANINI RİSKE EDİYORSUN. <br/>
                   HATA YAPARSAN HEPSİ GİDER!
                 </p>
              </div>

              <div className="w-full flex flex-col gap-4">
                 <Button 
                   variant="custom" 
                   onClick={handleConfirmRisk} 
                   className="w-full !py-7 !text-3xl !rounded-[32px] !border-b-[10px] !border-x-[2px] active:!border-b-[2px] active:!translate-y-2 transition-all"
                   style={{ 
                       backgroundColor: '#f43f5e',
                       borderColor: '#be123c',
                       boxShadow: '0 10px 30px rgba(244,63,94,0.3)'
                   }}
                 >
                    <span className="font-black italic tracking-tight text-white">EVET, RİSKE ET!</span>
                 </Button>

                 <button 
                  onClick={() => setShowConfirmation(false)}
                  className="p-4 flex items-center justify-center gap-2 group transition-all"
                >
                  <span className="text-white/40 group-hover:text-white font-black text-xs uppercase tracking-widest italic underline decoration-white/20 underline-offset-4">HAYIR, VAZGEÇ</span>
                </button>
              </div>
            </motion.div>
          ) : !showRiskSelector ? (
            <motion.div 
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              {/* Focus Icon */}
              <div className="mb-12 relative group">
                <div className="absolute inset-[-60px] blur-[80px] animate-pulse rounded-full" style={{ backgroundColor: `${themeColor}1a` }} />
                <div className="relative transform group-hover:scale-110 transition-all duration-700" style={{ filter: `drop-shadow(0 0 30px ${themeColor}66)` }}>
                  <Cube3D 
                    size={80} 
                    color={themeColor} 
                    speed={20} 
                    isGlassy={true} 
                    rotationAxis="TUMBLE" 
                    faceLabels={['L', 'U', 'M', 'I', 'N', 'A']}
                  />
                </div>
              </div>

              {/* Main Text */}
              <div className="mb-12 relative text-center">
                <div className="absolute -inset-4 blur-2xl rounded-full" style={{ backgroundColor: `${themeColor}0d` }} />
                <h2 className="relative text-white text-5xl font-[900] tracking-tighter uppercase leading-[1] italic transform -skew-x-6 drop-shadow-lg">
                  &nbsp;5 DOĞRU <br/>
                  <span className="drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] text-4xl mt-2 block" style={{ color: themeColor }}>KELİME</span>
                </h2>
                <div className="h-1 w-24 mx-auto rounded-full mt-6 animate-pulse" style={{ backgroundColor: `${themeColor}4d` }} />
              </div>

              {/* Actions */}
              <div className="w-full flex flex-col gap-4">
                <Button 
                  variant="custom" 
                  onClick={() => setShowRiskSelector(true)} 
                  className="w-full !py-8 !text-3xl !rounded-[36px] !border-b-[12px] !border-x-[4px] active:!border-b-[4px] active:!translate-y-2 transition-all group overflow-hidden relative"
                  style={{ 
                      backgroundColor: themeColor,
                      borderColor: `${themeColor}cc`,
                      boxShadow: `0 20px 40px ${themeColor}66`
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="flex items-center justify-center gap-3 relative z-10">
                    <span className="font-black italic tracking-tight text-white drop-shadow-md">HEPSİNİ HATIRLIYORUM!</span>
                  </div>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="risk"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex flex-col items-center"
            >
              <div className="mb-8 text-center">
                 <h3 className="text-white font-[900] text-3xl tracking-tighter uppercase italic mb-2">RİSK MİKTARI SEÇ!</h3>
                 <p className="text-white/40 text-xs font-bold tracking-widest uppercase">Hatasız tamamlarsan büyük ödül senin</p>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full mb-6">
                 {riskOptions.map((opt) => {
                   const canAfford = currentCoins >= opt.amount;
                   return (
                     <motion.button
                       key={opt.amount}
                       whileHover={canAfford ? { scale: 1.05 } : {}}
                       whileTap={canAfford ? { scale: 0.95 } : {}}
                       disabled={!canAfford}
                       onClick={() => handleSelectRisk(opt.amount)}
                       className={`
                         flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all relative overflow-hidden
                         ${canAfford ? 'bg-white/5 border-white/10 hover:border-amber-400 hover:bg-amber-400/5' : 'bg-red-500/5 border-red-500/10 opacity-30 grayscale'}
                       `}
                     >
                        <div className="flex items-center gap-2 mb-1">
                           <span className={`text-2xl font-black italic ${canAfford ? 'text-white' : 'text-red-400'}`}>{opt.label}</span>
                           <Coins className={`w-5 h-5 ${canAfford ? 'text-amber-400' : 'text-red-400'}`} />
                        </div>
                        <span className="text-[10px] font-bold text-white/30 uppercase">PUAN RİSK ET</span>
                     </motion.button>
                   );
                 })}
              </div>

              {/* HEPSİNİ RİSKE ET BUTONU */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectRisk(currentCoins)}
                className="w-full mb-8 p-6 rounded-3xl border-2 border-rose-500/40 bg-rose-500/10 flex flex-col items-center justify-center group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-3xl font-black italic text-rose-400 uppercase tracking-tighter">HEPSİNİ RİSKE ET</span>
                  <Zap className="w-6 h-6 text-rose-500 fill-rose-500 animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-base font-black text-rose-300/60 ">{currentCoins.toLocaleString()}</span>
                   <Coins className="w-4 h-4 text-rose-300/60" />
                </div>
              </motion.button>

              <button 
                onClick={() => onConfirm()}
                className="p-2 flex items-center gap-2 group transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all">
                   <X className="w-4 h-4 text-white/40 group-hover:text-white" />
                </div>
                <span className="text-white/40 group-hover:text-white font-black text-xs uppercase tracking-widest italic">RİSKSİZ DEVAM ET</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
