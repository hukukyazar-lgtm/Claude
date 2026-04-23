
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';
import { Cube3D } from './Cube3D';
import { Brain, Search, Sparkles, ChevronRight } from 'lucide-react';
import { SoundManager } from '../managers/SoundManager';

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  demo?: React.ReactNode;
}

export const VisualTutorial: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: Step[] = [
    {
      title: "HAFIZANA GÜVEN",
      description: "Küpün üzerindeki harfleri ve dizilimlerini dikkatlice incele. Her saniye değerli!",
      icon: <Brain className="w-8 h-8" />,
      color: "#22d3ee",
      demo: (
        <div className="relative w-40 h-40 flex items-center justify-center">
            <motion.div
               animate={{ rotateY: 360 }}
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
               style={{ transformStyle: 'preserve-3d' }}
            >
                <Cube3D size={80} label="A" color="#22d3ee" visualStyle="NEON" />
            </motion.div>
        </div>
      )
    },
    {
       title: "DOĞRUYU BUL",
       description: "Hafızandaki harflerle eşleşen doğru kelimeyi seç. Hızlı olursan daha çok puan kazanırsın!",
       icon: <Search className="w-8 h-8" />,
       color: "#4ade80",
       demo: (
         <div className="relative flex flex-col items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none scale-150">
               <Cube3D size={120} color="#4ade80" speed={15} rotationAxis="TUMBLE" visualStyle="LUMINA" label="AKL" />
            </div>
            <motion.div 
               animate={{ y: [0, -5, 0], scale: [1, 1.05, 1] }}
               transition={{ duration: 2, repeat: Infinity }}
               className="relative z-10 bg-emerald-500/20 border border-emerald-400/50 py-4 px-8 rounded-2xl shadow-[0_0_30px_rgba(74,222,128,0.2)]"
            >
               <span className="text-2xl font-black text-emerald-400 tracking-tighter italic">LUMINA</span>
            </motion.div>
         </div>
       )
    },
    {
       title: "LUMINA DÜNYASI",
       description: "İlk gezegenden başlayıp gizemli Lumina'ya kadar uzanan destansı bir yolculuk. Tüm kapıları aç ve zirveye ulaş!",
       icon: <Sparkles className="w-8 h-8" />,
       color: "#fb923c",
       demo: (
         <div className="relative w-48 h-20 flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-orange-400/50 to-transparent" />
            <motion.div 
               animate={{ x: [-80, 80] }}
               transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
               className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-rose-600 shadow-[0_0_40px_rgba(249,115,22,0.5)] flex items-center justify-center z-10"
            >
               <div className="w-8 h-8 rounded-full border border-white/20 border-dashed animate-spin" />
            </motion.div>
            <div className="absolute left-0 w-4 h-4 rounded-full bg-white/20 blur-sm" />
            <div className="absolute right-0 w-6 h-6 rounded-full bg-orange-400/40 blur-md animate-pulse" />
         </div>
       )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
      SoundManager.getInstance().playPop();
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-[#020617] flex flex-col items-center justify-center p-8 overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <motion.div 
           animate={{ 
             scale: [1, 1.2, 1],
             opacity: [0.3, 0.5, 0.3]
           }}
           transition={{ duration: 10, repeat: Infinity }}
           className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
           style={{ backgroundColor: steps[currentStep].color + '44' }} 
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={currentStep}
           initial={{ opacity: 0, x: 200, scale: 0.8 }}
           animate={{ opacity: 1, x: 0, scale: 1 }}
           exit={{ opacity: 0, x: -200, scale: 0.8 }}
           transition={{ type: "spring", damping: 20, stiffness: 100 }}
           className="relative z-10 flex flex-col items-center text-center max-w-sm"
        >
           {/* Step Icon */}
           <div 
             className="w-20 h-20 rounded-3xl flex items-center justify-center mb-8 shadow-2xl relative overflow-hidden"
             style={{ backgroundColor: steps[currentStep].color + '22', border: `1px solid ${steps[currentStep].color}44` }}
           >
              <div className="absolute inset-0 bg-white/5 animate-pulse" />
              <div style={{ color: steps[currentStep].color }}>
                {steps[currentStep].icon}
              </div>
           </div>

           {/* Step Demo Area */}
           <div className="h-48 flex items-center justify-center mb-8">
              {steps[currentStep].demo}
           </div>

           {/* Typography - Motion Graphics Style */}
           <h2 className="text-4xl font-black italic tracking-tighter text-white mb-4 uppercase">
              {steps[currentStep].title}
           </h2>
           
           <p className="text-white/60 text-sm font-medium leading-relaxed tracking-wide mb-12">
              {steps[currentStep].description}
           </p>
        </motion.div>
      </AnimatePresence>

      {/* Progress Dots */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 flex gap-3">
        {steps.map((_, i) => (
          <div 
            key={i} 
            className={`h-1 rounded-full transition-all duration-500 ${i === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/20'}`} 
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="fixed bottom-12 left-0 right-0 px-8 flex justify-between items-center max-w-sm mx-auto">
        <button 
           onClick={onComplete}
           className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors"
        >
          ATLA
        </button>

        <Button 
          variant="cyan"
          onClick={handleNext}
          className="group !py-4 !px-8 !rounded-2xl flex items-center gap-2 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
        >
          <span className="font-black italic tracking-tighter text-base">
            {currentStep === steps.length - 1 ? 'BAŞLAT' : 'SONRAKİ'}
          </span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Aesthetic Border Elements */}
      <div className="fixed top-0 left-0 p-8 border-l border-t border-white/5 w-24 h-24 pointer-events-none" />
      <div className="fixed bottom-0 right-0 p-8 border-r border-b border-white/5 w-24 h-24 pointer-events-none" />
      <div className="fixed top-12 left-1/2 -translate-x-1/2 text-[10px] font-black text-white/20 tracking-[1em] uppercase">TUTORIAL</div>
    </div>
  );
};
