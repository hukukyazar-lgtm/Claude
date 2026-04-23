
export interface BotEntry {
  user_id: string;
  username: string;
  score: number;
  isBot: true;
  photo_url?: string;
  level?: number;
  stars?: number;
}

export interface RealEntry {
  user_id: string;
  username: string;
  score: number;
  isBot?: false;
  photo_url?: string;
  level?: number;
  stars?: number;
}

export type LeaderboardEntry = RealEntry | BotEntry;

const BOT_NAMES = [
  "Nova", "Astro", "Cosmo", "Stellar", "Nebula", "Orion", "Lyra", "Vega", "Altair", "Sirius",
  "Rigel", "Antares", "Spica", "Pollux", "Castor", "Procyon", "Capella", "Arcturus", "Canopus", "Polaris",
  "Zenith", "Nadira", "Eclipse", "Solstice", "Equinox", "Quasar", "Pulsar", "Void", "Aether", "Chaos",
  "Titan", "Atlas", "Helios", "Selene", "Eos", "Nyx", "Hypnos", "Thanatos", "Nemesis", "Eris"
];

export const generateBots = (daySeed: number): BotEntry[] => {
  let currentSeed = daySeed;

  const getPseudoRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  return BOT_NAMES.map((name, index) => {
    // Deterministic random factor for this specific bot on this specific day
    // We mix the daySeed with index to get unique deterministic values per bot
    const botSeed = daySeed + index * 777;
    let localSeed = (botSeed * 9301 + 49297) % 233280;
    const getLocalRandom = () => {
      localSeed = (localSeed * 9301 + 49297) % 233280;
      return localSeed / 233280;
    };

    const baseScore = 50000 - (index * 1200);
    const randomBoost = Math.floor(getLocalRandom() * 500);
    const score = Math.max(1000, baseScore + randomBoost);
    
    const level = Math.max(1, 50 - Math.floor(index / 1.5) + Math.floor(getLocalRandom() * 3));
    const stars = Math.max(0, 150 - index * 3 + Math.floor(getLocalRandom() * 10));

    return {
      user_id: `bot-${index}`,
      username: name,
      score,
      isBot: true,
      photo_url: `https://picsum.photos/seed/bot${index}${daySeed}/200/200`,
      level,
      stars
    };
  });
};
