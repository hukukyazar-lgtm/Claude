
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from './Button';
import { UserStats } from '../types';
import { LoginModal } from './LoginModal';
import { syncSupabaseStats, fetchLeaderboard, fetchUserRank, supabase, toUUID } from '../lib/supabase';
import { User as FirebaseUser } from 'firebase/auth';
import { LeaderboardEntry } from '../types';
import { 
  Trophy, Star, Zap, Orbit, CloudUpload, Crown, 
  AlertCircle, RefreshCw, User, Gamepad2, 
  MapPin, Compass, Sparkles, Timer, ChevronRight, X
} from 'lucide-react';
import { Cube3D } from './Cube3D';
import { useTheme } from '../ThemeProvider';
import { usePlanets } from '../PlanetProvider';
import { motion, AnimatePresence } from 'motion/react';
import { generateBots } from '../utils/generateBots';

type Tab = 'GLOBAL' | 'MY_STATS';

interface RankingModalProps {
  onClose?: () => void;
  stats: UserStats;
  currentUser?: FirebaseUser | null;
  isSyncing?: boolean;
}

export const RankingModal: React.FC<RankingModalProps> = ({ onClose, stats, currentUser, isSyncing }) => {
  const { palette } = useTheme();
  const { planetNames } = usePlanets();
  const [activeTab, setActiveTab] = useState<Tab>('GLOBAL');
  const [showLogin, setShowLogin] = useState(false);
  const [leaderBoard, setLeaderBoard] = useState<LeaderboardEntry[]>([]);
  const [userRankData, setUserRankData] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [actualRank, setActualRank] = useState<number | null>(null);

  const userScore = useMemo(() => {
    return (stats.level * 1000) + (stats.stars * 50) + Math.floor(stats.coins / 10);
  }, [stats]);

  const userRank = useMemo(() => {
    if (!currentUser || !leaderBoard.length) return actualRank;
    const uuid = toUUID(currentUser.uid);
    const index = leaderBoard.findIndex(p => p.user_id === currentUser.uid || p.user_id === uuid);
    return index !== -1 ? index + 1 : actualRank;
  }, [leaderBoard, currentUser, actualRank]);

  const getPlanetAndGate = (level: number) => {
    const planet = Math.ceil(level / 6);
    const gate = ((level - 1) % 6) + 1;
    return { planet, gate };
  };

  const handleManualSync = async () => {
    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    setIsManualSyncing(true);
    try {
      await syncSupabaseStats(currentUser.uid, stats, currentUser.displayName || "", currentUser.photoURL || "");
      await loadLeaderboard();
    } catch (e) {
      console.error("Manual sync failed:", e);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const loadLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchLeaderboard();
      
      // Bot kullanıcıları deterministik olarak oluştur (Seed: Günlük bazda)
      const daySeed = Math.floor(Date.now() / 86400000);
      const bots = generateBots(daySeed);

      // Gerçek verilerle botları birleştir ve sırala
      const combined = [...(data || []), ...bots].sort((a, b) => (b.score || 0) - (a.score || 0));
      
      setLeaderBoard(combined);
      
      if (currentUser && combined) {
        const uuid = toUUID(currentUser.uid);
        const index = combined.findIndex(p => p.user_id === currentUser.uid || p.user_id === uuid);
        
        if (index !== -1) {
          setActualRank(index + 1);
          setUserRankData(null);
        } else {
          try {
            const myData = await fetchUserRank(currentUser.uid);
            setUserRankData(myData);
            
            // Gerçek sıralamayı hesapla (skoru kendisinden yüksek olanları say)
            const { count, error: countError } = await supabase
              .from('leaderboard')
              .select('*', { count: 'exact', head: true })
              .gt('score', userScore);
              
            if (!countError) {
              // Botları da hesaba kat
              const botsAbove = bots.filter(b => b.score > userScore).length;
              setActualRank((count || 0) + botsAbove + 1);
            }
          } catch (e) {
            console.warn("User rank fetch failed, might not be in DB yet.");
          }
        }
      }
    } catch (err: any) {
      console.error("Leaderboard load error:", err);
      if (err.message?.includes('row-level security')) {
        setError("Veritabanı erişim izni hatası (RLS). Lütfen yöneticiye başvurun.");
      } else {
        setError(err.message || "Sıralama yüklenirken bir hata oluştu.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [currentUser]);

  const getRankTitle = (lvl: number) => {
    const sys = Math.ceil(lvl / 6);
    const titleIdx = sys - 1;
    const titles = ["SEYYAH", "KAŞIF", "YILDIZ TOZU", "NEBULA", "GEZEGEN", "YILDIZ", "GALAKSİ", "EVREN", "KOZMİK TANRI", "SONSUZLUK"];
    
    const currentIdx = titleIdx % titles.length;
    const tier = Math.floor(titleIdx / titles.length) + 1;
    const tierSuffix = tier > 1 ? ` ${"I".repeat(tier)}` : "";
    
    return titles[currentIdx] + tierSuffix;
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="w-full h-full flex flex-col bg-[#020617] overflow-hidden relative font-montserrat"
      id="ranking-modal-root"
    >
      {/* Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_transparent_70%)] opacity-60 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none" />
      
      {/* Animated Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.1, scale: 0.5 }}
            animate={{ 
              opacity: [0.1, 0.5, 0.1],
              scale: [0.5, 1, 0.5],
            }}
            transition={{ 
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%` 
            }}
          />
        ))}
      </div>

      {/* Header Section */}
      <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 h-24 sm:h-32 flex items-center justify-center z-[200] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent backdrop-blur-sm">
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center"
        >
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-[0.4em] uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            SIRALAMA
          </h1>
        </motion.div>

        {onClose && (
          <button 
            onClick={onClose}
            className="absolute right-6 sm:right-10 w-8 h-8 sm:w-10 sm:h-10 glass-morphism-bright rounded-lg sm:rounded-xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border-white/20 group"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-40 group-hover:opacity-100 transition-opacity" strokeWidth={3} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-0 pb-40 relative z-10 pt-24 sm:pt-32">
        <div className="flex flex-col gap-0 w-full pt-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-40">
               <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
               <span className="text-[11px] font-black tracking-[0.3em] uppercase italic">VERİLER ÇEKİLİYOR...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 px-10 text-center glass-morphism rounded-[40px] border-red-500/20 bg-red-500/5">
               <AlertCircle className="w-16 h-16 text-red-500/40 mb-6" />
               <h3 className="text-red-500/60 font-black text-xl uppercase italic mb-2">BAĞLANTI HATASI</h3>
               <p className="text-white/20 text-xs font-medium mb-6">{error}</p>
               <Button variant="outline" onClick={loadLeaderboard} className="!py-3 !px-8 !rounded-2xl border-white/10">TEKRAR DENE</Button>
            </div>
          ) : (
            <>
              {leaderBoard.map((player, i) => {
                const isUser = player.user_id === currentUser?.uid || player.user_id === toUUID(currentUser?.uid || "");
                const playerLevel = isUser ? stats.level : (player.level || 1);
                const { planet, gate } = getPlanetAndGate(playerLevel);
                const planetName = planetNames[planet] || "Gezegen";
                const playerStars = isUser ? stats.stars : (player.stars || Math.floor(playerLevel * 2.5));
                const rankTitle = getRankTitle(playerLevel);
                const playerScore = isUser ? userScore : (player.score || 0);
                
                return (
                  <motion.div 
                    key={`${player.user_id}-${i}`}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className={`w-full relative group transition-all duration-500`}
                  >
                    {/* Functional Dashboard Card Design */}
                    <div className={`
                      relative flex items-center gap-2 p-3 rounded-none border-y transition-all duration-500
                      ${isUser 
                        ? 'bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-400/40 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                        : 'bg-white/[0.03] border-white/5 hover:bg-white/[0.07] hover:border-white/10'
                      }
                    `}>
                      {/* Left: Rank */}
                      <div className="w-8 shrink-0 flex items-center justify-center">
                         {i < 3 ? (
                           <div className={`
                             w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2
                             ${i === 0 ? 'bg-amber-400 border-amber-200 text-amber-950' : 
                                i === 1 ? 'bg-slate-300 border-slate-100 text-slate-900' : 
                                'bg-orange-400 border-orange-200 text-orange-950'}
                           `}>
                             <span className="text-base font-black italic">{i + 1}</span>
                           </div>
                         ) : (
                           <span className="text-lg font-black text-white/40 italic">{i + 1}</span>
                         )}
                      </div>

                      {/* Avatar Group */}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-12 h-12 rounded-2xl overflow-hidden border-2 p-0.5 transition-transform duration-500 group-hover:scale-105 ${isUser ? 'border-indigo-500' : 'border-white/10'}`}>
                          {player.photo_url ? (
                            <img src={player.photo_url} alt="" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full bg-white/5 flex items-center justify-center rounded-xl">
                              <User className="w-6 h-6 text-white/20" />
                            </div>
                          )}
                        </div>
                        <span className="text-[8px] font-black text-white bg-indigo-600/60 px-1.5 py-0.5 rounded-md tracking-wider uppercase border border-white/20 shadow-sm whitespace-nowrap">
                          {rankTitle}
                        </span>
                      </div>

                      {/* Middle: Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center ml-1">
                        <h4 className={`font-black text-base uppercase truncate italic leading-tight ${isUser ? 'text-white' : 'text-white/80'}`}>
                          {player.username || "Gezgin"}
                        </h4>
                        <span className="text-[10px] font-bold text-indigo-200 italic uppercase tracking-wider whitespace-nowrap">
                          {planetName} {gate}. GEÇİT
                        </span>
                      </div>

                      {/* Stars Section */}
                      <div className="flex flex-col items-center justify-center px-2">
                        <Star className="w-6 h-6 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                        <span className="text-lg font-black text-white italic mt-0.5 tabular-nums leading-none">{playerStars}</span>
                      </div>

                      {/* Right: Score Group */}
                      <div className="flex flex-col items-end justify-center min-w-[70px] gap-0.5 pr-1">
                        <div className="w-6 h-6 flex items-center justify-center">
                          <Cube3D 
                            size={16} 
                            color="#fbbf24" 
                            speed={0} 
                            visualStyle="LUMINA" 
                            noShading={false} 
                            rotationAxis="TUMBLE" 
                          />
                        </div>
                        <span className="text-lg font-black text-white italic leading-none tabular-nums">
                          {playerScore.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      </div>

      {/* Fixed User Rank at Bottom */}
      {currentUser && (
        <div className="absolute bottom-0 left-0 w-full p-0 z-30 pointer-events-none">
          <div className="w-full pointer-events-auto">
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="w-full relative group transition-all duration-500"
            >
              <div className="relative flex items-center gap-2 p-3 rounded-none border-t border-indigo-400/40 bg-gradient-to-r from-indigo-600/60 to-purple-600/60 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                {/* Left: Rank */}
                <div className="w-8 shrink-0 flex items-center justify-center">
                  <span className="text-lg font-black text-white italic">#{userRank || '?'}</span>
                </div>

                {/* Avatar Group */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-indigo-500 p-0.5 shrink-0">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt="" className="w-full h-full object-cover rounded-xl" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-full h-full bg-indigo-500/20 flex items-center justify-center rounded-xl">
                        <User className="w-6 h-6 text-indigo-400" />
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] font-black text-white bg-white/20 px-1.5 py-0.5 rounded-md tracking-wider uppercase border border-white/20 whitespace-nowrap">
                    {getRankTitle(stats.level)}
                  </span>
                </div>

                {/* Middle: Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center ml-1">
                  <h4 className="font-black text-base uppercase truncate italic leading-tight text-white">
                    {currentUser.displayName || "Siz"}
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-100 italic uppercase tracking-wider whitespace-nowrap">
                    {planetNames[getPlanetAndGate(stats.level).planet] || "Gezegen"} {getPlanetAndGate(stats.level).gate}. GEÇİT
                  </span>
                </div>

                {/* Stars Section */}
                <div className="flex flex-col items-center justify-center px-2">
                  <Star className="w-6 h-6 text-cyan-400 fill-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                  <span className="text-lg font-black text-white italic mt-0.5 tabular-nums leading-none">{stats.stars}</span>
                </div>

                {/* Right: Score Group */}
                <div className="flex flex-col items-end justify-center min-w-[70px] gap-0.5 pr-1">
                  <div className="w-6 h-6 flex items-center justify-center">
                    <Cube3D 
                      size={16} 
                      color="#fbbf24" 
                      speed={0} 
                      visualStyle="LUMINA" 
                      noShading={false} 
                      rotationAxis="TUMBLE" 
                    />
                  </div>
                  <span className="text-lg font-black text-white italic leading-none tabular-nums">
                    {userScore.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* Footer Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent pointer-events-none z-20" />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </motion.div>
  );
};
