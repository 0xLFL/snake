'use client'

import { createContext, ReactNode, useCallback, useContext, useEffect, useReducer, useState } from "react";
import { Difficulty, formatPos, GameMode, parsePos, Pos, PosType, Status, useMap } from "../MapProvider/index";
import config from '@/app/config.json';
import PriorityQueue from "@/utils/PriorityQueue/index";

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

interface SnakeState {
  positions: Pos[];
  currDir: Dir;
  nextDir: Dir;
  moveCount: number;
  posType: PosType;
  score: number;
}

interface SnakeAction {
  type: 'SET_DIRECTION' | 'MOVE_NEXT' | 'RESET' | 'INIT';
  payload?: any;
  initState?: Record<string, SnakeState>;
}

interface ItemContextProps {
  snakes: Record<string, SnakeState>;
  createSnake: (id: string, initialState: SnakeState) => void;
  getSnakePositions: (id: string | null) => Record<string, PosType> | null;
  next: () => void;
  setSnakeDir: (dir: string) => void;
  handledKeys: string[];
  eatFruit: (posString: string) => void;
  getItems: () => Record<string, PosType>;
  init: (width: number, height: number, gameMode: GameMode, difficulty?: Difficulty) => void;
  getScore: (id: string) => number | undefined,
  playAgain: () => void;
  p1Keys: string[];
  p2Keys: string[];
}

const snakeReducer = (state: Record<string, SnakeState>, action: { id: string; action: SnakeAction; }) => {
  const { id, action: snakeAction } = action;

  switch (snakeAction.type) {
    case 'SET_DIRECTION':
      return {
        ...state,
        [id]: {
          ...state[id],
          nextDir: snakeAction.payload !== state[id].currDir ? snakeAction.payload : state[id].nextDir,
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
          score: (snakeAction.payload.length - 3) * 10,
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
    randomPos,
    getChanceFromDifficalty
  } = useMap();

  const [state, dispatch] = useReducer(snakeReducer, {});
  const [fruits, setFruits] = useState<Pos[]>([]);
  const [initFlag, setInitFlag] = useState<boolean>(false);
  const p1Controlls = ['w', 's', 'a', 'd'];
  const p2Controlls = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];

  /**
   * Creates a snake
   * @param id snake id - must be unqie
   * @param initialState initial params for the snake
   */
  const createSnake = (id: string, initialState: SnakeState) => {
    dispatch({ id, action: { type: 'RESET', payload: initialState } });
  };

  /**
   * deletes a given snake
   * @param id snake id 
   */
   const deleteSnake = (id: string) => {
    dispatch({ id, action: { type: 'RESET' } });
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
  const next = useCallback((): void => {
    for (const id of Object.keys(state)) {
      if (state[id]) {
        dispatch({ id, action: { type: 'MOVE_NEXT', payload: next_(id) } });
      }
    }
  }, [state]);

  /**
   * calulates the snakes next position
   * @param id Id of the snake that should move to the next position
   * @returns Array of type Pos with that next positions of snake
   */
  const next_ = (id: string): Pos[] => {
    const snake = state[id];

    if (!size) {
      return snake.positions;
    }
  
    // keeps track of num of moves for edge case where
    // a draw should occour is both snakes move onto the same
    // square at the same time
    let move: Pos;
    if (snake.posType === PosType.bot) {
      move = useBot(id);
    } else {
      move = nextMove(snake);
    }
  
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
        snake.moveCount,
        move
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
        snake.moveCount,
        move,
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
   * Convets a Dirrection into a position vector
   * @param dir The Dirrection to be converted
   * @returns The position vector for the given Dirrection
   */
  const convertDir = (dir: Dir) => {
    const x = 0;
    const y = 0;
    if (dir === Dir.up) {
      return {
        x,
        y: -1
      };
    } else if (dir === Dir.down) {
      return {
        x,
        y: 1
      };
    } else if (dir === Dir.right) {
      return {
        x: 1,
        y
      };
    } else if (dir === Dir.left) {
      return {
        x: -1,
        y
      };
    }
  
    return { x, y };
  }

  /**
   * calulates the next position of a user controlled snake
   * @param snake Snake object if snake to thats to have their next pos calculated
   * @returns The position the head of the snake shopuld move to next
   */
  const nextMove = (snake: SnakeState): Pos => {
    const { nextDir } = snake
    const { x, y } = getSnakeHead(snake);
    const { x: xOff, y: yOff } = convertDir(nextDir);
  
    return { x: x + xOff, y: y + yOff };
  }
  
  /**
  * calulates the next position of a bot controlled snake
  * @param snake Snake object if snake to thats to have their next pos calculated
  * @returns The position the head of the snake shopuld move to next
  */
  const useBot = (id: string): Pos => {
    const snake = state[id];
    const moveChance = getChanceFromDifficalty();
    const ran =  Math.random();

    if (moveChance < ran) {
      return nextMove(snake);
    }

    const nextDir = findPath(snake);
    if (nextDir === undefined) {
      return nextMove(snake);
    }

    dispatch({ id, action: { type: 'SET_DIRECTION', payload: nextDir } });

    const { x, y } = getSnakeHead(snake);
    const { x: xOff, y: yOff } = convertDir(nextDir);

    return { x: x + xOff, y: y + yOff };
  }

  /**
   * Addaptor / manager for the snake bots
   * A* search
   * @param snake 
   * @returns 
   */
  const findPath = (snake: SnakeState): Dir | undefined => {
    const head = getSnakeHead(snake);
    const nextPos = aStar(head, getClosestFruit(head));

    if (!nextPos) {
      return;
    }
    return toDir({ x: head.x - nextPos.x, y: head.y - nextPos.y });
  }

  /**
   * Preforms an A* search for the most efficent path 
   * (run time and cost to goal) and return the next step
   * to reach the goal
   * @param start Where the path starts from
   * @param goal Where the algorithm is trying to get to
   * @returns The position that should be taken next
   */
  const aStar = (start: Pos, goal: Pos): Pos | undefined => {
    const startString = formatPos(start)
    const queue = new PriorityQueue<Pos>();

    const from: Record<string, Pos> = {};
    const cost: Record<string, number> = {
      [startString]: 0
    };

    queue.push(start, calHeuristic(cost[startString], start, goal));

    while(!queue.isEmpty()) {
      const val = queue.pop();
      if (!val) {
        return;
      }

      const {
        x,
        y,
      } = val;

      if (x === goal.x && y === goal.y) {
        return getHead(from, cost, { x, y });
      }

      const currentString = formatPos({ x, y });
      const neighbors = getNeighbor({ x, y })
      for (const neighbor of neighbors) {
        const neighborString = formatPos(neighbor);

        if ((cost[neighborString] === undefined) || (cost[neighborString] > cost[currentString])) {
          cost[neighborString] = cost[currentString] + 1;
          from[neighborString] = { x, y }

          queue.push(neighbor, calHeuristic(cost[neighborString], neighbor, goal));
        }
      }
    }
  }

  /**
   * gets the first move made by the A* search algorithm
   * @param from Map of where each node was reached from
   * @param cost Map of the cost to reach each node
   * @param pos The position to trace back from
   * @returns The first step made to reach the given position
   */
  const getHead = (from: Record<string, Pos>, cost: Record<string, number>, pos: Pos): Pos => {
    const posString = formatPos(pos);

    if (cost[posString] <= 1) {
      return pos;
    }

    return getHead(from, cost, from[posString]);
  }

  /**
   * Gets the positions around a given position
   * that are able to be move on to
   * @param pos
   * @returns The neighbours of the given postion that arn't occupied
   */
  const getNeighbor = (pos: Pos): Pos[] => {
    const neighbors: Pos[] = [];
  
    const directions = [
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 },  // right
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 },  // down
    ];
  
    for (const { dx, dy } of directions) {
      const newX = pos.x + dx;
      const newY = pos.y + dy;
  
      const posString = formatPos({ x: newX, y: newY });
      const atPos = getItems()[posString];
      const occupied = atPos !== undefined && atPos !== PosType.fruit && atPos !== PosType.none;
      if (size && newX >= 0 && newX < size.x && newY >= 0 && newY < size.y && !occupied) {
        neighbors.push({ x: newX, y: newY });
      }
    }
  
    return neighbors;
  };

  /**
   * Finds the fruit with the smallest heuristic cost
   * from a given position
   * @param pos 
   * @returns The fruit with the small heuristic
   */
  const getClosestFruit = (pos: Pos): Pos => {
    let heuristic;
    let fruit_;

    for (const fruit of fruits) {
      const newHeuristic = calHeuristic(0, pos, fruit);

      if (!heuristic || newHeuristic < heuristic) {
        fruit_ = fruit;
        heuristic = newHeuristic;
      }
    }

    if (!fruit_) {
      return {
        x: -1,
        y: -1
      }
    }

    return fruit_;
  }

  /**
   * Convets a position vector to a direction
   * @param pos Position vector
   * @returns Direction corresponding to the given position vector
   */
  const toDir = (pos: Pos): Dir => {
    if (pos.x >= 1) {
      return Dir.left;
    } else if (pos.x <= -1) {
      return Dir.right;
    } else if (pos.y >= 1) {
      return Dir.up;
    } else {
      return Dir.down;
    }
  }

  /**
   * Calulates the heuritic cost to reach a goal
   * @param cost The cost to reach the current position
   * @param pos The current position
   * @param goal The position that is trying to be reached
   * @returns The heuritic cost
   */
  const calHeuristic = (cost: number, pos: Pos, goal: Pos) => {
    return cost + Math.abs(pos.x - goal.x) + Math.abs(pos.y - goal.y);
  }

  /**
   * Set the snakes next dir prop
   * @param key the key the user has just pressed
   */
  const setSnakeDir = (key: string): void => {
    if (p1Controlls.includes(key) && state[p1.id].posType !== PosType.bot) {
      dispatch({ id: p1.id , action: { type: 'SET_DIRECTION', payload: mapKey(key) } });
    } else if (p2Controlls.includes(key)) {
      dispatch({ id: (state[p2.id] && state[p2.id].posType !== PosType.bot) ? p2.id : p1.id , action: { type: 'SET_DIRECTION', payload: mapKey(key) } });
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

    if (gameMode !== GameMode.bot) {
      createSnake(id, {
        positions: [...startPos],
        currDir: Dir.down,
        nextDir: Dir.down,
        moveCount: 0,
        posType: PosType.p1,
        score: 0,
      });
    } else {
      createSnake(id, {
        positions: [...startPos],
        currDir: Dir.down,
        nextDir: Dir.down,
        moveCount: 0,
        posType: PosType.bot,
        score: 0,
      });
    }

    return id;
  }

  /**
   * Inits player two
   * @param gameMode the selected game mode
   */
  const initP2 = (gameMode: GameMode): void => {
    const {
      startPos,
      id,
    } = p2;

    switch (gameMode) {
      case GameMode.vsPlayer:
        return createSnake(id, {
          positions: (startPos as Pos[]).map(({x, y}) => {
            return {
              x: x + (size ? size.x : 0),
              y: y + (size ? size.y : 0) - 1
            }
          }),
          currDir: Dir.up,
          nextDir: Dir.up,
          moveCount: 0,
          posType: PosType.p2,
          score: 0,
        });

      case GameMode.vsBot:
        return createSnake(id, {
          positions: (startPos as Pos[]).map(({x, y}) => {
            return {
              x: x + (size ? size.x : 0),
              y: y + (size ? size.y : 0) - 1
            }
          }),
          currDir: Dir.up,
          nextDir: Dir.up,
          moveCount: 0,
          posType: PosType.bot,
          score: 0
        });
      default: return deleteSnake(p2.id);
    }
  }

  /**
   * Inits fruits
   * @param gameMode the selected game mode
   */
  const initFruits = (gameMode: GameMode): void => {
    if (gameMode === GameMode.classic) {
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
  const init = (width: number, height: number, gameMode: GameMode, difficulty?: Difficulty): void => {
    initMap(width, height, gameMode, difficulty || Difficulty.normal);
    setInitFlag(true);
  }

  const playAgain = () => {
    setInitFlag(true);
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

    if (snake) {
      for (const pos of snake.positions) {
        map[formatPos(pos)] = snake.posType;
      }
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
  
  const getScore = (id: string): number | undefined => {
    return state[id]?.score;
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
    if (size !== null && gameMode !== null && initFlag) {
      initP1(gameMode);
      initP2(gameMode);
      initFruits(gameMode);
      setInitFlag(false)
    }
  }, [size, gameMode, state, initFlag]);

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
    p1Keys: p1Controlls,
    p2Keys: p2Controlls,
    getItems,
    eatFruit,
    init,
    getScore,
    playAgain,
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
