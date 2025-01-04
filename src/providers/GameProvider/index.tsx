'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { GameMode, PosType, Status, useMap } from '../MapProvider/index';
import { useItem } from '../ItemProvider/index';
import config from '@/app/config.json';

const {
  p1
} = config;

type GameContextType = {
  initGame: (gameMode: GameMode) => void;
  width: number | undefined,
  height: number | undefined,
  items: Record<string, PosType> | undefined;
  highScore: number,
  score: number,
};

function useGameHook (): GameContextType {
  const {
    size,
    status,
    gameMode,
  } = useMap();
  const {
    handledKeys,
    setSnakeDir,
    next,
    init,
    getItems,
    snakes,
    getScore,
  } = useItem();

  /**
   * Initialises a game of snake
   */
  const initGame = (gameMode: GameMode) => {
    init(20, 20, gameMode);
  }

  const next_ = () => {
    for (const id of Object.keys(snakes)) {
      next(id);
    }
  }

  // listener for user input
  useEffect(() => {
    const setDir = (event: KeyboardEvent) => {
      if (status !== Status.pending) {
        return;
      }

      if (handledKeys.includes(event.key)) {
        event.preventDefault();
        setSnakeDir(event.key);
      }
    };

    document.addEventListener('keydown', setDir);

    const nextInterval = setInterval(() => {
      if (status === Status.pending) {
        next_();
      }
    }, 100);
    return () => {
      document.removeEventListener('keydown', setDir);
      clearInterval(nextInterval);
    };
  }, [status, snakes, next_]);

  useEffect(() => {
    if (status === Status.draw) {
      window.alert('Game drawn')
    } else if (status === Status.p1Win) {
      window.alert('Player 1 Wins')
    } else if (status === Status.p2Win) {
      window.alert('Player 2 Wins')
    }
  }, [status])

  useEffect(() => {
    const highScore = parseInt(localStorage.getItem(`high_score_${gameMode}`) || '0');
    const score = getScore(p1.id) || 0;
    if (score > highScore) {
      localStorage.setItem(`high_score_${gameMode}`, score.toString());
    }
  }, [getScore(p1.id)]);

  return {
    initGame,
    width: size?.x,
    height: size?.y,
    items: getItems(),
    highScore: parseInt(localStorage.getItem(`high_score_${gameMode}`) || '0'),
    score: getScore(p1.id) || 0,
  };
}

const GameContext = createContext(null);

const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameHook must be used within a GameProvider');
  }
  return context;
};

function GameProvider ({ children }: {
  children: ReactNode;
}) {
  const hook = useGameHook();

  return <GameContext.Provider value={hook}>{children}</GameContext.Provider>;
}

export { GameProvider, useGame }
