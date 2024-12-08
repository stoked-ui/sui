
export type NoArgsConstructor<T> = new () => T;

export type ArgsConstructor<T> = new (...args: any[]) => T;

export type Constructor<T> = (NoArgsConstructor<T> | ArgsConstructor<T>);

export function setProperty(o: any, name: string, value: any) {
  console.log('setProperty', 'name');
  Object.defineProperty(o, name, {
    value,
    writable: false,
    configurable: false,
    enumerable: true
  });
}

/*
 const sortedList = new AutoSortedList<number>((a, b) => a - b);  // Sort in ascending order
 sortedList.insert(3);
 sortedList.insert(1);
 sortedList.insert(2);

 console.log(sortedList.getList());  // [1, 2, 3]
 */
export class SortedList<T> extends Array<T> {
  constructor(private compareFn: (a: T, b: T) => number, items?: T[]) {
    super();
    if (items) {
      // Sort and initialize the list with the provided items
      items.sort(compareFn).forEach((item) => this.push(item));
    }
  }

  private insert(value: T): void {
    if (value === undefined) {
      return;
    }
    // Binary search to find the correct position
    let low = 0;
    let high = this.length;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.compareFn(this[mid], value) < 0) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    // Insert the element at the correct position
    this.splice(low, 0, value);
  }

  override push(...items: T[]): number {
    items.forEach((item) => this.insert(item));
    return this.length;
  }

  override unshift(...items: T[]): number {
    // Insert each item in the correct position
    items.forEach((item) => this.insert(item));
    return this.length;
  }

  override splice(start: number, deleteCount: number, ...items: T[]): T[] {
    // Reinsert the new items to maintain sorted order
    const removed = super.splice(start, deleteCount, ...items);
    this.sort(this.compareFn);
    return removed;
  }

  override concat(...items: (T | ConcatArray<T>)[]): SortedList<T> {
    // Flatten and merge all arrays into a single sorted list
    const flattenedItems = items.flat();
    return new SortedList(this.compareFn, [...this, ...flattenedItems] as T[]);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override sort(compareFn?: (a: T, b: T) => number): this {
    // Ignore external sort attempts; re-sort using the internal compareFn
    super.sort(this.compareFn);
    return this;
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  override copyWithin(target: number, start: number, end?: number): this {
    throw new Error("The copyWithin method is not supported in SortedList as it breaks sorted order.");
  }

  // eslint-disable-next-line class-methods-use-this
  override reverse(): this {
    throw new Error("The reverse method is not supported in SortedList as it breaks sorted order.");
  }

  // Optional: Add utility to get the sorted array as a plain array
  toArray(): T[] {
    return Array.from(this);
  }
}
