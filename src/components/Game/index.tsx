'use client';

import React from 'react';
import { useGame } from '@/providers/GameProvider/index';
import { GameMode, PosType } from '@/providers/MapProvider/index';
import './index.css';
import GameScores from '../GameScores/index';

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
        let className;
        switch (items[`${String(j).padStart(3, '0')}_${String(i).padStart(3, '0')}`]) {
          case PosType.bot:
            className = 'bot';
            break;
          case PosType.fruit:
            className = 'fruit';
            break;
          case PosType.p1:
            className = 'p1';
            break;
          case PosType.p2:
            className = 'p2';
            break;
          default:
            className = 'empty';
        }

        squares.push(
          <div
            key={`${j}_${i}`} // Unique key for each square
            className={`game-square ${className}`}
          />
        );
      }
    }

    return squares;
  };

  return (
    <div>
      <button onClick={() => initGame(GameMode.classic)}>Init classic</button>
      <button onClick={() => initGame(GameMode.vsPlayer)}>Init vs</button>
      <button onClick={() => initGame(GameMode.vsBot)}>Init vs Bot</button>
      <div>
        <GameScores />
        <div
          className='game-board'
          style={{
            gridTemplateColumns: `repeat(${width}, 1fr)`, // Dynamically set the grid columns
            gridTemplateRows: `repeat(${height}, 1fr)`, // Dynamically set the grid rows
          }}
        >
          {GenSquares()}
        </div>
      </div>
    </div>
  );
};

export default Game;
