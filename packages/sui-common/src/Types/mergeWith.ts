/**
 * Represents a constructor with no arguments.
 * @template T
 */
export type NoArgsConstructor<T> = new () => T;

/**
 * Represents a constructor with arguments.
 * @template T
 */
export type ArgsConstructor<T> = new (...args: any[]) => T;

/**
 * Represents a constructor that can be either with no arguments or with arguments.
 * @template T
 */
export type Constructor<T> = (NoArgsConstructor<T> | ArgsConstructor<T>);

/**
 * Sets a property on an object with the provided name and value.
 * @param {any} o - The object to set the property on.
 * @param {string} name - The name of the property.
 * @param {any} value - The value to set for the property.
 */
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
/**
 * Represents a sorted list that maintains items in sorted order.
 * @template T
 */
export class SortedList<T> extends Array<T> {
  /**
   * Creates a sorted list with the provided comparison function and optional initial items.
   * @param {(a: T, b: T) => number} compareFn - The comparison function to determine sorting order.
   * @param {T[]} [items] - Optional initial items to populate the sorted list.
   */
  constructor(private compareFn: (a: T, b: T) => number, items?: T[]) {
    super();
    if (items) {
      // Sort and initialize the list with the provided items
      items.sort(compareFn).forEach((item) => this.push(item));
    }
  }

  /**
   * Inserts a value into the sorted list while maintaining the sort order.
   * @param {T} value - The value to insert into the sorted list.
   */
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

  /**
   * Adds items to the end of the sorted list while maintaining the sort order.
   * @param {...T[]} items - Items to add to the sorted list.
   * @returns {number} The new length of the sorted list.
   */
  override push(...items: T[]): number {
    items.forEach((item) => this.insert(item));
    return this.length;
  }

  /**
   * Adds items to the beginning of the sorted list while maintaining the sort order.
   * @param {...T[]} items - Items to add to the sorted list.
   * @returns {number} The new length of the sorted list.
   */
  override unshift(...items: T[]): number {
    // Insert each item in the correct position
    items.forEach((item) => this.insert(item));
    return this.length;
  }

  /**
   * Removes elements from the sorted list and optionally adds new elements while maintaining the sort order.
   * @param {number} start - The index at which to start changing the sorted list.
   * @param {number} deleteCount - The number of old elements to remove.
   * @param {...T[]} items - Items to add to the sorted list.
   * @returns {T[]} An array containing the removed elements.
   */
  override splice(start: number, deleteCount: number, ...items: T[]): T[] {
    // Reinsert the new items to maintain sorted order
    const removed = super.splice(start, deleteCount, ...items);
    this.sort(this.compareFn);
    return removed;
  }

  /**
   * Concatenates multiple arrays and returns a new sorted list.
   * @param {...(T | ConcatArray<T>)} items - Arrays or values to concatenate.
   * @returns {SortedList<T>} A new sorted list containing the concatenated items.
   */
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

  /**
   * Converts the sorted list to a plain array.
   * @returns {T[]} A plain array representation of the sorted list.
   */
  toArray(): T[] {
    return Array.from(this);
  }
}