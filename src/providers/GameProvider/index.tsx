'use client';

import { GameMode, PosType } from '@/objects/map/index';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Status, useMap } from '../MapProvider/index';
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

  // listener for user input
  useEffect(() => {
    const setDir = (event: KeyboardEvent) => {
      if (status !== Status.pending) {
        return;
      }

      if (handledKeys.includes(event.key)) {
        event.preventDefault();
        setSnakeDir(event.key);
      } else if (event.key === ' ') {
        /** For testing */
        event.preventDefault();
        for (const id of Object.keys(snakes)) {
          next(id);
        }
      }
    };

    document.addEventListener('keydown', setDir);
    return () => {
      document.removeEventListener('keydown', setDir);
    };
  }, [status, snakes]);

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
