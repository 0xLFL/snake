class Pos {
  private x: number;
  private y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  getPos = () => {
    return {
      x: this.x,
      y: this.y,
    }
  }

  toString = () => {
    return `${String(this.x).padStart(3, '0')}_${String(this.y).padStart(3, '0')}`;
  }
}

export default Pos;