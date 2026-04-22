
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { LoginModal } from './LoginModal';
import { auth, logout } from '../lib/firebase.ts';
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { User, BarChart3, Orbit, Trophy, LogIn, LogOut, ShieldCheck, Star, ArrowRight, Share2, Award, Cloud, Globe, Smartphone, CheckCircle2, Info, X } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { motion, AnimatePresence } from 'motion/react';
import { UserStats } from '../types';

interface ProfileModalProps {
  level: number;
  stats: UserStats;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ level, stats: userStats, onClose }) => {
  const { palette } = useTheme();
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  
  const currentSystem = Math.ceil(level / 6);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const totalScore = (level * 1000) + (userStats.stars * 50) + Math.floor(userStats.coins / 10);
  
  // Başarı oranı hesaplama (basit bir mantık: kazanılan yıldızlar / (seviye * 3))
  const successRate = Math.min(100, Math.round((userStats.stars / (level * 3)) * 100)) || 0;
  
  const stats = [
    { label: "TOPLAM PUAN", value: totalScore.toLocaleString(), icon: BarChart3, color: palette[0], desc: "Yıldızlar x50 puan kazandırır" },
    { label: "TOPLAM YILDIZ", value: userStats.stars, icon: Star, color: "#fbbf24", desc: "Sıralamadaki yerinizi belirler" },
    { label: "BAŞARI ORANI", value: `%${successRate}`, icon: Award, color: "#10b981", desc: "Kusursuz geçişleri takip eder" },
  ];

  const getRankData = (lvl: number) => {
    // Rütbe her sistemde (6 seviyede) bir değişir
    const sys = Math.ceil(lvl / 6);
    const titleIdx = sys - 1;
    const titles = ["GÖZLEMCİ", "KAYITÇI", "ANIMSATICI", "ARŞİVCİ", "MUHAFIZ", "ODAKLAYICI", "KODLAYICI", "GERİÇAĞIRICI", "SIR-KÂŞİFİ", "MUTLAK BELLEK"];
    const colors = [palette[0], palette[1] || palette[0], palette[2] || palette[0], palette[3] || palette[0], palette[4] || palette[0], "#6366f1", "#f472b6", "#d946ef", "#fbbf24", "#ffffff"];
    
    const currentIdx = titleIdx % titles.length;
    const nextIdx = (titleIdx + 1) % titles.length;
    
    // Kademe (Tier) hesaplama (örn: 60 seviye sonra rütbeler başa döner ama yanına 'II' gelir)
    const tier = Math.floor(titleIdx / titles.length) + 1;
    const tierSuffix = tier > 1 ? ` ${"I".repeat(tier)}` : "";
    
    // Mevcut sistemdeki ilerleme (1-6 arası seviye)
    const progressInRank = ((lvl - 1) % 6) + 1;
    
    return { 
      currentTitle: titles[currentIdx] + tierSuffix, 
      nextTitle: titles[nextIdx] + (Math.floor((titleIdx + 1) / titles.length) + 1 > 1 ? ` ${"I".repeat(Math.floor((titleIdx + 1) / titles.length) + 1)}` : ""), 
      color: colors[currentIdx], 
      progress: progressInRank, 
      isMax: false,
      allTitles: titles,
      allColors: colors,
      currentIdx: currentIdx,
      systemLevels: 6
    };
  };

  const rankData = getRankData(level);

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      className="w-full h-full flex flex-col bg-[#020617] overflow-hidden relative font-montserrat"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_60%)] opacity-80 pointer-events-none" />
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-color-dodge transition-colors duration-1000"
        style={{ backgroundImage: `radial-gradient(circle at 0% 0%, ${palette[0]} 0%, transparent 50%), radial-gradient(circle at 100% 100%, ${palette[2]} 0%, transparent 50%)` }}
      />
      
      {/* Header Panel */}
      <div className="absolute top-0 left-0 right-0 px-6 h-16 sm:h-20 flex items-center justify-between z-[200]">
        <button 
          onClick={onClose}
          className="w-8 h-8 sm:w-10 sm:h-10 glass-morphism-bright rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border-white/10 group bg-white/5"
        >
          <ArrowRight className="w-4 h-4 text-white opacity-40 group-hover:opacity-100 transition-opacity rotate-180" strokeWidth={3} />
        </button>

        <div className="text-center">
          <h1 className="text-[10px] sm:text-xs font-black text-white/40 tracking-[0.4em] uppercase italic">
            HESAP & İSTATİSTİKLER
          </h1>
        </div>

        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="flex-1 px-4 sm:px-10 flex flex-col gap-3 sm:gap-4 overflow-y-auto custom-scrollbar relative z-10 pt-16 sm:pt-20 pb-6">
        
        {/* Bento Grid Layer 1: Avatar & Rank Combined */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
          {/* Avatar Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="lg:col-span-5 glass-morphism border-white/10 p-4 sm:p-5 rounded-[32px] flex items-center gap-4 sm:gap-6 shadow-2xl relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/5 rounded-[24px] sm:rounded-[30px] flex items-center justify-center border border-white/20 shadow-2xl overflow-hidden relative z-10">
                {user?.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                ) : (
                  <User className="w-8 h-8 text-white/20" />
                )}
              </div>
            </div>
            
            <div className="flex-1 text-left relative z-20">
              <h2 className="text-white text-xl sm:text-2xl font-[900] tracking-tighter uppercase mb-1 truncate max-w-[150px] sm:max-w-none">
                {user?.displayName || "Gezgin"}
              </h2>
              <div className="flex gap-1.5">
                <span className="px-2 py-0.5 bg-white/10 rounded-full border border-white/10 text-[8px] font-black tracking-widest text-white/60 uppercase">
                  SEVİYE {level}
                </span>
                <span className="px-2 py-0.5 bg-indigo-500/20 rounded-full border border-indigo-500/20 text-[8px] font-black tracking-widest text-indigo-400 uppercase">
                  AKTİF
                </span>
              </div>
            </div>
          </motion.div>

          {/* Rank Card */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 glass-morphism border-white/10 p-5 rounded-[32px] flex flex-col justify-center shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex flex-col">
                <span className="text-white/20 font-black text-[8px] uppercase tracking-[0.2em]">MEVCUT RÜTBE</span>
                <h3 className="text-lg sm:text-xl font-[1000] tracking-tighter italic uppercase leading-none" style={{ color: rankData.color }}>
                  {rankData.currentTitle}
                </h3>
              </div>
              <Award className="w-5 h-5 opacity-40" style={{ color: rankData.color }} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{rankData.progress}/{rankData.systemLevels}</span>
                <span className="text-[10px] font-black text-white italic opacity-40">{rankData.nextTitle}</span>
              </div>
              <div className="h-3 flex gap-1 p-0.5 bg-black/40 rounded-lg border border-white/5">
                {[...Array(rankData.systemLevels)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`flex-1 rounded-sm transition-all duration-700 ${(i + 1) <= rankData.progress ? 'opacity-100' : 'opacity-10'}`}
                    style={{ backgroundColor: (i + 1) <= rankData.progress ? rankData.color : '#fff' }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bento Grid Layer 2: Main Stats - Tighter */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="glass-morphism border-white/10 p-4 sm:p-5 rounded-[32px] flex flex-col items-center text-center gap-2 shadow-xl group transition-all"
            >
              <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" style={{ color: stat.color }} />
              <div className="flex flex-col">
                <span className="text-[7px] sm:text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</span>
                <span className="text-lg sm:text-xl font-[950] text-white tracking-tighter italic truncate">{stat.value}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bento Grid Layer 3: Security & Actions - Smaller */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Status Card - Tighter */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className={`rounded-[32px] p-5 border shadow-xl relative overflow-hidden flex items-center justify-between gap-4 ${user ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-indigo-500/5 border-indigo-500/20'}`}
          >
            <div className="flex items-center gap-3 relative z-10">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}>
                {user ? <ShieldCheck className="w-6 h-6 text-emerald-400" /> : <Info className="w-6 h-6 text-indigo-400" />}
              </div>
              <div>
                <h3 className={`text-xs font-black uppercase tracking-tight ${user ? 'text-emerald-400' : 'text-indigo-400'}`}>
                  {user ? 'BULUT AKTİF' : 'YEREL MOD'}
                </h3>
                <p className="text-[7px] text-white/40 font-bold uppercase tracking-[0.1em]">
                  {user ? 'VERİLER GÜVENDE' : 'VERİ KAYBI RİSKİ'}
                </p>
              </div>
            </div>
            {user && (
               <div className="text-[8px] text-white/30 font-bold truncate max-w-[100px] text-right hidden lg:block italic">
                  {user.email}
               </div>
            )}
          </motion.div>

          {/* Action Card - Tighter */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3"
          >
            {!user ? (
              <button 
                onClick={() => setShowLogin(true)}
                className="flex-1 bg-white text-black rounded-[32px] py-4 shadow-xl flex items-center justify-center gap-2 group active:scale-95 transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span className="font-[1000] text-xs tracking-widest uppercase italic">HESABI BAĞLA</span>
              </button>
            ) : (
              <div className="flex-1 flex gap-3">
                <button 
                  className="flex-1 glass-morphism border-white/5 rounded-[32px] py-4 flex items-center justify-center gap-2 hover:border-white/20 transition-all active:scale-95 opacity-50 grayscale pointer-events-none"
                >
                  <Share2 className="w-4 h-4 text-white" />
                  <span className="font-black tracking-widest text-[8px] text-white">PAYLAŞ</span>
                </button>
                <button 
                  onClick={() => logout()}
                  className="px-6 rounded-[32px] border border-red-500/20 bg-red-500/5 flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all active:scale-95"
                >
                  <LogOut className="w-3 h-3 text-red-400/60" />
                  <span className="font-black tracking-widest text-[8px] text-red-500/40 uppercase">ÇIKIŞ</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer Spacer */}
      <div className="pb-4 shrink-0" />

      <AnimatePresence>
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
      `}</style>
    </motion.div>
  );
};

