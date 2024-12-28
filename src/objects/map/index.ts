import Pos from "../pos/index";

interface Snake {
  // placeholder for until Snake object is compleated
  snakeName: string,
  getPosMap: () => Record<string, boolean>,
  next: () => void,
}

enum GameMode {
  classic,
  vsPlayer,
  vsBot
}

enum Status {
  pending,
  p1Win,
  p2Win,
}

class map {
  private fruits: Pos[];
  private player1: Snake;
  private player2: Snake | null;
  private size: Pos;
  private status: Status;

  constructor(width: number, height: number, gameMode: GameMode) {
    this.size = new Pos(width, height);
    this.player1 = this.initP1(gameMode);
    this.player2 = this.initP2(gameMode);
    this.fruits = this.initFruits(gameMode);
    this.status = Status.pending;
  }

  public getP1 = () => {
    return this.player1;
  }

  public getP2 = () => {
    return this.player2;
  }

  public getFruits = () => {
    return this.fruits;
  }

  public getSize = () => {
    return this.size;
  }

  public getStatus = () => {
    return this.status;
  }

  private setStatus = (status: Status) => {
    this.status = status;
  }

  private initP1 = (gameMode: GameMode): Snake => {
    //return new Snake();
    return {
      snakeName: 'bob',
      getPosMap: () => {
        return {}
      },
      next: () => {}
    }
  }

  private initP2 = (gameMode: GameMode): Snake | null => {
    //return new Snake();
    return null;
  }

  private initFruits = (gameMode: GameMode) => {
    if (gameMode === GameMode.classic) {
       return [
        this.getFreePos()
      ]
    }

    // 2 fruits if vs mode
    return [
      this.getFreePos(),
      this.getFreePos()
    ]
  }

  public getFreePos = (): Pos => {
    let map = this.player1.getPosMap();

    if (this.player2) {
      map = {
        ...map,
        ...this.player2.getPosMap(),
      }
    }

    for (const fruit of this.fruits) {
      map[this.fruits.toString()] = true;
    }

    let pos = this.randomPos();
    while(map[pos.toString()]) {
      pos = this.randomPos();
    }

    return pos;
  }

  public randomPos = (): Pos => {
    const {
      x,
      y
    } = this.size.getPos();

    return new Pos(Math.floor(Math.random() * x), Math.floor(Math.random() * y));
  }

  public next = (): void => {
    if (this.status !== Status.pending) {
      return;
    }

    const p1 = this.getP1();
    const p2 = this.getP2();

    p1.next();
    if (p2) {
      p2.next();
    }
  }

  public eatFruit = (posString: string) => {
    const fruits =  this.getFruits();
    for (let i = 0; i < fruits.length; i++) {
      if (fruits[i].toString() === posString) {
        fruits[i] = this.getFreePos();
        break;
      }
    }
  }

  public reportDeath = (playerId: number) => {
    if (playerId === 1) {
      this.setStatus(Status.p2Win);
    } else if (playerId === 2) {
      this.setStatus(Status.p1Win);
    }
  }
}

export default map;
