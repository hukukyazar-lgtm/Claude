
import { BotEntry } from '../types';

export const generateBots = (seed: number): BotEntry[] => {
  const botNames = [
    "Nova", "Astro", "Cosmo", "Stellar", "Nebula", "Orion", "Lyra", "Vega", "Altair", "Sirius",
    "Rigel", "Antares", "Spica", "Pollux", "Castor", "Procyon", "Capella", "Arcturus", "Canopus", "Polaris"
  ];

  let currentSeed = seed;
  const nextRand = () => {
    // Deterministik LGC Formülü: (seed * 9301 + 49297) % 233280
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  return botNames.map((name, index) => {
    const r1 = nextRand();
    const r2 = nextRand();
    const baseScore = 50000 - (index * 2000);
    const score = Math.floor(baseScore + (r1 * 1500));
    
    return {
      user_id: `bot-${index}`,
      name: name,
      username: name,
      score: score,
      isBot: true,
      level: Math.floor(10 + (r2 * 40)),
      stars: Math.floor(50 + (r1 * 150)),
      photo_url: `https://picsum.photos/seed/bot-${index}-${seed}/150/150`
    };
  });
};
