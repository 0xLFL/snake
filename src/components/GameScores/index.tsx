'use client';

import { useGame } from '@/providers/GameProvider/index';
import React from 'react';

const GameScores = () => {
  const {
    score,
    highScore
  } = useGame();

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}
    >
      <p>Score: {score}</p>
      <p>High Score: {highScore}</p>
    </div>
  );
};

export default GameScores;