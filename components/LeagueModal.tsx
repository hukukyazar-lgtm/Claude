
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchLeaderboard } from '../lib/supabase';
import { User as FirebaseUser } from 'firebase/auth';
import { UserStats } from '../types';
import { Star, Target, Zap, Coins, Crown, User, X, TrendingUp, Shield, Hexagon, Flame, Crosshair, ChevronRight } from 'lucide-react';

type Tab = 'ranking' | 'stats';

interface LeagueModalProps {
  onClose?: () => void;
  currentUser?: FirebaseUser | null;
  stats?: UserStats;
}

export const LeagueModal: React.FC<LeagueModalProps> = ({ onClose, currentUser, stats }) => {
  const [activeTab, setActiveTab] = useState<Tab>('ranking');
  const [leaderBoard, setLeaderBoard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'ranking') {
      const loadLeaderboard = async () => {
        setIsLoading(true);
        const data = await fetchLeaderboard();
        if (data && data.length > 0) {
          setLeaderBoard(data);
        }
        setIsLoading(false);
      };
      loadLeaderboard();
    }
  }, [activeTab]);

  const userStats = [
    { label: "YILDIZLAR", value: stats?.stars || "0", icon: Star, color: "text-cyan-400" },
    { label: "SEVİYE", value: stats?.level || "1", icon: Target, color: "text-emerald-400" },
    { label: "SERİ", value: stats?.streak || "0", icon: Flame, color: "text-amber-400" },
    { label: "COINS", value: stats?.coins?.toLocaleString() || "0", icon: Coins, color: "text-indigo-400" },
  ];

  // Mock current league info
  const currentLeague = "YILDIZ LİGİ";
  const nextLeague = "GALAKTİK LİG";
  const leagueProgress = 65; // %
  const currentRank = leaderBoard.findIndex(p => p.user_id === currentUser?.uid) + 1 || "-";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 z-[200] flex flex-col bg-[#030305] font-montserrat overflow-hidden text-white"
    >
      {/* Tech/Sci-Fi Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_0%,black_40%,transparent_100%)]" />
        
        {/* Glowing Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[40%] bg-indigo-600/20 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute top-[20%] right-[-20%] w-[60%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {/* Top Bar */}
      <div className="relative h-20 flex items-center justify-between px-6 shrink-0 z-20 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}>
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-sm font-black tracking-[0.2em] uppercase text-white/90">REKABETÇİ</h2>
            <p className="text-[9px] font-bold tracking-widest text-indigo-400 uppercase">Sezon 1</p>
          </div>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors group"
            style={{ clipPath: 'polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
          >
            <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
          </button>
        )}
      </div>

      {/* Hero Section - Rank Emblem */}
      <div className="relative pt-8 pb-4 px-6 shrink-0 z-10 flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
          className="relative w-32 h-32 mb-6 flex items-center justify-center"
        >
          {/* Outer rotating ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-indigo-500/30 rounded-full border-t-indigo-400 border-b-cyan-400"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-2 border border-white/10 rounded-full border-l-indigo-500"
          />
          
          {/* Core Emblem */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-600 to-cyan-800 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
            <div className="absolute inset-[2px] bg-[#0a0a12]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/20 to-transparent" />
              <div className="w-full h-full flex items-center justify-center">
                <Hexagon className="w-12 h-12 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="text-center flex flex-col items-center mb-6">
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-white uppercase tracking-widest">
            {currentLeague}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold tracking-[0.2em] text-white/50 uppercase">Mevcut Sıra:</span>
            <span className="text-xs font-black text-cyan-400">{currentRank !== "-" ? `#${currentRank}` : "YOK"}</span>
          </div>
        </div>

        {/* Modern Tabs */}
        <div className="w-full max-w-md flex gap-2">
          {(['ranking', 'stats'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 relative h-12 flex items-center justify-center group"
            >
              <div className={`absolute inset-0 border transition-colors duration-300 ${activeTab === tab ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-white/5 border-white/10 group-hover:bg-white/10'}`} style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }} />
              <span className={`relative z-10 text-xs font-bold tracking-[0.2em] uppercase transition-colors ${activeTab === tab ? 'text-indigo-300' : 'text-white/50 group-hover:text-white/80'}`}>
                {tab === 'ranking' ? 'LİDERLİK' : 'KARİYER'}
              </span>
              {activeTab === tab && (
                <motion.div layoutId="tabIndicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-6 pb-8">
        <AnimatePresence mode="wait">
          {activeTab === 'ranking' ? (
            <motion.div
              key="ranking"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-2"
            >
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                  <span className="text-[10px] font-bold tracking-[0.3em] text-indigo-400/60 uppercase">Eşitleniyor...</span>
                </div>
              ) : (
                <>
                  {/* Top 3 Players - Special Cards */}
                  <div className="flex flex-col gap-2 mb-4">
                    {leaderBoard.slice(0, 3).map((player, i) => {
                      const isUser = player.user_id === currentUser?.uid;
                      const rankColors = [
                        { bg: "bg-amber-500/10", border: "border-amber-500/50", text: "text-amber-400", glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]" },
                        { bg: "bg-slate-300/10", border: "border-slate-300/50", text: "text-slate-300", glow: "shadow-[0_0_30px_rgba(203,213,225,0.1)]" },
                        { bg: "bg-orange-500/10", border: "border-orange-500/50", text: "text-orange-400", glow: "shadow-[0_0_30px_rgba(249,115,22,0.1)]" }
                      ];
                      const style = rankColors[i];

                      return (
                        <motion.div
                          key={player.user_id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`relative flex items-center p-4 ${style.bg} border ${style.border} ${style.glow} ${isUser ? 'ring-1 ring-indigo-500' : ''}`}
                          style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                        >
                          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                          
                          <div className="w-10 flex flex-col items-center justify-center mr-4">
                            <span className={`text-2xl font-black italic ${style.text}`}>{i + 1}</span>
                            {i === 0 && <Crown className={`w-4 h-4 mt-1 ${style.text}`} />}
                          </div>
                          
                          <div className="w-12 h-12 bg-black/50 border border-white/10 overflow-hidden mr-4 shrink-0" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}>
                            {player.photo_url ? (
                              <img src={player.photo_url} alt="" className="w-full h-full object-cover scale-125" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-full h-full p-2 opacity-50" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-white text-lg tracking-wide truncate uppercase">{player.username}</h4>
                            <div className="flex items-center gap-2 opacity-80">
                              <Crosshair className="w-3 h-3 text-cyan-400" />
                              <span className="text-xs font-bold tracking-widest text-cyan-100">{(player.score || 0).toLocaleString()} RP</span>
                            </div>
                          </div>
                          
                          {isUser && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 bg-indigo-500 text-[8px] font-black tracking-widest text-white uppercase" style={{ clipPath: 'polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px)' }}>
                              SEN
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Rest of the leaderboard */}
                  <div className="flex flex-col gap-1.5">
                    {leaderBoard.slice(3).map((player, i) => {
                      const rank = i + 4;
                      const isUser = player.user_id === currentUser?.uid;
                      return (
                        <motion.div
                          key={player.user_id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3 + (i * 0.05) }}
                          className={`flex items-center p-3 border transition-colors ${
                            isUser 
                            ? 'bg-indigo-500/20 border-indigo-500/50' 
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                          style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}
                        >
                          <div className="w-10 text-center mr-3">
                            <span className="text-sm font-bold text-white/40 italic">{rank}</span>
                          </div>
                          <div className="w-8 h-8 bg-black/40 border border-white/10 overflow-hidden mr-4 shrink-0" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}>
                            {player.photo_url ? (
                              <img src={player.photo_url} alt="" className="w-full h-full object-cover scale-125" referrerPolicy="no-referrer" />
                            ) : (
                              <User className="w-full h-full p-1.5 opacity-50" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex justify-between items-center">
                            <h4 className={`font-bold truncate text-sm uppercase tracking-wide ${isUser ? 'text-indigo-300' : 'text-white/90'}`}>{player.username}</h4>
                            <span className="text-[10px] font-bold text-cyan-400/80 tracking-widest">{(player.score || 0).toLocaleString()}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {/* Promotion Progress - Tech Style */}
              <div className="bg-white/5 border border-white/10 p-6 relative overflow-hidden" style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-2xl rounded-full pointer-events-none" />
                
                <div className="flex justify-between items-end mb-6 relative z-10">
                  <div>
                    <span className="text-[9px] font-bold text-indigo-400 tracking-[0.3em] uppercase block mb-1">SONRAKİ AŞAMA</span>
                    <h3 className="text-xl font-black text-white uppercase tracking-widest">{nextLeague}</h3>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className="text-2xl font-black text-cyan-400">{leagueProgress}%</span>
                    <span className="text-[8px] text-white/40 uppercase tracking-widest">İlerleme</span>
                  </div>
                </div>

                {/* Segmented Tech Progress Bar */}
                <div className="flex gap-1 h-3 w-full relative z-10">
                  {[...Array(10)].map((_, i) => {
                    const isActive = i < Math.floor(leagueProgress / 10);
                    return (
                      <div 
                        key={i} 
                        className={`flex-1 h-full ${isActive ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'bg-white/10'}`}
                        style={{ clipPath: 'polygon(15% 0, 100% 0, 85% 100%, 0 100%)' }}
                      />
                    );
                  })}
                </div>
                
                <div className="mt-4 flex items-center justify-between text-[9px] font-bold tracking-widest uppercase text-white/40">
                  <span>{currentLeague}</span>
                  <ChevronRight className="w-3 h-3 text-white/20" />
                  <span className="text-indigo-300">{nextLeague}</span>
                </div>
              </div>

              {/* Stats Grid - Angled Cards */}
              <div className="grid grid-cols-2 gap-3">
                {userStats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/5 border border-white/10 p-5 flex flex-col relative overflow-hidden group hover:bg-white/10 transition-colors"
                    style={{ clipPath: 'polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)' }}
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none transform group-hover:scale-110 transition-transform duration-500">
                      <stat.icon className="w-24 h-24" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      <span className="text-[9px] font-bold text-white/50 tracking-[0.2em] uppercase">{stat.label}</span>
                    </div>
                    <span className="text-2xl font-black text-white tracking-wider">{stat.value}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
      `}</style>
    </motion.div>
  );
};
