

export default class PriorityQueue<T> {
  private heap: { priority: number; value: T }[];

  constructor() {
    this.heap = [];
  }

  public push(value: T, priority: number): void {
    const node = { value, priority };
    this.heap.push(node);
    this.bubbleUp();
  }

  public pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    if (this.heap.length === 1) return this.heap.pop()?.value;

    const root = this.heap[0].value;
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown();
    return root;
  }

  // Checks if the queue is empty
  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  // Gets the highest-priority element without removing it
  public peek(): T | undefined {
    return this.isEmpty() ? undefined : this.heap[0].value;
  }

  private bubbleUp(): void {
    let index = this.heap.length - 1;
    const element = this.heap[index];

    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      const parent = this.heap[parentIndex];

      if (element.priority >= parent.priority) {
        break;
      }

      this.heap[index] = parent;
      this.heap[parentIndex] = element;
      index = parentIndex;
    }
  }

  private bubbleDown(): void {
    let index = 0;
    const length = this.heap.length;
    const element = this.heap[0];

    while (true) {
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;
      let leftChild: { priority: number; value: T } | undefined;
      let rightChild: { priority: number; value: T } | undefined;
      let swap = null;

      if (leftChildIndex < length) {
        leftChild = this.heap[leftChildIndex];
        if (leftChild.priority < element.priority) {
          swap = leftChildIndex;
        }
      }

      if (rightChildIndex < length) {
        rightChild = this.heap[rightChildIndex];
        if (
          (swap === null && rightChild.priority < element.priority) ||
          (swap !== null && rightChild.priority < leftChild!.priority)
        ) {
          swap = rightChildIndex;
        }
      }

      if (swap === null) {
        break;
      }

      this.heap[index] = this.heap[swap];
      this.heap[swap] = element;
      index = swap;
    }
  }
}

