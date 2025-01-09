'use client'
import { useGame } from '@/providers/GameProvider/index';
import { useGameSetup } from '@/providers/GameSetupProvider/index';
import { GameMode } from '@/providers/MapProvider/index';
import React from 'react';
import Button from '@mui/material/Button';

const SelectGameMode = () => {
  const {
    initGame,
  } = useGame();
  const {
    toSelectDiff
  } = useGameSetup();

  return (
    <div className='game-home-container'>
      <h2 className='setup-label'>Select your game mode</h2>
      <div className='game-setup-button-container'>
        <Button 
          className='game-setup-button'
          variant="outlined"
          size='large'
          onClick={
            () => initGame(GameMode.classic)
          }
        >
          Classic
        </Button>
        <Button 
          className='game-setup-button'
          variant="outlined"
          size='large'
          onClick={
            () => initGame(GameMode.vsPlayer)
          }
        >
          2 Player
        </Button>
        <Button 
          className='game-setup-button'
          variant="outlined"
          size='large'
          onClick={
            () => toSelectDiff()
          }
        >
          Vs Bot
        </Button>
      </div>
    </div>
  )
}

export default SelectGameMode;