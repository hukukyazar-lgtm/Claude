
export enum GameState {
  SPLASH = 'SPLASH',
  LOADING = 'LOADING',
  TERMS = 'TERMS',
  HUB = 'HUB',
  MEMORY_GAME = 'MEMORY_GAME',
  MEMORY_PREPARE = 'MEMORY_PREPARE',
  WORD_PUZZLE = 'WORD_PUZZLE',
  LEVEL_COMPLETE = 'LEVEL_COMPLETE',
  LEVEL_FAIL = 'LEVEL_FAIL',
  NEXT_LEVEL_TRANSITION = 'NEXT_LEVEL_TRANSITION'
}

export enum HubSubView {
  MAIN = 'MAIN',
  PLANETS = 'PLANETS',
  SETTINGS = 'SETTINGS',
  PROFILE = 'PROFILE',
  RANKING = 'RANKING',
  COLLECTION = 'COLLECTION',
  SHOP = 'SHOP',
  MISSIONS = 'MISSIONS',
  BUCKET = 'BUCKET'
}

export interface UserStats {
  coins: number;
  hearts: number;
  stars: number;
  level: number;
  lastLifeRefillTime: number;
  hintsFreeze: number;
  hintsReveal: number;
  claimedMissions: number[];
  lastMissionsRefresh: number;
  lastChestOpenTime: number;
  difficultyFactor: number;
  performanceHistory: boolean[];
  streak: number;
  maxStreak: number;
  levelStars: Record<number, number>;
  activeRisk: number; // Risk edilen puan miktarını tutar (0 = risk yok)
}

export interface Question {
  target: string;
  distractors: string[];
  language: string;
  planetId: number;
  planetName: string;
  quesId: number;
  difficulty: number;
  planetImage: string;
}

export interface LeaderboardRankData {
  newRank: number;
  oldRank: number | null;
}

export interface RankUpData {
  title: string;
  color: string;
}

export interface RealEntry {
  user_id: string;
  username: string;
  score: number;
  level: number;
  stars: number;
  photo_url: string;
  isBot?: false;
}

export interface BotEntry {
  user_id: string;
  name: string;
  username: string; // Compatibility
  score: number;
  isBot: true;
  level: number;
  stars: number;
  photo_url: string;
}

export type LeaderboardEntry = RealEntry | BotEntry;
