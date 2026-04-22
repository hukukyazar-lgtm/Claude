
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Heart, Zap, Tv, AlertTriangle, RefreshCw, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LevelFailModalProps {
  hearts: number;
  lastLifeRefillTime: number;
  onRetry: () => void;
  onShop: () => void;
  onExit: () => void;
  onWatchVideo: () => void;
}

const REFILL_TIME = 10 * 60 * 1000;

export const LevelFailModal: React.FC<LevelFailModalProps> = ({ hearts, lastLifeRefillTime, onRetry, onShop, onExit, onWatchVideo }) => {
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    if (hearts >= 5) return;

    const timer = setInterval(() => {
      const now = Date.now();
      const nextRefill = lastLifeRefillTime + REFILL_TIME;
      const remaining = Math.max(0, nextRefill - now);
      
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCountdown(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [hearts, lastLifeRefillTime]);

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col items-center justify-center p-6 bg-[#020617]/90 backdrop-blur-2xl overflow-hidden font-sans">
      {/* Arka Plan Efektleri */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.15)_0%,transparent_70%)] animate-pulse" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen" />
        
        {/* Hareketli Çizgiler */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 3 + i, repeat: Infinity, ease: "linear", delay: i * 0.5 }}
              className="h-[1px] w-full bg-red-500 absolute"
              style={{ top: `${i * 10}%` }}
            />
          ))}
        </div>
      </div>

      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="z-10 w-full max-w-md flex flex-col items-center"
      >
        {/* Teknik HUD Çerçevesi */}
        <div className="relative w-full p-8 rounded-[40px] border border-red-500/30 bg-black/40 backdrop-blur-md shadow-[0_0_50px_rgba(220,38,38,0.2)] overflow-hidden">
          {/* Köşe Parantezleri */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-red-500/50" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-red-500/50" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-red-500/50" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-red-500/50" />

          {/* Görsel Merkez - Stabilize Olmayan Çekirdek */}
          <div className="relative h-48 flex items-center justify-center mb-10 mt-4">
            <div className="absolute w-32 h-32 rounded-full border-2 border-dashed border-red-500/30 animate-[spin_10s_linear_infinite]" />
            <div className="absolute w-24 h-24 rounded-full border border-red-500/50 animate-[spin_15s_linear_infinite_reverse]" />
            
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
                filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="relative z-10"
            >
              <XCircle className="w-20 h-20 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
            </motion.div>

            {/* Glitch Parçacıkları */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  x: [0, (i % 2 === 0 ? 40 : -40)],
                  y: [0, (i < 3 ? 40 : -40)],
                  opacity: [0, 1, 0]
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="absolute w-1 h-1 bg-red-400 rounded-full"
              />
            ))}
          </div>

          {/* Can Durumu Paneli */}
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 mb-8">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-mono font-bold text-white/40 uppercase tracking-widest"></span>
              {hearts < 5 && countdown && (
                <div className="flex items-center gap-2 text-red-400 font-mono text-[10px]">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  <span>{countdown}</span>
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-3">
              {[...Array(5)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-12 rounded-xl border flex items-center justify-center transition-all duration-500
                    ${i < hearts 
                      ? 'bg-red-500/20 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                      : 'bg-black/40 border-white/5 opacity-20'}`}
                >
                  <Heart className={`w-5 h-5 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-white/10'}`} />
                </div>
              ))}
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="space-y-4">
            {hearts > 0 ? (
              <Button 
                variant="coral" 
                onClick={onRetry} 
                className="w-full !py-6 !text-xl !rounded-2xl !border-b-8 !border-red-700 shadow-[0_10px_30px_rgba(220,38,38,0.3)] active:!border-b-0 active:translate-y-2 transition-all group"
              >
                <span className="font-black italic tracking-widest">TEKRAR DENE</span>
              </Button>
            ) : (
              <div className="space-y-3">
                <Button 
                  variant="amber" 
                  onClick={onShop} 
                  className="w-full !py-6 !text-xl !rounded-2xl !border-b-8 !border-amber-700 shadow-[0_10px_30px_rgba(245,158,11,0.3)] active:!border-b-0 active:translate-y-2 transition-all"
                >
                  <span className="font-black italic tracking-widest">HAK SATIN AL</span>
                </Button>

                <button 
                  onClick={onWatchVideo}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 group"
                >
                  <Tv className="w-5 h-5 text-red-400" />
                  <div className="text-left">
                    <div className="text-white font-black text-xs italic tracking-widest">VİDEO İZLE</div>
                    <div className="text-[8px] font-bold text-white/30 uppercase">+1 CAN KAZAN</div>
                  </div>
                </button>
              </div>
            )}
            
            <button 
              onClick={onExit}
              className="w-full py-3 text-white/30 hover:text-white/60 font-mono text-[10px] uppercase tracking-[0.3em] transition-colors"
            >
              Ana Menüye Dön
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
