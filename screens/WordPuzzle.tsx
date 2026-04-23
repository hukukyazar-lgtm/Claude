
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserStats } from '../types';
import { Cube3D, CubeVisualStyle } from '../components/Cube3D';
import { SideMenu } from '../components/SideMenu';
import { ParticleBackground } from '../components/ParticleBackground';
import { Button } from '../components/Button';
import { SoundManager } from '../managers/SoundManager';
import { QuitConfirmationModal } from '../components/QuitConfirmationModal';
import { motion, AnimatePresence } from 'motion/react';

import { Portal3D } from '../components/Portal3D';
import { fetchQuestions } from '../lib/supabase';
import { usePlanets } from '../PlanetProvider';
import { useTheme } from '../ThemeProvider';
import { Eye } from 'lucide-react';

type RingStyle = 
  | 'STANDART' | 'BALERİN' | 'DÖNMEDOLAP' | 'ATLIKARINCA' | 'DEĞİRMEN'
  | 'DNA' | 'NABIZ' | 'SARKAÇ' | 'GİRDAP' | 'DALGA' 
  | 'SONSUZLUK' | 'KELEBEK' | 'FIRTINA' | 'SEKSEK' | 'KUŞAK'
  | 'MERCEK' | 'BASAMAK' | 'SİKLON' | 'PİRAMİT' | 'ZİGZAG' 
  | 'KASIRGA' | 'KARMAŞA' | 'TRAMPOLİN' | 'YOYO' | 'HALKALI' 
  | 'ÇAPRAZ' | 'ASANSÖR' | 'BOOMERANG' | 'LABİRENT'
  | 'KALEYDOSKOP' | 'KUANTUM' | 'SARMAN' | 'VALS';

// HARF VE SES BENZERLİĞİNE GÖRE OPTİMİZE EDİLMİŞ HAVUZ (FALLBACK)
const FALLBACK_POOL = [
  { target: "EVRENSEL", distractors: ["EYLEMSEL", "EVRİMSEL", "ERDEMSEL"] },
  { target: "GALAKSİ", distractors: ["GALAKTİK", "GALAKSİN", "GALAKSI"] },
  { target: "YILDIZLAR", distractors: ["YALDIZLAR", "YALNIZLAR", "YILDIRLAR"] },
  { target: "YÖRÜNGE", distractors: ["GÖRÜNGE", "SÜRÜNGE", "YÖRÜNGEL"] },
  { target: "GEZEGEN", distractors: ["GEREKEN", "GELECEK", "GÖZEGEN"] },
  { target: "ATMOSFER", distractors: ["ATMACACI", "ATLASLAR", "ATMOSFERİK"] },
  { target: "KRİSTAL", distractors: ["KARTELA", "KONTROL", "KRİSTİL"] },
  { target: "ELEMENT", distractors: ["EMANETİ", "ELAMETİ", "EKLEMENT"] },
  { target: "MOLEKÜL", distractors: ["MODÜLER", "MAMULLER", "MOLEKÜLER"] },
  { target: "FREKANS", distractors: ["FRAKSİYON", "FREKANSLI", "FREKANSIM"] },
  { target: "KİNETİK", distractors: ["GENETİK", "KİNETİKA", "KİNETİZM"] },
  { target: "PLAZMA", distractors: ["PRİZMA", "PULSAR", "PLAZMAY"] },
  { target: "AURORA", distractors: ["AVRUPA", "AVRORA", "AURORAL"] },
  { target: "SİNYAL", distractors: ["SİMSAR", "SİNYALİ", "SİNSİCE"] },
  { target: "SPEKTRUM", distractors: ["SPEKÜLER", "SPEKÜLÜM", "SPEKTROM"] },
  { target: "GRAVİTE", distractors: ["GRAVÜRE", "GRAVİTİ", "GRAVATLAR"] },
  { target: "PARTİKÜL", distractors: ["PATİKALI", "PARTİKÜLER", "PARTİKÜLÜ"] },
  { target: "NEBULA", distractors: ["PUSULA", "NEBULAR", "NEBÜLAS"] },
  { target: "VAKUM", distractors: ["BAKIM", "VAKUMU", "VAKUMLU"] },
  { target: "FOTON", distractors: ["KOTON", "FOTONİK", "FOTONU"] },
  { target: "RADYANT", distractors: ["VARYANT", "RADYAN", "RADYANTLI"] },
  { target: "REAKTÖR", distractors: ["REFAKAT", "REAKTİF", "REAKTÖRÜ"] },
  { target: "İVMELEME", distractors: ["İZLELEME", "İMGELEME", "İMLEMECE"] },
  { target: "HÜCRESEL", distractors: ["ZÜMRESEL", "SÜRESEL", "HÜCRESİ"] },
  { target: "MUTASYON", distractors: ["MOTİVASYON", "MUTASYONLU", "KUTASYON"] },
  { target: "İLETKEN", distractors: ["İZLENEN", "İLETİLEN", "İLETKENLİ"] },
  { target: "YALITKAN", distractors: ["YALITIM", "YALITLAN", "YALITKANS"] },
  { target: "GERİLİM", distractors: ["GERİLEYİŞ", "GERİLEME", "GERİLİMLİ"] },
  { target: "ADAPTÖR", distractors: ["ADAPTASYON", "ADAPTİVE", "ADAPTÖRÜ"] },
  { target: "KARANLIK", distractors: ["KABARIK", "KARARLIK", "KARANLAK"] }
];

const MEMORIZE_DURATION = 45; 
const BASE_ROUND_TIME = 10;
const STYLES: RingStyle[] = [
  'STANDART', 'BALERİN', 'DÖNMEDOLAP', 'ATLIKARINCA', 'DEĞİRMEN',
  'DNA', 'NABIZ', 'SARKAÇ', 'GİRDAP', 'DALGA',
  'SONSUZLUK', 'KELEBEK', 'FIRTINA', 'SEKSEK', 'KUŞAK',
  'MERCEK', 'BASAMAK', 'SİKLON', 'PİRAMİT', 'ZİGZAG',
  'KASIRGA', 'KARMAŞA', 'TRAMPOLİN', 'YOYO', 'HALKALI',
  'ÇAPRAZ', 'ASANSÖR', 'BOOMERANG', 'LABİRENT',
  'KALEYDOSKOP', 'KUANTUM', 'SARMAN', 'VALS'
];

const VISUAL_STYLES: CubeVisualStyle[] = ['GLASS', 'CRYSTAL', 'METAL', 'NEON', 'GHOST', 'DARK', 'PLASMA', 'CHROME', 'LAVA', 'AETHER', 'VOID'];

export const WordPuzzle: React.FC<{ 
  stats: UserStats; 
  level: number;
  questions: any[]; 
  onComplete: (e: number, t: string[], d: string[]) => void; 
  onExit: () => void; 
  onUpdateStats: (s: Partial<UserStats>) => void 
}> = ({ stats, level, questions: initialQuestions, onComplete, onExit, onUpdateStats }) => {
  const { palette } = useTheme();
  const { planetImages } = usePlanets();
  
  const planetId = Math.ceil(level / 6);
  const defaultPlanetImage = planetImages[(planetId - 1) % planetImages.length] || planetImages[0];

  const COLORS = palette;
  const dynamicRoundTime = useMemo(() => BASE_ROUND_TIME / stats.difficultyFactor, [stats.difficultyFactor]);

  const [questions, setQuestions] = useState<{ 
    target: string; 
    distractors: string[];
    planetName?: string;
    planetId?: number;
    quesId?: number;
  }[]>(initialQuestions.length > 0 ? initialQuestions : []);
  const [isLoading, setIsLoading] = useState(initialQuestions.length === 0);
  const [currentRound, setCurrentRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MEMORIZE_DURATION);
  const [gamePhase, setGamePhase] = useState<'MEMORIZE' | 'GUESS'>('MEMORIZE');
  const [sessionScore, setSessionScore] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [rotationOffset, setRotationOffset] = useState(0);
  const [choiceStatus, setChoiceStatus] = useState<'idle' | 'success' | 'fail'>('idle');
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [roundResults, setRoundResults] = useState<( 'success' | 'fail' | null)[]>(new Array(5).fill(null));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [showSupernova, setShowSupernova] = useState(false);
  const [isPeekPhase, setIsPeekPhase] = useState(true);
  const [eliminatedChoices, setEliminatedChoices] = useState<string[]>([]);

  const [showHintMenu, setShowHintMenu] = useState(false);
  const [isTimeFrozen, setIsTimeFrozen] = useState(false);
  const [hintUsedThisRound, setHintUsedThisRound] = useState(false);
  const [firstLetterFlash, setFirstLetterFlash] = useState(false);
  
  const [lastPoints, setLastPoints] = useState<number | null>(null);
  const [showPoints, setShowPoints] = useState(false);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const loadQuestions = async () => {
      if (initialQuestions.length > 0) {
        setQuestions(initialQuestions);
        setIsLoading(false);
        SoundManager.getInstance().playMusic(1.0);
        return;
      }
      
      setIsLoading(true);
      const data = await fetchQuestions();
      if (data && data.length > 0) {
        setQuestions(data);
      } else {
        setQuestions(FALLBACK_POOL);
      }
      setIsLoading(false);
      
      SoundManager.getInstance().playMusic(1.0);
    };
    loadQuestions();
    return () => SoundManager.getInstance().stopMusic();
  }, [initialQuestions]);

  const currentStyle = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * STYLES.length);
    return STYLES[randomIndex];
  }, [currentRound]);

  const currentCubeVisualStyle = useMemo(() => {
    const pool = stats.difficultyFactor > 1.5 
      ? ['LAVA', 'VOID', 'PLASMA', 'NEON', 'CHROME'] 
      : VISUAL_STYLES;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex] as CubeVisualStyle;
  }, [currentRound, stats.difficultyFactor]);

  const puzzleRounds = useMemo(() => {
    if (questions.length === 0) return [];
    
    // Seviyeye göre soruları seç (Sıralı olarak)
    // Her seviyede 5 soru olduğunu varsayarsak:
    const startIndex = ((level - 1) * 5) % questions.length;
    let selected = questions.slice(startIndex, startIndex + 5);
    
    // Eğer seviye sonuna gelindiyse ve 5 soru yoksa baştan tamamla
    if (selected.length < 5) {
      selected = [...selected, ...questions.slice(0, 5 - selected.length)];
    }
    
    return selected;
  }, [questions, level]);

  const activeRoundData = puzzleRounds[currentRound];
  const currentPlanetImage = activeRoundData?.planetImage || defaultPlanetImage;
  
  // 2 SEÇENEK: 1 Hedef + 1 Hazırlanmış Benzer Çeldirici
  // 1. DENGELİ ZORLUK: Seçenek sayısı 3-4 arası (Daha az kalabalık)
  const choiceCount = 2;

  const activeOptions = useMemo(() => {
    if (!activeRoundData) return [];
    const target = activeRoundData.target;
    const distractors = activeRoundData.distractors;
    
    // Seviyeye göre çeldirici seç
    const neededDistractors = choiceCount - 1;
    const selectedDistractors = distractors.slice(0, neededDistractors);
    
    // Eğer yeterli çeldirici yoksa fallback'ten tamamla
    while (selectedDistractors.length < neededDistractors) {
      selectedDistractors.push("HATA-" + selectedDistractors.length);
    }
    
    return [target, ...selectedDistractors].sort(() => Math.random() - 0.5);
  }, [activeRoundData, choiceCount]);

  // 2. DENGELİ HAFIZA TESTİ: Kelime uzunluğuna göre dinamik süre
  useEffect(() => {
    if (gamePhase === 'MEMORIZE' && !isTransitioning && activeRoundData) {
      setIsPeekPhase(true);
      const peekDuration = Math.min(12000, Math.max(6000, activeRoundData.target.length * 900));
      const timer = setTimeout(() => {
        setIsPeekPhase(false);
      }, peekDuration);
      return () => clearTimeout(timer);
    }
  }, [currentRound, gamePhase, isTransitioning, activeRoundData]);

  useEffect(() => {
    if (isLoading || choiceStatus !== 'idle' || selectedChoice || isMenuOpen || isTransitioning || showQuitModal) return;
    
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if ((isTimeFrozen || showHintMenu) && gamePhase === 'MEMORIZE') return prev;

        const nextTime = prev - 0.05;

        if (gamePhase === 'MEMORIZE' && nextTime <= 0) {
          setGamePhase('GUESS');
          SoundManager.getInstance().playPop();
          return dynamicRoundTime;
        }
        if (gamePhase === 'GUESS' && nextTime <= 0) {
          handleChoice("TIME_UP");
          return dynamicRoundTime;
        }
        return nextTime;
      });

      // 3. DENGELİ HIZ: Dönüş hızı daha yumuşak artar
      if (gamePhase === 'MEMORIZE') {
        if (!isTimeFrozen && !showHintMenu) {
            const speedFactor = 0.6 + (level * 0.02);
            setRotationOffset(prev => prev + (Math.min(1.5, speedFactor) * stats.difficultyFactor));
        }
      }
    }, 50);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, choiceStatus, selectedChoice, isMenuOpen, isTransitioning, currentRound, showQuitModal, dynamicRoundTime, stats.difficultyFactor, gamePhase, isTimeFrozen, hintUsedThisRound, showHintMenu]);

  useEffect(() => {
    if (choiceStatus === 'success' && activeRoundData) {
      let currentIdx = 0;
      const interval = setInterval(() => {
        setRevealedIndex(currentIdx);
        currentIdx++;
        if (currentIdx >= activeRoundData.target.length) {
          clearInterval(interval);
        }
      }, 150);
      return () => clearInterval(interval);
    } else {
      setRevealedIndex(-1);
    }
  }, [choiceStatus, activeRoundData]);

  const handleSkipMemorize = () => {
    if (gamePhase === 'MEMORIZE' && !isTransitioning) {
      setGamePhase('GUESS');
      setTimeLeft(dynamicRoundTime);
      SoundManager.getInstance().playPop();
    }
  };

  const useHint = () => {
    if (stats.hintsFreeze <= 0 || isPeekPhase) return;
    
    onUpdateStats({ hintsFreeze: stats.hintsFreeze - 1 });
    SoundManager.getInstance().playCoin();
    
    setIsPeekPhase(true);
    // setHintUsedThisRound(true); // Kullanım sınırı kaldırıldı
    setShowHintMenu(false);
    
    // 3 saniye sonra tekrar kapat
    setTimeout(() => {
      setIsPeekPhase(false);
    }, 3000);
  };

  const handleChoice = (choice: string) => {
    if (selectedChoice || choiceStatus !== 'idle' || isTransitioning || !activeRoundData) return;
    
    // 1. EŞLEŞME KONTROLÜ - HEMEN YAPILIR (Gecikme öncesi)
    // Türkçe karakter ve boşluk hassasiyeti için trim ve lowercase kullanıyoruz
    const targetWord = activeRoundData.target.trim().toLocaleLowerCase('tr-TR');
    const chosenWord = choice === "TIME_UP" ? "" : choice.trim().toLocaleLowerCase('tr-TR');
    const isCorrect = choice !== "TIME_UP" && chosenWord === targetWord;

    // Seçimi kilitle
    setSelectedChoice(choice);
    setShowHintMenu(false);

    // If clicked during memorize phase, handle the phase shift
    if (gamePhase === 'MEMORIZE' && choice !== "TIME_UP") {
      setGamePhase('GUESS');
      setTimeLeft(dynamicRoundTime);
    }

    // 2. GÖRSEL/İSİTSEL GERİ BİLDİRİM GECİKMESİ
    setTimeout(() => {
      if (isCorrect) {
        SoundManager.getInstance().playSuccess();
        const nextCombo = comboCount + 1;
        setComboCount(nextCombo);
        
        if (nextCombo >= 5) {
          setShowSupernova(true);
          setTimeout(() => setShowSupernova(false), 2000);
          SoundManager.getInstance().playSuccess(); 
        }
      } else {
        if (choice !== "TIME_UP") SoundManager.getInstance().playFail();
        setComboCount(0);
      }

      const points = isCorrect 
        ? Math.floor((100 + timeLeft * 10) * (1 + (comboCount * 0.1)))
        : -50;
      
      const nextResults = [...roundResults];
      nextResults[currentRound] = isCorrect ? 'success' : 'fail';
      
      setChoiceStatus(isCorrect ? 'success' : 'fail');
      setLastPoints(points);
      setShowPoints(true);
      setTimeout(() => setShowPoints(false), 1500);
      
      const nextScore = isCorrect ? sessionScore + points : Math.max(0, sessionScore - 50);
      setSessionScore(nextScore);

      const nextRoundDelay = isCorrect ? (activeRoundData.target.length * 150 + 1000) : 1200;
      
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          if (currentRound === puzzleRounds.length - 1) {
            const allTargets = puzzleRounds.map(r => r.target);
            const allDistractors = puzzleRounds.flatMap(r => r.distractors);
            onComplete(nextScore, allTargets, allDistractors);
          } else {
            setCurrentRound(prev => prev + 1);
            setTimeLeft(MEMORIZE_DURATION);
            setGamePhase('MEMORIZE');
            setChoiceStatus('idle');
            setSelectedChoice(null);
            setRevealedIndex(-1);
            setRoundResults(nextResults);
            setIsTransitioning(false);
            setHintUsedThisRound(false);
            setIsTimeFrozen(false);
            setFirstLetterFlash(false);
            setEliminatedChoices([]);
            setIsPeekPhase(true);
          }
        }, 400);
      }, nextRoundDelay);
    }, 600); 
  };

  const ringItems = useMemo(() => {
    if (!activeRoundData) return [];
    return activeRoundData.target.split("").map((char, i) => ({
      char,
      color: COLORS[i % COLORS.length]
    }));
  }, [activeRoundData]);

  const renderRing = () => {
    if (!activeRoundData) return null;
    const dist = 120; 
    const isSuccess = choiceStatus === 'success';
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const safeContainerWidth = screenWidth * 0.85;
    const dynamicSpacing = Math.min(52, safeContainerWidth / Math.max(1, ringItems.length - 0.5));
    const dynamicCubeSize = Math.min(58, dynamicSpacing * 1.2);
    const cubeAnimSpeed = 4 / stats.difficultyFactor;

    return (
      <div 
        className={`relative w-full h-full flex items-center justify-center transition-all duration-500 ${isTransitioning ? 'opacity-0 scale-75 blur-lg' : 'opacity-100 scale-100'}`} 
        style={{ transformStyle: 'preserve-3d' }}
      >
        {ringItems.map((item, idx) => {
          const angle = (idx / ringItems.length) * 360 + rotationOffset;
          const rad = (angle * Math.PI) / 180;
          let x = 0, y = 0, z = 0, rotX = 0, rotY = 0, rotZ = 0, scale = 1;

          if (isSuccess) {
            x = (idx - (ringItems.length - 1) / 2) * dynamicSpacing;
            y = 0; z = 20; scale = 1.1 + (revealedIndex === idx ? 0.15 : 0);
          } else {
             switch (currentStyle) {
              case 'BALERİN': x = Math.cos(rad) * dist; y = Math.sin(rotationOffset * 0.05) * 20; z = Math.sin(rad) * dist; rotY = rotationOffset * 2; break;
              case 'DÖNMEDOLAP': x = Math.cos(rad) * dist; y = Math.sin(rad) * dist; z = 0; rotZ = -angle; break;
              case 'ATLIKARINCA': x = Math.cos(rad) * dist; y = Math.sin(rotationOffset * 0.1 + idx) * 30; z = Math.sin(rad) * dist; break;
              case 'DEĞİRMEN': x = Math.cos(rad) * dist; y = Math.sin(rad) * dist; z = -50; rotZ = rotationOffset; break;
              case 'DNA': x = Math.cos(rad) * dist; y = Math.sin(rad * 2 + rotationOffset * 0.1) * 40; z = Math.sin(rad) * dist; rotY = angle; break;
              case 'NABIZ': x = Math.cos(rad) * (dist + Math.sin(rotationOffset * 0.2) * 20); y = Math.sin(rad) * (dist + Math.sin(rotationOffset * 0.2) * 20); scale = 1 + Math.sin(rotationOffset * 0.2) * 0.1; break;
              case 'SARKAÇ': const swingAngle = Math.sin(rotationOffset * 0.05) * 60; const swingRad = ((angle + swingAngle) * Math.PI) / 180; x = Math.cos(swingRad) * dist; y = Math.sin(swingRad) * dist; break;
              case 'GİRDAP': const spiralDist = dist + Math.sin(rotationOffset * 0.1 + idx) * 30; x = Math.cos(rad) * spiralDist; y = Math.sin(rad) * spiralDist; z = Math.cos(rotationOffset * 0.1 + idx) * 40; break;
              case 'DALGA': x = Math.cos(rad) * dist; y = Math.sin(rad * 3 + rotationOffset * 0.1) * 30; z = Math.sin(rad) * dist; break;
              case 'SONSUZLUK': const t = rad + rotationOffset * 0.01; const den = 1 + Math.pow(Math.sin(t), 2); x = (dist * 1.5 * Math.cos(t)) / den; y = (dist * 1.5 * Math.sin(t) * Math.cos(t)) / den; break;
              case 'KELEBEK': x = Math.cos(rad) * dist; y = Math.sin(rad) * dist; rotX = Math.sin(rotationOffset * 0.1 + idx) * 45; break;
              case 'FIRTINA': x = Math.cos(rad) * dist + (Math.random() - 0.5) * 5; y = Math.sin(rad) * dist + (Math.random() - 0.5) * 5; rotZ = rotationOffset * 5; break;
              case 'SEKSEK': const step = Math.floor(rotationOffset * 0.1) % 2; x = Math.cos(rad) * dist; y = Math.sin(rad) * dist + (step === 0 ? 20 : -20); break;
              case 'KUŞAK': x = Math.cos(rad) * dist; y = Math.sin(rad) * (dist * 0.3); z = Math.sin(rad) * dist; rotX = 60; break;
              case 'MERCEK': const focus = Math.sin(rad + rotationOffset * 0.05); x = Math.cos(rad) * dist; y = Math.sin(rad) * dist; scale = 1 + focus * 0.4; z = focus * 50; break;
              case 'BASAMAK': x = Math.cos(rad) * dist; y = (idx - ringItems.length / 2) * 40; z = Math.sin(rad) * dist; break;
              case 'SİKLON': const cycloneDist = dist + Math.sin(rotationOffset * 0.1) * 40; x = Math.cos(rad) * cycloneDist; y = Math.sin(rad) * cycloneDist; rotZ = rotationOffset * 2; break;
              case 'PİRAMİT': x = Math.cos(rad) * dist; y = Math.sin(rad) * dist; z = idx * 20; scale = 1 - (idx * 0.05); break;
              case 'ZİGZAG': x = Math.cos(rad) * dist; y = Math.sin(rotationOffset * 0.2 + idx) * 50; break;
              case 'KASIRGA': x = Math.cos(rad + rotationOffset * 0.05) * (dist + idx * 10); y = Math.sin(rad + rotationOffset * 0.05) * (dist + idx * 10); z = Math.sin(rotationOffset * 0.1 + idx) * 100; break;
              case 'KARMAŞA': x = Math.cos(rad) * dist + Math.sin(rotationOffset * 0.1 + idx) * 10; y = Math.sin(rad) * dist + Math.cos(rotationOffset * 0.1 + idx) * 10; rotX = rotationOffset; rotY = rotationOffset; break;
              case 'TRAMPOLİN': x = Math.cos(rad) * dist; y = Math.abs(Math.sin(rotationOffset * 0.1 + idx)) * -100 + 50; break;
              case 'YOYO': const yoyoDist = dist + Math.sin(rotationOffset * 0.15) * 80; x = Math.cos(rad) * yoyoDist; y = Math.sin(rad) * yoyoDist; break;
              case 'HALKALI': x = Math.cos(rad) * dist; y = Math.sin(rad) * 20; z = Math.sin(rad) * dist; rotX = 75; break;
              case 'ÇAPRAZ': const cross = idx % 2 === 0 ? 1 : -1; x = Math.cos(rad) * dist; y = Math.sin(rad) * dist * cross; break;
              case 'ASANSÖR': x = Math.cos(rad) * dist; y = Math.sin(rad) * dist; z = Math.sin(rotationOffset * 0.05) * 200; break;
              case 'BOOMERANG': const boom = Math.sin(rotationOffset * 0.08); x = Math.cos(rad) * (dist + boom * 150); y = Math.sin(rad) * (dist + boom * 150); break;
              case 'LABİRENT': x = Math.cos(rad) * dist + (idx % 3) * 30; y = Math.sin(rad) * dist + (Math.floor(idx / 3)) * 30; break;
              case 'KALEYDOSKOP': const multi = idx % 2 === 0 ? 1 : -1; x = Math.cos(rad) * dist; y = Math.sin(rad * multi) * dist; rotZ = rotationOffset * multi; break;
              case 'KUANTUM': const jitter = (Math.random() - 0.5) * 4; x = Math.cos(rad) * dist + jitter; y = Math.sin(rad) * dist + jitter; z = Math.sin(rotationOffset * 0.3 + idx) * 20; break;
              case 'SARMAN': x = Math.cos(rad) * dist; y = Math.sin(rad) * dist; z = (idx - ringItems.length / 2) * 60; rotZ = rotationOffset; break;
              case 'VALS': const vT = rotationOffset * 0.05 + idx; x = Math.sin(vT) * 140; y = Math.sin(vT * 2) * 70; z = Math.cos(vT) * 40; break;
              default: x = Math.cos(rad) * dist; y = Math.sin(rad) * dist; z = 0; break;
             }
          }

          const isFlashing = firstLetterFlash && idx === 0;

          return (
            <div key={`${currentRound}-${idx}`} className={`absolute transition-all duration-300 ease-out ${isFlashing ? 'animate-pulse' : ''}`} style={{ transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`, transformStyle: 'preserve-3d', zIndex: (revealedIndex === idx) ? 300 : 20 }}>
              <Cube3D size={isSuccess ? dynamicCubeSize : 58} label={!isPeekPhase && !isSuccess ? '•' : item.char.toLocaleUpperCase('tr-TR')} color={isFlashing ? '#ffffff' : item.color} visualStyle={isFlashing ? 'NEON' : currentCubeVisualStyle} status={choiceStatus} isRevealed={true} delay={idx * 0.05} speed={(isSuccess || (isTimeFrozen && gamePhase === 'MEMORIZE') || showHintMenu) ? 0 : cubeAnimSpeed} />
            </div>
          );
        })}
      </div>
    );
  };

  const barMax = gamePhase === 'MEMORIZE' ? MEMORIZE_DURATION : dynamicRoundTime;
  const isHintPhase = gamePhase === 'MEMORIZE' && timeLeft <= 15.1 && !hintUsedThisRound;

  const renderChoiceContent = (opt: string) => {
    return opt.toLocaleUpperCase('tr-TR');
  };

  if (isLoading) {
    return (
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl flex flex-col items-center justify-center z-[500]">
        <div className="w-16 h-16 border-[0.5px] border-[#22d3ee] border-t-transparent rounded-full animate-spin mb-6" />
        <span className="text-white font-bold tracking-[0.3em] animate-pulse text-xs uppercase opacity-60">SORULAR YÜKLENİYOR...</span>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 bg-transparent flex flex-col overflow-hidden transition-all duration-1000`}>
      <ParticleBackground 
        speedMultiplier={choiceStatus === 'success' ? 0.05 : 0.25 * stats.difficultyFactor} 
        themeColor={COLORS[currentRound % COLORS.length]} 
      />
      
      {/* 5. YUMUŞATILMIŞ SUPERNOVA EFEKTİ */}
      <div className={`fixed inset-0 z-[400] pointer-events-none transition-all duration-1000 ${showSupernova ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 bg-white/30 animate-pulse mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(circle,white_0%,transparent_50%)] scale-125 animate-ping opacity-50" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-black text-4xl sm:text-6xl tracking-[0.2em] sm:tracking-[0.4em] drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] italic whitespace-nowrap">KOMBO!</div>
      </div>

      {/* PUAN GERİ BİLDİRİMİ */}
      <AnimatePresence>
        {showPoints && (
          <motion.div 
            initial={{ opacity: 0, x: "-50%", y: 20, scale: 0.5 }}
            animate={{ opacity: 1, x: "-50%", y: -60, scale: 1.2 }}
            exit={{ opacity: 0, x: "-50%", y: -120, scale: 1.5 }}
            className={`fixed ${choiceStatus === 'success' ? 'top-[60%]' : 'top-1/2'} left-1/2 -translate-y-1/2 z-[500] pointer-events-none flex items-center justify-center`}
          >
            <span className={`text-6xl font-black italic drop-shadow-[0_0_20px_rgba(0,0,0,0.5)] text-center ${lastPoints && lastPoints > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {lastPoints && lastPoints > 0 ? `+${lastPoints}` : lastPoints}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`fixed inset-0 z-[250] bg-black/20 backdrop-blur-lg transition-opacity duration-500 pointer-events-none ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} />

      {/* Arka Plan Gezegeni - Daha Entegre Görünüm */}
      <div className="absolute -bottom-[15%] -left-[5%] w-[100vh] h-[100vh] pointer-events-none z-[1]">
         <div className="w-full h-full relative planet-tilt opacity-90">
           <img 
             src={currentPlanetImage} 
             alt="" 
             className="w-full h-full object-cover brightness-110 contrast-115 animate-planet-rotate scale-110"
             style={{ 
               clipPath: 'circle(48%)',
               maskImage: 'radial-gradient(circle, black 65%, transparent 75%)',
               WebkitMaskImage: 'radial-gradient(circle, black 65%, transparent 75%)'
             }}
             referrerPolicy="no-referrer"
             crossOrigin="anonymous"
           />
         </div>
      </div>

      <div className={`pt-20 px-8 flex justify-between items-start z-20 ${isMenuOpen || choiceStatus !== 'idle' ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500 shrink-0`}>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 p-2.5 bg-white/5 backdrop-blur-2xl rounded-xl border-[0.5px] border-white/10 shadow-xl">
            {roundResults.map((res, i) => (
              <div key={i} className={`w-3 h-3 rounded-full border-[0.5px] transition-all duration-700 ${res === 'success' ? 'bg-[#4ade80] border-white shadow-[0_0_10px_#4ade80]' : res === 'fail' ? 'bg-[#f87171] border-white shadow-[0_0_10px_#f87171]' : i === currentRound ? 'bg-[#22d3ee] border-white animate-pulse' : 'bg-white/5 border-white/10'}`} />
            ))}
          </div>
        </div>
        <div className="text-3xl font-bold text-white tracking-widest opacity-90">{(sessionScore || 0).toLocaleString()}</div>
      </div>

      <div className={`flex-1 relative flex items-center justify-center perspective-[1200px] z-10 min-h-0 transition-all duration-500 ${isMenuOpen ? 'blur-sm brightness-50' : ''}`}>{renderRing()}</div>

      {!isTransitioning && !isPeekPhase && (
        <div className="fixed right-4 bottom-36 z-[300] flex flex-col gap-4 animate-[popIn_0.5s_cubic-bezier(0.34,1.56,0.64,1)]">
          <motion.button 
            onClick={useHint} 
            disabled={stats.hintsFreeze <= 0}
            animate={{ 
              y: [0, -6, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, y: 4 }}
            className={`group relative w-16 h-16 flex items-center justify-center transition-all ${stats.hintsFreeze <= 0 ? 'opacity-50 grayscale' : ''}`}
            style={{ perspective: '1000px' }}
          >
            <div className="absolute inset-0 blur-2xl rounded-full animate-pulse scale-110 pointer-events-none bg-cyan-400/10" />
            
            {/* 3D Button Base/Shadow */}
            <div className="absolute inset-0 bg-cyan-900/80 rounded-full translate-y-1.5 shadow-lg" />
            
            {/* Main Button Surface */}
            <div className="relative w-full h-full bg-gradient-to-b from-cyan-400 to-cyan-600 rounded-full flex flex-col items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)] border border-cyan-300/30 group-active:translate-y-1 transition-transform duration-100">
               <Eye className="w-5 h-5 text-white mb-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" />
               <span className="text-[7px] font-black text-white tracking-tighter uppercase z-10 text-center px-1 leading-none drop-shadow-sm">GÖREMEDİM</span>
               
               {/* Badge */}
               <div className="absolute -top-1 -right-1 flex items-center justify-center bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full border border-white/40 shadow-md">
                 {stats.hintsFreeze}
               </div>
            </div>
          </motion.button>
        </div>
      )}

      <div className={`px-8 pb-16 flex flex-col gap-8 z-20 transition-all duration-700 shrink-0 ${isTransitioning || choiceStatus === 'success' ? 'opacity-0 translate-y-20 scale-95 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'} ${isMenuOpen ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden relative border-[0.5px] border-white/10 shadow-inner">
          <div className="h-full relative transition-all duration-500 rounded-full" style={{ width: `${(timeLeft / barMax) * 100}%`, backgroundColor: gamePhase === 'MEMORIZE' ? palette[0] : '#fbbf24', boxShadow: `0 0 25px ${palette[0]}66` }} />
        </div>
        
        <div className="flex flex-col gap-3 max-w-md mx-auto w-full px-4">
          {activeOptions.map((opt, i) => {
            const btnColor = palette[i % palette.length] || palette[0];
            const fontSize = Math.max(14, Math.min(24, 300 / opt.length));
            
            return (
              <button 
                key={i} 
                onClick={() => handleChoice(opt)} 
                disabled={selectedChoice !== null || eliminatedChoices.includes(opt)}
                className={`group relative h-16 sm:h-20 rounded-[24px] transition-all duration-500 flex items-center justify-center overflow-hidden border
                  ${(selectedChoice === opt) 
                    ? (choiceStatus === 'idle' ? 'bg-white/20 border-white/40 scale-102 shadow-[0_0_20px_rgba(255,255,255,0.2)]' : (choiceStatus === 'success' ? 'bg-emerald-500/30 border-emerald-400 scale-105 shadow-[0_0_30px_rgba(52,211,153,0.3)]' : 'bg-rose-500/30 border-rose-400 scale-95 opacity-80')) 
                    : 'bg-black/40 hover:brightness-110 active:scale-[0.98]'}
                  ${(selectedChoice !== null && selectedChoice !== opt) || eliminatedChoices.includes(opt) ? 'opacity-20 scale-90 blur-[2px] grayscale' : 'opacity-100'}
                  ${isPeekPhase ? 'opacity-60' : 'opacity-100'}`}
                style={{
                  borderColor: selectedChoice === opt ? undefined : `${btnColor}40`,
                  backgroundColor: selectedChoice === opt ? undefined : `${btnColor}10`
                }}
              >
                {selectedChoice === opt && choiceStatus !== 'idle' && (
                  <div className={`absolute inset-0 blur-2xl opacity-30 animate-pulse ${choiceStatus === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                )}
                <div className="relative z-10 w-full px-6 flex items-center justify-center">
                  <span 
                    className="font-black text-white tracking-widest whitespace-nowrap overflow-hidden transition-all duration-300"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      textShadow: `0 0 10px ${btnColor}`
                    }}
                  >
                    {renderChoiceContent(opt)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed right-2 bottom-2 z-[300]"><SideMenu onExit={() => setShowQuitModal(true)} onToggle={setIsMenuOpen} isMinimal={true} expandDirection="up" /></div>
      {showQuitModal && <QuitConfirmationModal onConfirm={onExit} onCancel={() => setShowQuitModal(false)} />}
    </div>
  );
};
