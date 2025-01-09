import { useGame } from '@/providers/GameProvider/index';
import { Difficulty, GameMode } from '@/providers/MapProvider/index';
import React from 'react';
import Button from '@mui/material/Button';

const SelectDifficulty = () => {
  const {
    initGame,
  } = useGame();

  return (
    <div className='game-home-container'>
      <h2 className='setup-label'>Select your game mode</h2>
      <div className='game-setup-button-container'>
        <Button
          className='game-setup-button'
          variant="outlined"
          size='large'
          onClick={
            () => initGame(GameMode.vsBot, Difficulty.easy)
          }
        >
          Easy
        </Button>
        <Button
          className='game-setup-button'
          variant="outlined"
          size='large'
          onClick={
            () => initGame(GameMode.vsBot, Difficulty.normal)
          }
        >
          Normal
        </Button>
        <Button 
          className='game-setup-button'
          variant="outlined"
          size='large'
          onClick={
            () => initGame(GameMode.vsBot, Difficulty.hard)
          }
        >
          Hard
        </Button>
      </div>
    </div>
  )
}

export default SelectDifficulty;
