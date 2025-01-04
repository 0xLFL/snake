'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { GameMode, PosType, Status, useMap } from '../MapProvider/index';
import { useItem } from '../ItemProvider/index';

type GameContextType = {
  initGame: (gameMode: GameMode) => void;
  width: number | undefined,
  height: number | undefined,
  items: Record<string, PosType> | undefined;
};

function useGameHook (): GameContextType {
  const {
    size,
    status
  } = useMap();
  const {
    handledKeys,
    setSnakeDir,
    next,
    init,
    getItems,
    snakes,
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

  return {
    initGame,
    width: size?.x,
    height: size?.y,
    items: getItems(),
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
