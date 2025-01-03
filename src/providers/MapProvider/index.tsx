'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import config from '@/app/config.json';

const {
  p1,
  p2
} = config;

export enum GameMode {
  classic,
  vsPlayer,
  vsBot
}

export enum Status {
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

type MapContextType = {
  initMap: (width: number, height: number, gameMode: GameMode) => void;
  gameMode: GameMode | null;
  status: Status | null;
  size: Pos | null;
  randomPos: () => Pos;
  updateStatus: (status: Status) => void;
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
  const [status, setStatus] = useState<Status | null>(null);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);

  /**
   * 
   * @param width 
   * @param height 
   * @param gameMode 
   */
  const initMap = (width: number, height: number, gameMode: GameMode) => {
    setSize({ x: width, y: height });
    setStatus(Status.pending);
    setGameMode(gameMode);
  }

  /**
   * Updates the games status
   * @param status the new status of the game
   */
  const updateStatus = (status: Status) => {
    setStatus(status);
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

  return {
    initMap,
    gameMode,
    status,
    size,
    randomPos,
    updateStatus,
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
