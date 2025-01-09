'use client';

import { GameMode, Status, useMap } from '@/providers/MapProvider/index';
import React, { useState } from 'react';
import HomeOverlay from '../HomeOverlay/index';
import SelectDifficulty from '../SelectDifficulty/index';
import SelectGameMode from '../SelectGameMode/index';
import GameOver from '../GameOver/index';
import './index.css';
import StartGameInfo from '../StartGameInfo/index';
import { Page, useGameSetup } from '@/providers/GameSetupProvider/index';

const Overlay = () => {
  const {
    status,
    gameMode
  } = useMap();
  const {
    page
  } = useGameSetup();

  const gameOver = status === Status.p1Win || status === Status.p2Win || status === Status.draw;
  const startInfo = status === Status.init || status === Status.pending
  const hidePage = (gameOver || startInfo) && gameMode !== GameMode.bot;
  return (
    <div className={`overlay-container`}>
      { page === Page.home &&
        !hidePage &&
        <HomeOverlay />
      }
      { page === Page.selectMode &&
        !hidePage &&
        <SelectGameMode />
      }
      { page === Page.selectDifficaulty &&
        !hidePage &&
        <SelectDifficulty />
      }
      { startInfo &&
        gameMode !== GameMode.bot &&
        <StartGameInfo />
      }

      { gameOver &&
        gameMode !== GameMode.bot &&
        <GameOver />
      }
    </div>
  );
};

export default Overlay;
