
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserStats } from '../types';
import { Button } from '../components/Button';
import { QuitConfirmationModal } from '../components/QuitConfirmationModal';
import { SideMenu } from '../components/SideMenu';
import { ParticleBackground } from '../components/ParticleBackground';
import { SoundManager } from '../managers/SoundManager';
import { usePlanets } from '../PlanetProvider';
import { useTheme } from '../ThemeProvider';
import { SearchX } from 'lucide-react';

interface MemoryGameProps {
  stats: UserStats;
  level: number;
  backgroundUrl: string;
  words: string[];
  targetWords: string[];
  onNext: (correctCount: number) => void;
  onFail: () => void;
  onExit: () => void;
  onUpdateStats: (updates: Partial<UserStats>) => void;
  initialScore?: number;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({ stats, level, words, targetWords, onNext, onFail, onExit, onUpdateStats }) => {
  const { palette } = useTheme();
  const { planetImages } = usePlanets();
  
  const planetId = Math.ceil(level / 6);
  const currentPlanetImage = planetImages[(planetId - 1) % planetImages.length] || planetImages[0];

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); 
  const [isGameOver, setIsGameOver] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [lastCorrectTime, setLastCorrectTime] = useState(Date.now());
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showPortalOpenMsg, setShowPortalOpenMsg] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string, color: string, id: number } | null>(null);

  const isLastHeart = stats.hearts === 1;

  const useFindHint = () => {
    if (stats.hintsReveal <= 0 || isMenuOpen || isGameOver || selected.size >= 5) return;
    
    const unselectedCorrectIndices = (Array.from(correctIndices) as number[]).filter(idx => !selected.has(idx as number));
    if (unselectedCorrectIndices.length === 0) return;
    
    const randomCorrectIdx = unselectedCorrectIndices[Math.floor(Math.random() * unselectedCorrectIndices.length)];
    onUpdateStats({ hintsReveal: stats.hintsReveal - 1 });
    SoundManager.getInstance().playCoin();
    handleWordClick(randomCorrectIdx as number);
  };
  
  useEffect(() => {
    if (isMenuOpen || isGameOver) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isMenuOpen, isGameOver]);

  useEffect(() => {
    if (timeLeft === 0 && !isGameOver) {
      if (correctCount < 3) {
        setIsGameOver(true);
        SoundManager.getInstance().playFail();
        onFail();
      } else {
        onNext(correctCount);
      }
    }
  }, [timeLeft, isGameOver, correctCount, onFail, onNext]);

  const displayWords = useMemo(() => words.map((word, i) => ({ 
    word, 
    color: palette[i % palette.length]
  })), [words, palette]);

  const correctIndices = useMemo(() => new Set<number>(displayWords.map((item, i) => targetWords.includes(item.word) ? i : -1).filter(i => i !== -1)), [displayWords, targetWords]);

  // Handle word selection logic
  const handleWordClick = (i: number) => {
    if (isGameOver || selected.has(i) || selected.size >= 5 || isMenuOpen) return;
    
    const now = Date.now();
    const timeToFind = (now - lastCorrectTime) / 1000;
    const isCorrect = correctIndices.has(i);
    setSelected(prev => new Set(prev).add(i));
    
    if (isCorrect) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      
      // Speed Multiplier Logic: Under 2s = 2x, Under 4s = 1.5x, else 1x
      let currentBonus = 1;
      if (timeToFind < 2) currentBonus = 2;
      else if (timeToFind < 4) currentBonus = 1.5;
      
      setSpeedMultiplier(prev => (prev + currentBonus) / 2); // Average speed multiplier
      
      const speedText = currentBonus === 2 ? 'EFSANE HIZ!' : currentBonus === 1.5 ? 'HIZLI!' : 'DOĞRU!';
      setFeedback({ text: speedText, color: currentBonus >= 1.5 ? '#facc15' : '#4ade80', id: Date.now() });
      SoundManager.getInstance().playSuccess();
      setLastCorrectTime(now);
      
      if (newCorrectCount === 3) {
        setShowPortalOpenMsg(true);
        setTimeout(() => setShowPortalOpenMsg(false), 2000);
      }
      
      if (newCorrectCount === 5) {
        setTimeout(() => onNext(5 + (speedMultiplier > 1.5 ? 2 : speedMultiplier > 1.2 ? 1 : 0)), 1000);
      }
    } else {
      setFeedback({ text: 'YANLIŞ!', color: '#f87171', id: Date.now() });
      SoundManager.getInstance().playFail();
      setLastCorrectTime(now);
    }

    // Feedback'i temizle
    setTimeout(() => {
      setFeedback(null);
    }, 1000);

    // Eğer 5 seçim yapıldıysa ve 5. doğru değilse (veya 5. de yapıldıysa)
    if (selected.size === 4) {
       setTimeout(() => {
         if (correctCount >= 3 || (isCorrect && correctCount + 1 >= 3)) {
           onNext(isCorrect ? correctCount + 1 : correctCount);
         } else {
           onFail();
         }
       }, 1500);
    }
  };

  return (
    <div className={`absolute inset-0 bg-[#020617] flex flex-col overflow-hidden font-sans select-none transition-all duration-1000 ${isLastHeart ? 'shadow-[inset_0_0_100px_rgba(239,68,68,0.3)] ring-8 ring-red-500/20' : ''}`}>
      <ParticleBackground 
        speedMultiplier={0.3 * stats.difficultyFactor} 
        level={level} 
        themeColor={palette[0]} 
      />
      
      <div 
        className={`fixed inset-0 z-[250] bg-black/40 backdrop-blur-lg transition-opacity duration-500 pointer-events-none ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
      />

      {/* Portal Open Notification */}
      <AnimatePresence>
        {showPortalOpenMsg && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 z-[1000] flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="bg-emerald-500/20 backdrop-blur-3xl border border-emerald-400/50 p-12 rounded-[40px] flex flex-col items-center shadow-[0_0_100px_rgba(16,185,129,0.3)]">
              <span className="text-white font-black text-4xl tracking-[0.2em] mb-4 text-center italic drop-shadow-2xl">GEÇİT AÇILDI!</span>
              <div className="flex gap-2">
                <span className="text-yellow-400 text-6xl">★</span>
                <span className="text-white/20 text-6xl">★</span>
                <span className="text-white/20 text-6xl">★</span>
              </div>
              <p className="text-white/80 font-bold mt-6 text-center max-w-xs uppercase tracking-widest text-xs">Daha fazla yıldız için seçimlerine devam et!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div 
            key={feedback.id}
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: -80, scale: 1.2 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed left-0 right-0 top-1/2 z-[500] pointer-events-none flex items-center justify-center"
            style={{ color: feedback.color }}
          >
            <span className="text-4xl sm:text-6xl font-black italic drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] whitespace-nowrap uppercase tracking-tighter">{feedback.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isGameOver && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 p-12 rounded-[48px] text-center shadow-2xl"
            >
              <h2 className="text-white text-5xl font-black mb-4 italic tracking-tighter">SÜRE BİTTİ!</h2>
              <p className="text-white/60 text-lg mb-8 uppercase tracking-widest font-bold">HAFİZA GECİDİ KAPANDİ</p>
              <Button variant="cyan" onClick={onFail} className="px-12">YENİDEN DENE</Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header UI - Simplified */}
      <div className={`z-40 pt-4 px-8 flex justify-center items-center gap-6 shrink-0 transition-all duration-500 ${isMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <motion.div 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-black/60 backdrop-blur-2xl border border-white/20 px-10 py-3 rounded-[32px] shadow-2xl flex flex-col items-center relative overflow-hidden"
        >
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black tracking-[0.6em] uppercase opacity-60 mb-1" style={{ color: palette[0] }}>SÜRE</span>
              <span className={`text-4xl font-mono font-black ${timeLeft < 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}</span>
            </div>
            
            {/* Stars Progress */}
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div 
                  key={i} 
                  className={`w-1.5 h-1.5 rounded-full border transition-all duration-300 ${selected.size >= i ? (correctIndices.has(Array.from(selected)[i-1]) ? 'bg-emerald-400 border-emerald-400' : 'bg-red-400 border-red-400') : 'bg-white/5 border-white/10'}`} 
                />
              ))}
            </div>
        </motion.div>

        {/* Göremedim Joker - Hep Aktif */}
        <motion.button 
          onClick={useFindHint} 
          disabled={stats.hintsReveal <= 0 || selected.size >= 5 || isGameOver}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`group relative w-16 h-16 flex flex-col items-center justify-center transition-all ${stats.hintsReveal <= 0 ? 'opacity-40 grayscale' : ''}`}
        >
          <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex flex-col items-center justify-center border-2 border-white/20 shadow-2xl overflow-hidden">
             <SearchX className="w-5 h-5 text-white mb-0.5" />
             <span className="text-[7px] font-black text-white tracking-widest uppercase">JOKER</span>
             <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border border-white/40">{stats.hintsReveal}</div>
          </div>
        </motion.button>
      </div>

      {/* Main Game Area - Premium Typography Word Cloud (15 Words) */}
      <div className={`flex-1 relative z-10 w-full h-full flex items-center justify-center pt-4 pb-20 px-6 transition-all duration-500 ${isMenuOpen ? 'blur-md brightness-50' : ''}`}>
          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-4 sm:gap-x-8 sm:gap-y-8 w-full max-w-4xl">
            <AnimatePresence>
              {displayWords.map((item, i) => {
                const isSel = selected.has(i);
                const isCorrect = correctIndices.has(i);
                
                // Typography Cloud Estetiği için Hesaplamalar - BOYUTLAR ARTIRILDI
                // Bazı kelimeler büyük (vurgulu), bazıları küçük (destekleyici)
                const sizes = [56, 36, 48, 32, 40, 28, 52, 30, 44, 24, 46, 34, 30, 22, 28];
                const baseSize = sizes[i % sizes.length];
                
                // Mobilde taşmaması için ölçeklendirme - Vurgu için katsayı artırıldı
                const scaleFactor = window.innerWidth < 640 ? 0.75 : 1;
                const fontSize = baseSize * scaleFactor;
                
                // Kelime bulutu karakteri için hafif eğimler
                const rotations = [0, -2, 1, 0, 3, -1, 0, 0, -2, 4, 0, -3, 0, 2, 0];
                const rotation = rotations[i % rotations.length];

                return (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ 
                      opacity: isSel ? (isCorrect ? 1 : 0.3) : 1, 
                      scale: isSel ? (isCorrect ? 1.1 : 0.8) : 1,
                      rotate: rotation 
                    }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                      delay: i * 0.03 
                    }}
                    whileHover={!isSel && !isGameOver ? { scale: 1.1, rotate: 0, zIndex: 100 } : {}}
                    whileTap={!isSel && !isGameOver ? { scale: 0.95 } : {}}
                    onClick={() => handleWordClick(i)}
                    className="cursor-pointer touch-none inline-block px-2 group"
                  >
                    <span 
                      className={`
                        font-black transition-all duration-500 tracking-tighter leading-none block select-none
                        ${isSel 
                          ? (isCorrect ? 'text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.9)]' : 'text-red-500 line-through opacity-50') 
                          : 'text-white hover:brightness-125'
                        }
                      `}
                      style={{ 
                        fontSize: `${fontSize}px`,
                        color: isSel ? undefined : (i % 3 === 0 ? '#f0f9ff' : i % 3 === 1 ? item.color : '#cbd5e1'),
                        textShadow: isSel ? 'none' : `0 0 15px ${item.color}40`,
                        opacity: isSel ? (isCorrect ? 1 : 0.4) : 0.9
                      }}
                    >
                      {item.word.toLocaleUpperCase('tr-TR')}
                    </span>

                    {/* Vurgu Alt Çizgisi - Sadece bazı kelimelerde (örnekteki gibi) */}
                    {!isSel && i % 4 === 0 && (
                      <motion.div 
                        layoutId={`line-${i}`}
                        className="h-1 w-full bg-current opacity-20 mt-1 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
      </div>

      <div className="fixed right-6 bottom-6 z-[300]">
        <SideMenu onExit={() => setShowQuitModal(true)} onToggle={setIsMenuOpen} isMinimal={true} expandDirection="up" />
      </div>

      {showQuitModal && <QuitConfirmationModal onConfirm={onExit} onCancel={() => setShowQuitModal(false)} />}
    </div>
  );
};
