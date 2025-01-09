'use client';

import React from 'react';
import Image from 'next/image'
import { GameMode, useMap } from '@/providers/MapProvider/index';

const StartGameInfo = () => {
  const {
    gameMode,
    p1Ready_,
    p2Ready_
  } = useMap();

  return (
    <div className='start-info-container'>
      <div className={`start-details-container ${p1Ready_ ? 'ready' : ''}`}>
        <Image
          className='start-info-img'
          src={`/p1Keys.svg`}
          alt='Image of W, A, S and D keys'
          width="250"
          height="250"
        />
        <p>
          {
            gameMode === GameMode.vsPlayer ? 
            'Player 1 p' : 'P'
          }
          ress a key to start
        </p>
      </div>

    { gameMode === GameMode.vsPlayer &&
      <div className={`start-details-container ${p2Ready_ ? 'ready' : ''}`}>
        <Image
          className='start-info-img'
          src={'/p2Keys.svg'}
          alt='Image of the arrow keys'
          width="250"
          height="250"
        />
        <p>Player 2 press a key to start</p>
      </div>
    }
    </div>
  )
}

export default StartGameInfo;