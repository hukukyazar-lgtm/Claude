
import { useState } from 'react';
import { HubSubView } from '../types';

export const useGameUI = () => {
  const [hubSubView, setHubSubView] = useState<HubSubView>(HubSubView.MAIN);
  const [showChest, setShowChest] = useState(false);
  const [bonusEarned, setBonusEarned] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [starsEarnedInLevel, setStarsEarnedInLevel] = useState(0);
  const [riskReward, setRiskReward] = useState(0);

  return {
    hubSubView,
    setHubSubView,
    showChest,
    setShowChest,
    bonusEarned,
    setBonusEarned,
    sessionScore,
    setSessionScore,
    starsEarnedInLevel,
    setStarsEarnedInLevel,
    riskReward,
    setRiskReward
  };
};
