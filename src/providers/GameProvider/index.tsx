"use client";

import React, { createContext, ReactNode, useContext, useEffect, useCallback } from 'react';
import { Difficulty, GameMode, PosType, Status, useMap } from '../MapProvider/index';
import { useItem } from '../ItemProvider/index';
import config from '@/app/config.json';

const {
  p1
} = config;

type GameContextType = {
  initGame: (gameMode: GameMode, difficulty?: Difficulty) => void;
  playAgain: () => void;
  width: number | undefined,
  height: number | undefined,
  items: Record<string, PosType> | undefined;
  highScore: number;
  score: number;
  restartBot: (delay?: boolean) => void;
};

function useGameHook (): GameContextType {
  const {
    size,
    status,
    gameMode,
    playAgain: playAgainMap,
    p1Ready,
    p2Ready,
    updateStatus,
  } = useMap();
  const {
    handledKeys,
    setSnakeDir,
    next,
    init,
    getItems,
    getScore,
    playAgain: playAgainItems,
    p1Keys,
    p2Keys,
  } = useItem();

  /**
   * Initialises a game of snake
   */
  const initGame = (gameMode: GameMode, difficulty?: Difficulty) => {
    init(20, 20, gameMode, difficulty);
  }

  const playAgain = () => {
    playAgainMap();
    playAgainItems();
  }

  const setDir = useCallback(
    (event: KeyboardEvent) => {
      if (status === Status.init) {
        if (p1Keys.includes(event.key)) {
          p1Ready();
        } else if (p2Keys.includes(event.key)) {
          p2Ready()
        }
      } else if (status !== Status.pending) {
        return;
      } 

      if (handledKeys.includes(event.key)) {
        event.preventDefault();
        setSnakeDir(event.key); // Update direction
      }
    },
    [status, handledKeys]
  )

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const restartBot = async (delay_?: boolean) => {
    if (delay_) {
      await delay(1500);
    }
    init(20, 20, GameMode.bot, Difficulty.easy);
    updateStatus(Status.setup);
  }

  useEffect(() => {
    document.addEventListener("keydown", setDir);
    return () => {
      document.removeEventListener("keydown", setDir);
    };
  }, [setDir]);

  useEffect(() => {
    if (status !== Status.pending && status !== Status.setup) {
      return;
    }

    const interval = setInterval(() => {
      next();
    }, 100);

    return () => clearInterval(interval);
  }, [status, next]);

  useEffect(() => {
    if (status === Status.setup) {
      restartBot()
      updateStatus(Status.setup);
    }
  }, [])

  useEffect(() => {
    if (status === Status.p2Win && gameMode === GameMode.bot) {
      restartBot(true)
    }
  }, [status, gameMode, restartBot])

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
    playAgain,
    restartBot,
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
