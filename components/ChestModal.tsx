
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';
import { SoundManager } from '../managers/SoundManager';
import { Sparkles, Gift, Coins, Wallet, X } from 'lucide-react';

interface ChestModalProps {
  onClose: () => void;
  onReward: () => void;
  rewardAmount: number;
}

export const ChestModal: React.FC<ChestModalProps> = ({ onClose, onReward, rewardAmount }) => {
  const [isOpened, setIsOpened] = useState(false);

  const handleOpen = () => {
    if (isOpened) return;
    setIsOpened(true);
    SoundManager.getInstance().playJackpot();
    setTimeout(() => {
        onReward();
    }, 500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-2xl"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(59,130,246,0.2)_0%,_transparent_70%)] pointer-events-none" />
      
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: `${Math.random() * 100}%`, 
              y: `${Math.random() * 100}%`,
              opacity: 0 
            }}
            animate={{ 
              y: [null, '-20vh'],
              opacity: [0, 0.5, 0]
            }}
            transition={{ 
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-blue-400 rounded-full blur-[1px]"
          />
        ))}
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center text-center relative py-10 px-2"
      >
        {/* Close Button */}
        {!isOpened && (
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute -top-12 right-0 w-10 h-10 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </motion.button>
        )}
        
        <div className="relative mb-6 sm:mb-10 cursor-pointer group" onClick={handleOpen}>
           <motion.div 
             animate={isOpened ? { scale: 4, opacity: 0.6 } : { scale: 1.5, opacity: 0.4 }}
             transition={{ duration: 1 }}
             className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" 
           />
           
           <motion.div 
             animate={isOpened ? { scale: 1.05, y: -10 } : { scale: 1, y: 0 }}
             whileHover={!isOpened ? { scale: 1.1 } : {}}
             whileTap={!isOpened ? { scale: 0.9 } : {}}
             className="relative w-32 h-32 sm:w-48 sm:h-48 flex items-center justify-center drop-shadow-[0_0_50px_rgba(59,130,246,0.5)]"
           >
              {isOpened ? (
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12 }}
                  >
                    <Sparkles className="w-24 h-24 sm:w-40 sm:h-40 text-blue-400" />
                  </motion.div>
                  <div className="absolute inset-0 bg-blue-400 blur-3xl opacity-30 animate-pulse" />
                </div>
              ) : (
                <div className="relative">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, -2, 2, 0]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Gift className="w-24 h-24 sm:w-40 sm:h-40 text-white drop-shadow-2xl" />
                  </motion.div>
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full border-2 sm:border-4 border-slate-900 flex items-center justify-center shadow-lg"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-ping" />
                  </motion.div>
                </div>
              )}
           </motion.div>

           <AnimatePresence>
             {isOpened && (
                <motion.div 
                  initial={{ y: 0, opacity: 0, scale: 0.5 }}
                  animate={{ y: -55, opacity: 1, scale: 1 }}
                  className="absolute top-0 left-1/2 -translate-x-1/2"
                >
                  <div className="flex flex-col items-center">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-b from-amber-300 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_50px_#fbbf24] border-4 border-white/30 relative"
                    >
                      <Coins className="w-10 h-10 sm:w-14 sm:h-14 text-amber-900 drop-shadow-sm" />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent rounded-full" />
                    </motion.div>
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                      className="text-white font-[900] text-4xl sm:text-6xl tracking-tighter mt-4 drop-shadow-[0_8px_16px_rgba(0,0,0,0.6)] italic transform -skew-x-6"
                    >
                      +{rewardAmount}
                    </motion.div>
                  </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        <div className="relative mb-4 sm:mb-6">
          <motion.h2 
            key={isOpened ? 'opened' : 'closed'}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-white text-3xl sm:text-5xl lg:text-6xl font-[900] tracking-tighter uppercase leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)] italic transform -skew-x-12"
          >
             {isOpened ? 'MUHTEŞEM!' : 'GÜNLÜK HEDİYE'}
          </motion.h2>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "80%" }}
            className="h-1.5 mx-auto bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full mt-4 blur-[0.5px]" 
          />
        </div>

        <motion.div 
          animate={{ 
            y: isOpened ? 0 : 10,
            opacity: isOpened ? 1 : 0.7,
            scale: isOpened ? 1.05 : 1
          }}
          className={`bg-gradient-to-br from-white/20 via-white/5 to-transparent border border-white/20 backdrop-blur-3xl p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] w-full mb-8 sm:mb-12 transition-all duration-700 shadow-[0_40px_80px_rgba(0,0,0,0.5)] overflow-hidden relative group`}
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1500" />
           
           {isOpened ? (
             <div className="space-y-4 relative z-10">
                <p className="text-blue-400 font-[900] uppercase text-xs tracking-[0.6em] drop-shadow-sm">HAZİNE TOPLANDI</p>
                <div className="flex items-center justify-center gap-5">
                    <div className="w-14 h-14 bg-blue-500/30 rounded-2xl flex items-center justify-center border border-blue-400/40 shadow-inner">
                      <Wallet className="w-8 h-8 text-blue-400" />
                    </div>
                   <span className="text-white font-black text-2xl uppercase tracking-tight drop-shadow-sm">LUMICOIN CÜZDANI</span>
                </div>
             </div>
           ) : (
             <div className="space-y-3">
               <p className="text-white font-black text-3xl uppercase tracking-tight leading-tight drop-shadow-lg">
                 SANDIĞI AÇMAK İÇİN<br/>
                 <span className="text-blue-400 animate-pulse">DOKUN!</span>
               </p>
               <div className="w-16 h-1.5 bg-white/20 mx-auto rounded-full" />
             </div>
           )}
        </motion.div>

        <Button 
          variant={isOpened ? "amber" : "white"} 
          onClick={onClose} 
          className="w-full !py-4 sm:!py-8 !text-2xl sm:!text-4xl !rounded-[24px] sm:!rounded-[40px] !border-b-[8px] sm:!border-b-[16px] !border-x-[4px] sm:!border-x-[6px] shadow-[0_25px_50px_rgba(0,0,0,0.6)] active:!border-b-[2px] sm:active:!border-b-[4px] active:!translate-y-2 sm:active:!translate-y-3 transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <span className="font-black italic tracking-tighter relative z-10 uppercase">
            {isOpened ? "HARİKA!" : "KAPAT"}
          </span>
        </Button>
      </motion.div>
    </motion.div>
  );
};
