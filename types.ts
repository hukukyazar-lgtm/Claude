
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
  // Tekrar Bak (Peek) Sistemi
  hintsFreeze: number; // "Göremedim" hakkı
  hintsReveal: number; // "Bulamadım" hakkı
  // Görevler
  claimedMissions: number[]; // Alınan ödüllerin ID'leri
  lastMissionsRefresh: number; // Görevlerin en son ne zaman sıfırlandığı (timestamp)
  lastChestOpenTime: number; // Günlük sandığın en son ne zaman açıldığı
  // Dinamik Zorluk Parametreleri (Yerel)
  difficultyFactor: number; // 0.5 (Kolay) - 2.0 (Zor) arası
  performanceHistory: boolean[]; // Son geçit başarı geçmişi
  streak: number; // Mevcut doğru cevap serisi
  maxStreak: number; // Rekor doğru cevap serisi
  levelStars: Record<number, number>; // Level ID -> Star count (1-3)
}
