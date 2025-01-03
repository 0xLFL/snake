import { createContext, ReactNode, useContext, useEffect, useReducer, useState } from "react";
import { formatPos, GameMode, parsePos, Pos, PosType, Status, useMap } from "../MapProvider/index";
import config from '@/app/config.json';

const {
  p1,
  p2
} = config;

export enum Dir {
  up,
  right,
  down,
  left,
}

export enum PlayerType {
  user,
  bot
}

export enum Difficulty {
  easy,
  normal,
  hard,
}

interface SnakeState {
  positions: Pos[];
  currDir: Dir;
  nextDir: Dir;
  moveCount: number;
  posType: PosType;
}

interface SnakeAction {
  type: 'SET_DIRECTION' | 'MOVE_NEXT' | 'RESET';
  payload?: any;
}

interface ItemContextProps {
  snakes: Record<string, SnakeState>;
  createSnake: (id: string, initialState: SnakeState) => void;
  getSnakePositions: (id: string | null) => Record<string, PosType> | null;
  next: (id: string) => void;
  setSnakeDir: (dir: string) => void;
  handledKeys: string[];
  eatFruit: (posString: string) => void;
  getItems: () => Record<string, PosType>;
  init: (width: number, height: number, gameMode: GameMode) => void;
}

// Methods for editing the data in each snake
const snakeReducer = (state: Record<string, SnakeState>, action: { id: string; action: SnakeAction }) => {
  const { id, action: snakeAction } = action;

  switch (snakeAction.type) {
    case 'SET_DIRECTION':
      return {
        ...state,
        [id]: {
          ...state[id],
          nextDir: snakeAction.payload,
        },
      };
    case 'MOVE_NEXT': {
      const snake = state[id];

      return {
        ...state,
        [id]: {
          ...snake,
          positions: snakeAction.payload,
          currDir: snake.nextDir,
          moveCount: snake.moveCount + 1,
        },
      };
    }
    case 'RESET':
      return {
        ...state,
        [id]: snakeAction.payload,
      };
    default:
      return state;
  }
};

const useItemHook = (): ItemContextProps => {
  const {
    initMap,
    size,
    gameMode,
    updateStatus,
    randomPos
  } = useMap();

  const [state, dispatch] = useReducer(snakeReducer, {});
  const [fruits, setFruits] = useState<Pos[]>([]);
  const p1Controlls = ['w', 's', 'a', 'd'];
  const p2Controlls = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  /**
   * Creates a snake
   * @param id snake id - must be unqie
   * @param initialState initial params for the snake
   */
  const createSnake = (id: string, initialState: SnakeState) => {
    if (state[id]) {
      return;
    }

    dispatch({ id, action: { type: 'RESET', payload: initialState } });
  };


  /**
   * Creates a map of the given stakes current positions
   * Different to getPosMap which is private
   * @param snake snake you want the position map of
   * @returns position map of the given snake
   */
  const getSnakePositions = (id: string | null): Record<string, PosType> | null => {
    if (!id) {
      return null;
    }
    
    const snake = state[id];
    if (!snake) {
      return null;
    }

    return getPosMap(snake);
  };

  /**
   * moves the snake to their next position
   * @param id id of the snake that should move to the next position
   */
  const next = (id: string): void => {
    dispatch({ id, action: { type: 'MOVE_NEXT', payload: next_(id) } });
  };

  /**
   * calulates the snakes next position
   * @param id id of the snake that should move to the next position
   * @returns Array of type Pos with that next positions of snake
   */
  const next_ = (id: string): Pos[] => {
    const snake = state[id];
    console.log(snake, id);
  
    if (!size) {
      return snake.positions;
    }
  
    // keeps track of num of moves for edge case where
    // a draw should occour is both snakes move onto the same
    // square at the same time
    let move: Pos;
    if (snake.posType === PosType.bot) {
      move = useBot(snake);
    } else {
      move = nextMove(snake);
    }

    console.log(move)
  
    const {
      x,
      y
    } = move;
    const {
      x: width,
      y: height
    } = size;
    if (x < 0 || x >= width || y < 0 || y >= height) {
      reportContact(
        id,
        move,
        snake.moveCount
      );
      
      return snake.positions;
    }
  
    const moveString = formatPos(move);
    const map = getItems();
    const atPos = map[moveString];
  
    const positions = snake.positions;
    if (atPos === PosType.fruit) {
      positions.push(move);
  
      eatFruit(moveString);
      return positions;
    } else if (atPos !== undefined && atPos !== PosType.none) {
      reportContact(
        id,
        move,
        snake.moveCount
      );
  
      return positions;
    } else {
      for (let i = 0; i < positions.length - 1; i++) {
        positions[i] = positions[i + 1];
      }
  
      positions[positions.length - 1] = move;
      return positions;
    }
  }

  /**
   * calulates the next position of a user controlled snake
   * @param snake Snake object if snake to thats to have their next pos calculated
   * @returns The position the head of the snake shopuld move to next
   */
  const nextMove = (snake: SnakeState): Pos => {
    const { positions, nextDir } = snake
    const { x, y } = positions[positions.length - 1];
  
    if (nextDir === Dir.up) {
      return {
        x,
        y: y - 1
      };
    } else if (nextDir === Dir.down) {
      return {
        x,
        y: y + 1
      };
    } else if (nextDir === Dir.right) {
      return {
        x: x + 1,
        y
      };
    } else if (nextDir === Dir.left) {
      return {
        x: x - 1,
        y
      };
    }
  
    return { x, y };
  }
  
  /**
  * calulates the next position of a bot controlled snake
  * @param snake Snake object if snake to thats to have their next pos calculated
  * @returns The position the head of the snake shopuld move to next
  */
  const useBot = (snake: SnakeState): Pos => {
    /* TODO */
    return nextMove(snake);
  }

  /**
   * Set the snakes next dir prop
   * @param key the key the user has just pressed
   */
  const setSnakeDir = (key: string): void => {
    if (p1Controlls.includes(key)) {
      dispatch({ id: p1.id , action: { type: 'SET_DIRECTION', payload: mapKey(key) } });
      console.log(state)
    } else if (p2Controlls.includes(key)) {
      dispatch({ id: state[p2.id] ? p2.id : p1.id , action: { type: 'SET_DIRECTION', payload: mapKey(key) } });
    }
  }

  /**
   * Converts a user key input to a Dir enum element
   * @param key the key the user has just pressed
   * @returns type Dir, in the dirrection corasponding to the given key
   */
  const mapKey = (key: string): Dir | undefined => {
    if (key === 'w' || key === 'ArrowUp') {
      return Dir.up;
    } else if (key === 's' || key === 'ArrowDown') {
      return Dir.down;
    } else if (key === 'a' || key === 'ArrowLeft') {
      return Dir.left;
    } else if (key === 'd' || key === 'ArrowRight') {
      return Dir.right;
    }
  }

  /**
   * Inits player one
   * @param gameMode the selected game mode
   */
  const initP1 = (gameMode: GameMode): string => {
    const {
      startPos,
      id,
    } = p1;

    createSnake(id, {
      positions: startPos,
      currDir: Dir.down,
      nextDir: Dir.down,
      moveCount: 0,
      posType: PosType.p1
    });

    return id;
  }

  /**
   * Inits player two
   * @param gameMode the selected game mode
   */
  const initP2 = (gameMode: GameMode): string | null => {
    //return new Snake();
    return null;
  }

  /**
   * Inits fruits
   * @param gameMode the selected game mode
   */
  const initFruits = (gameMode: GameMode): void => {
    if (gameMode === GameMode.classic) {
      console.log(getFreePos())
      return setFruits([
        getFreePos()
      ]);
    }

    // 2 fruits if vs mode
    const pos1 = getFreePos();
    let pos2 = getFreePos();

    // ensures they are different
    while(pos1 === pos2) {
      pos2 = getFreePos();
    }
    setFruits([
      pos1,
      pos2
    ]);
  }

  /**
   * Inits a game of snake
   * @param width number of squares wide the game should be
   * @param height number of squars height the game should be
   * @param gameMode type of game that is being played
   */
  const init = (width: number, height: number, gameMode: GameMode): void => {
    initMap(width, height, gameMode);
  }

  /**
   * Finds a positon in the map that is free of any items
   * @returns Pos, that currently doesn't currently have any items in at pos 
   */
  const getFreePos = (): Pos => {
    let map = getItems();

    let pos = randomPos();
    while(map[formatPos(pos)]) {
      pos = randomPos();
    }

    return pos;
  }

  /**
   * Creates a map of the given stakes current positions
   * @param snake snake you want the position map of
   * @returns position map of the given snake
   */
  const getPosMap = (snake: SnakeState): Record<string, PosType> => {
    const map: Record<string, PosType> = {};
    for (const pos of snake.positions) {
      map[formatPos(pos)] = snake.posType;
    }

    return map;
  }

  /**
   * removes the eaten fruit and replaces it with a new one
   * @param posString the position string of the fruit that been eaten
   */
  const eatFruit = (posString: string) => {
    const { x, y } = parsePos(posString);
    const fruitIndex = fruits.findIndex(fruit => fruit.x === x && fruit.y === y);

    if (fruitIndex !== -1) {
      // Replace the matched fruit with a new one
      const newFruit = getFreePos();

      setFruits(prevFruits => {
        const updatedFruits = [...prevFruits];
        updatedFruits.splice(fruitIndex, 1, newFruit); // Replace the fruit at the matching index
        return updatedFruits;
      });
    }
  }

  /**
   * finds the snake at a given position
   * @param snake 
   * @param posString position string
   * @returns { boolean } if snake is a pos
   */
  const snakeAt = (snake: SnakeState, posString: string): boolean => {
    if (!snake) {
      return false;
    }

    for (const position of snake.positions) {
      if (formatPos(position) === posString) {
        return true;
      }
    }

    return false;
  }

  /**
   * finds out if there is a snake a given position
   * @param posString positon that we want to know what is at
   * @param id_ id of snake that should be ignored
   * @returns snake at a given position if it exists
   */
  const getSnakeAt = (posString: string, id_?: string): SnakeState | null => {
    for (const id of Object.keys(state)) {
      if (id !== id_ && snakeAt(state[id], posString)) {
        return state[id]
      }
    }

    return null;
  }

  /**
   * get the head of a given snake
   * @param snake the snake you want the head of
   * @returns position of the snakes head
   */
  const getSnakeHead = ({ positions }: SnakeState) => {
    return positions[positions.length - 1];
  }

  /**
   * creates a map of all the items on the board
   * @returns A map of all the items on the board
   */
  const getItems = (): Record<string, PosType> => {
    let map: Record<string, PosType> = {};

    for (const snake of Object.values(state)) {
      map = {
        ...map,
        ...getPosMap(snake)
      }
    }

    if (fruits) {
      for (const fruit of fruits) {
        map[formatPos(fruit)] = PosType.fruit;
      }
    }

    return map;
  }

  /**
   * sets the status of the game based off what
   * part of the snake snake contact is made with
   * @param id id of the snake that has made contact
   * @param moveCount move count of the move that has
   * made contact with the other snake
   * @param posString position of where snake has been made
   */
  const reportContact = (id: string, moveCount: number, posString: string) => {
    const contactedSnake = getSnakeAt(posString, id);
    
    if (
      contactedSnake &&
      contactedSnake.moveCount === moveCount &&
      formatPos(getSnakeHead(contactedSnake)) === posString
    ) {
      updateStatus(Status.draw);
    } else if (id === p1.id) {
      updateStatus(Status.p2Win);
    } else {
      updateStatus(Status.p1Win);
    }
  }

  useEffect(() => {
    if (size !== null && gameMode !== null) {
      initP1(gameMode);
      initP2(gameMode);
      initFruits(gameMode);
    }
  }, [size, gameMode]);

  return {
    snakes: state,
    createSnake,
    getSnakePositions,
    next,
    setSnakeDir,
    handledKeys: [
      ...p1Controlls,
      ...p2Controlls
    ],
    getItems,
    eatFruit,
    init
  }
}

const ItemContext = createContext<ItemContextProps | null>(null);

export const useItem = () => {
  const context = useContext(ItemContext);
  if (!context) {
    throw new Error('useItem must be used within a ItemProvider');
  }
  return context;
};

export const ItemProvider = ({ children }: { children: ReactNode }) => {
  const hook = useItemHook();

  return (
    <ItemContext.Provider value={hook}>
      {children}
    </ItemContext.Provider>
  );
};
