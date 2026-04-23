
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onFinished: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [showBrand, setShowBrand] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBrand(true), 100);
    const finishTimer = setTimeout(() => onFinished(), 3000);
    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinished]);

  return (
    <div className="fixed inset-0 z-[10000] bg-[#020617] flex items-center justify-center overflow-hidden">
      {/* Background Nano Tech Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_50%,#1e293b,transparent)]" />
      </div>

      <AnimatePresence>
        {showBrand && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <div className="text-center space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-white text-7xl font-[1000] tracking-tighter italic uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
              >
                 LUMINA
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
                className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateY(100%) rotate(45deg); }
          100% { transform: translateY(-100%) rotate(45deg); }
        }
      `}</style>
    </div>
  );
};
