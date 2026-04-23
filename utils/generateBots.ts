
/**
 * LUMINA - Deterministik Bot Üretici
 * Bu modül, her gün için aynı botları ve skorları üreterek tutarlı bir liderlik tablosu sağlar.
 */

import { LeaderboardEntry } from '../types';

// Basit bir deterministik rastgele sayı üretici (LGC)
const seededRandom = (seed: number) => {
  const m = 233280;
  const a = 9301;
  const c = 49297;
  let currentSeed = seed;
  
  return () => {
    currentSeed = (currentSeed * a + c) % m;
    return currentSeed / m;
  };
};

export const generateBots = (daySeed: number): LeaderboardEntry[] => {
  const random = seededRandom(daySeed);
  
  const botNames = [
    "Nova", "Astro", "Cosmo", "Stellar", "Nebula", "Orion", "Lyra", "Vega", "Altair", "Sirius",
    "Rigel", "Antares", "Spica", "Pollux", "Castor", "Procyon", "Capella", "Arcturus", "Canopus", "Polaris",
    "Zenith", "Nadira", "Eclipse", "Solstice", "Equinox", "Quasar", "Pulsar", "Void", "Aether", "Chaos",
    "Titan", "Atlas", "Helios", "Selene", "Eos", "Nyx", "Hypnos", "Thanatos", "Nemesis", "Eris"
  ];

  return botNames.map((name, index) => {
    const scoreBase = 50000 - (index * 1200);
    const randomModifier = Math.floor(random() * 800);
    const levelBase = Math.max(1, 50 - Math.floor(index / 1.5));
    
    return {
      user_id: `bot-${index}`,
      username: name,
      score: scoreBase + randomModifier,
      level: levelBase,
      stars: Math.max(0, 150 - index * 3 + Math.floor(random() * 10)),
      photo_url: `https://picsum.photos/seed/lumina-bot-${index}-${daySeed}/200/200`,
      isBot: true
    };
  });
};
