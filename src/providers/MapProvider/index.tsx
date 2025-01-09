'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import config from '@/app/config.json';

const {
  p1,
  p2,
  difficulty: diff
} = config;

export enum GameMode {
  classic,
  vsPlayer,
  vsBot,
  bot,
}

export enum Status {
  setup,
  init,
  pending,
  p1Win,
  p2Win,
  draw,
}

export enum PosType {
  none,
  p1,
  p2,
  bot,
  fruit,
}

export interface Pos {
  x: number,
  y: number,
}

export enum Difficulty {
  easy,
  normal,
  hard,
}

type MapContextType = {
  initMap: (width: number, height: number, gameMode: GameMode, difficulty: Difficulty) => void;
  startGame: () => void;
  gameMode: GameMode | null;
  status: Status | null;
  size: Pos | null;
  randomPos: () => Pos;
  updateStatus: (status: Status) => void;
  getChanceFromDifficalty: () => number;
  p1Ready: () => void;
  p2Ready: () => void;
  playAgain: () => void;
};

/**
 * formats a coordinate into a string
 * @returns 
 */
export const formatPos = ({ x, y }: Pos) => {
  return `${String(x).padStart(3, '0')}_${String(y).padStart(3, '0')}`
}

/**
 * Parss a coord string back into a set of coords
 * @param formattedPos  coordinate string
 * @returns 
 */
export const parsePos = (formattedPos: string): Pos => {
  const [x, y] = formattedPos.split('_').map(Number);
  return { x, y };
};

function useMapHook (): MapContextType {
  const [size, setSize] = useState<Pos | null>(null);
  const [status, setStatus] = useState<Status>(Status.setup);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);

  const [p1Ready_, setP1Ready] = useState<boolean>(false);
  const [p2Ready_, setP2Ready] = useState<boolean>(false);

  /**
   * 
   * @param width 
   * @param height 
   * @param gameMode 
   */
  const initMap = (width: number, height: number, gameMode: GameMode, difficulty: Difficulty) => {
    setSize({ x: width, y: height });
    setStatus(gameMode === GameMode.bot ? Status.setup : Status.init);
    setGameMode(gameMode);
    setDifficulty(difficulty);

    setP1Ready(gameMode === GameMode.bot);
    setP2Ready(gameMode !== GameMode.vsPlayer);
  }

  const startGame = () => {
    setStatus(Status.pending);
  }

  const p1Ready = () => {
    setP1Ready(true);
  }

  const p2Ready = () => {
    setP2Ready(true);
  }

  const playAgain = () => {
    setP1Ready(false);
    setP2Ready(gameMode !== GameMode.vsPlayer);
    setStatus(Status.init);
  }

  /**
   * Updates the games status
   * @param status the new status of the game
   */
  const updateStatus = (status: Status) => {
    setStatus(status);
  }

  const getChanceFromDifficalty = () => {
    switch (difficulty) {
      case Difficulty.easy: return diff.easy;
      case Difficulty.normal: return diff.normal;
      case Difficulty.hard: return diff.hard;
    }
  }

  /**
   * @returns A Random position within the map
   */
  const randomPos = (): Pos => {
    if (!size) {
      return {
        x: -1,
        y: -1,
      }
    }
    
    const {
      x,
      y
    } = size;

    return {
      x: Math.floor(Math.random() * x),
      y: Math.floor(Math.random() * y)
    };
  }

  useEffect(() => {
    if (p1Ready_ && p2Ready_) {
      startGame();
    }
  }, [p1Ready_, p2Ready_]);

  return {
    initMap,
    startGame,
    gameMode,
    status,
    size,
    randomPos,
    updateStatus,
    getChanceFromDifficalty,
    p1Ready,
    p2Ready,
    playAgain,
  };
}

const MapContext = createContext(null);

const useMap = (): MapContextType => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapHook must be used within a MapProvider');
  }
  return context;
};

function MapProvider ({ children }: {
  children: ReactNode;
}) {
  const hook = useMapHook();

  return <MapContext.Provider value={hook}>{children}</MapContext.Provider>;
}

export { MapProvider, useMap }
