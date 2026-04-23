
import { useState } from 'react';
import { GameState } from '../types';

export const useGameFlow = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SPLASH);
  const [transitionState, setTransitionState] = useState<'idle' | 'animating'>('idle');
  const [replayingLevel, setReplayingLevel] = useState<number | null>(null);

  const changeGameState = (newState: GameState) => {
    setTransitionState('animating');
    setTimeout(() => {
      setGameState(newState);
      setTransitionState('idle');
    }, 300);
  };

  return {
    gameState,
    changeGameState,
    transitionState,
    replayingLevel,
    setReplayingLevel
  };
};
