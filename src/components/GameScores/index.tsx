'use client';

import { useGame } from '@/providers/GameProvider/index';
import { useItem } from '@/providers/ItemProvider/index';
import { GameMode, useMap } from '@/providers/MapProvider/index';
import React from 'react';

const GameScores = () => {
  const {
    score,
    highScore,
  } = useGame();
  const {
    p1Score,
    p2Score,
  } = useItem();
  const {
    gameMode
  } = useMap();

  return (
    <div
      className={`game-score-container ${gameMode !== GameMode.classic ? 'center' : ''}`}
    >
      { gameMode === GameMode.classic &&
        <p>Score: {score}</p>
      }
      { gameMode === GameMode.classic &&
        <p>High Score: {highScore}</p>
      }
      { gameMode !== GameMode.classic &&
        gameMode !== GameMode.bot &&
        <p>Score {p1Score} : {p2Score}</p>
      }
    </div>
  );
};

export default GameScores;