'use client';

import React, { createContext, ReactNode, useContext, useState } from 'react';
import { useGame } from '../GameProvider/index';
import { Status, useMap } from '../MapProvider/index';

export enum Page {
  home,
  selectMode,
  selectDifficaulty
}

type SetupContextType = {
  page: Page;
  toHome: () => void;
  toSelectMode: () => void;
  toSelectDiff: () => void;
};

function useSetupHook (): SetupContextType {
  const {
    status
  } = useMap();
  const {
    restartBot
  } = useGame();
  const [page, setPage] = useState<Page>(Page.home);

  const toHome = () => {
    if (status !== Status.setup) {
      restartBot();
    }
    setPage(Page.home);
  }

  const toSelectMode = () => {
    if (status !== Status.setup) {
      restartBot();
    }
    setPage(Page.selectMode);
  }

  const toSelectDiff = () => {
    if (status !== Status.setup) {
      restartBot();
    }
    setPage(Page.selectDifficaulty);
  }
  
  return {
    page,
    toHome,
    toSelectMode,
    toSelectDiff,
  };
}

const SetupContext = createContext<SetupContextType | null>(null);

const useGameSetup = (): SetupContextType => {
  const context = useContext(SetupContext);
  if (!context) {
    throw new Error('useMapHook must be used within a MapProvider');
  }
  return context;
};

function GameSetupProvider ({ children }: {
  children: ReactNode;
}) {
  const hook = useSetupHook();

  return <SetupContext.Provider value={hook}>{children}</SetupContext.Provider>;
}

export { GameSetupProvider, useGameSetup }
