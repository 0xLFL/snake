import { useGameSetup } from '@/providers/GameSetupProvider/index';
import React from 'react';
import Button from '@mui/material/Button';

const HomeOverlay = () => {
  const {
    toSelectMode
  } = useGameSetup();
  return (
    <div className='game-home-container large'>
      <h1 className='game-home-title'>Snake</h1>
      <Button className='game-setup-button' variant="outlined" size='large' onClick={toSelectMode}>
        Play Now
      </Button>
    </div>
  )
}

export default HomeOverlay;
