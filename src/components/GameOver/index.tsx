'use client'

import React from 'react';
import { useGame } from '@/providers/GameProvider/index';
import { useGameSetup } from '@/providers/GameSetupProvider/index';
import Button from '@mui/material/Button';
import { GameMode, Status, useMap } from '@/providers/MapProvider/index';

const GameOver = () => {
  const {
    playAgain,
    score,
    highScore,
  } = useGame();
  const {
    toHome,
    toSelectMode,
  } = useGameSetup();
  const {
    gameMode,
    status,
  } = useMap();

  let winnerMessage = `Your score: ${score}`;
  if (score > highScore) {
    winnerMessage += ', thats a new high score!'
  }

  if (gameMode === GameMode.vsBot) {
    switch(status) {
      case Status.draw:
        winnerMessage = 'Game Drawn, so close better luck next time';
        break;
      case Status.p1Win:
        winnerMessage = 'You Win, congratulations, now do it again';
        break;
      case Status.p2Win:
        winnerMessage = 'You Lose, better luck next time';
        break;
    }
  }

  if (gameMode === GameMode.vsPlayer) {
    switch(status) {
      case Status.draw:
        winnerMessage = "Game Drawn, you'll get them next time";
        break;
      case Status.p1Win:
        winnerMessage = 'Player 1 Wins, congratulations, I knew you could do it';
        break;
      case Status.p2Win:
        winnerMessage = 'Player 2 Wins, congratulations, I knew you could do it';
        break;
    }
  }


  return (
    <div className='game-home-container'>
      <h2 className='setup-label large'>Game Over</h2>
      <h2 className='setup-label large'>{winnerMessage}</h2>
      <div className='game-setup-button-container'>
        <Button className='game-setup-button' variant="outlined" size='large' onClick={toHome}>
          Return Home
        </Button>
        <Button className='game-setup-button' variant="outlined" size='large' onClick={playAgain}>
          Play Again
        </Button>
        <Button className='game-setup-button' variant="outlined" size='large' onClick={toSelectMode}>
          Change Mode
        </Button>
      </div>
    </div>
  )
}

export default GameOver;
