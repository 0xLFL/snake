'use client';

import { GameProvider } from './GameProvider/index';
import React, { ReactNode, FC } from 'react';
import { MapProvider } from './MapProvider/index';
import { ItemProvider } from './ItemProvider/index';
import { GameSetupProvider } from './GameSetupProvider/index';

// Define UseProviders properly as a functional component
const Providers: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MapProvider>
      <ItemProvider>
        <GameProvider>
          <GameSetupProvider>
              {children}
          </GameSetupProvider>
        </GameProvider>
      </ItemProvider>
    </MapProvider>
  );
};

export default Providers;
