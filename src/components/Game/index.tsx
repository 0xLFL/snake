'use client';

import React from 'react';
import { GameMode, PosType } from '@/objects/map/index';
import { useGame } from '@/providers/GameProvider/index';

const Game = () => {
  const {
    width,
    height,
    items,
    initGame
  } = useGame();

  const GenSquares = () => {
    if (!height || !width || !items) {
      return null;
    }

    const squares = [];
    for (let i = 0; i < height; i++) {
      for (let j = 0; j < width; j++) {
        let color;
        switch (items[`${String(j).padStart(3, '0')}_${String(i).padStart(3, '0')}`]) {
          case PosType.bot:
            color = 'var(--bot-square)';
            break;
          case PosType.fruit:
            color = 'var(--fruit-square)';
            break;
          case PosType.p1:
            color = 'var(--p1-square)';
            break;
          case PosType.p2:
            color = 'var(--p2-square)';
            break;
          default:
            color = 'var(--empty-square)';
        }

        squares.push(
          <div
            key={`${j}_${i}`} // Unique key for each square
            style={{
              backgroundColor: color,
              width: '100%', 
              height: '100%',
            }}
          />
        );
      }
    }

    return squares;
  };

  return (
    <div>
      <button onClick={() => initGame(GameMode.classic)}>Init classic</button>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, 1fr)`, // Dynamically set the grid columns
          gridTemplateRows: `repeat(${height}, 1fr)`, // Dynamically set the grid rows
          width: '100%',
          height: '100%',
          minWidth: '60vw',
          minHeight: '60vw'
        }}
      >
        {GenSquares()}
      </div>
    </div>
  );
};

export default Game;
