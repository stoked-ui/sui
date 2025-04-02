/**
 * Implementation of Types.
 * @file sui/packages/sui-common/src/Types/Types.ts
 */

/**
 * Type that represents a constructor function with no initializer.
 */
export type NoArgsConstructor<T> = new () => T;

/**
 * Type that represents a constructor function that accepts arguments.
 */
export type ArgsConstructor<T> = new (...args: any[]) => T;

/**
 * Type that represents a constructor function, which can be either a NoInitializer or an ArgsConstructor.
 */
export type Constructor<T> = (NoArgsConstructor<T> | ArgsConstructor<T>);

/**
 * Function to set a property on an object with immutable behavior.
 *
 * @param o - The object to modify.
 * @param name - The name of the property to set.
 * @param value - The new value for the property.
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

/**
 * Class representing a sorted list of elements.
 *
 * The SortedList class is an extension of the Array class, providing methods for sorting and inserting elements in a specific order.
 *
 * @class SortedList
 */
export class SortedList<T> extends Array<T> {
  /**
   * Constructs a new SortedList instance with the provided compare function and optional initial items.
   *
   * @param compareFn - The function used to compare elements for sorting.
   * @param items - Optional array of initial items to populate the list.
   */
  constructor(private compareFn: (a: T, b: T) => number, items?: T[]) {
    super();
    if (items) {
      // Sort and initialize the list with the provided items
      items.sort(compareFn).forEach((item) => this.push(item));
    }
  }

  /**
   * Inserts a value into the sorted list at the correct position.
   *
   * @param value - The value to insert.
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
   * Appends items to the sorted list and inserts them in the correct order.
   *
   * @param items - The items to append.
   * @returns The length of the updated list.
   */
  override push(...items: T[]): number {
    items.forEach((item) => this.insert(item));
    return this.length;
  }

  /**
   * Inserts items at the beginning of the sorted list and inserts them in the correct order.
   *
   * @param items - The items to insert.
   * @returns The length of the updated list.
   */
  override unshift(...items: T[]): number {
    // Insert each item in the correct position
    items.forEach((item) => this.insert(item));
    return this.length;
  }

  /**
   * Inserts or removes items from the sorted list and maintains sorted order.
   *
   * @param start - The starting index for insertion or removal.
   * @param deleteCount - The number of items to remove.
   * @param items - The items to insert or remove.
   * @returns An array of removed items.
   */
  override splice(start: number, deleteCount: number, ...items: T[]): T[] {
    // Reinsert the new items to maintain sorted order
    const removed = super.splice(start, deleteCount, ...items);
    this.sort(this.compareFn);
    return removed;
  }

  /**
   * Merges two sorted lists into a single sorted list.
   *
   * @param items - The merged list of elements.
   * @returns A new SortedList instance with the combined elements.
   */
  override concat(...items: (T | ConcatArray<T>)[]): SortedList<T> {
    // Flatten and merge all arrays into a single sorted list
    const flattenedItems = items.flat();
    return new SortedList(this.compareFn, [...this, ...flattenedItems] as T[]);
  }

  /**
   * Sorts the list using an external compare function.
   *
   * @param compareFn - The external compare function (not used by SortedList).
   */
  override sort(compareFn: (a: T, b: T) => number): void {
    // Not implemented by SortedList
  }

  /**
   * Returns the sorted list as a plain array.
   *
   * @returns An array of elements in the sorted order.
   */
  toArray(): T[] {
    return Array.from(this);
  }
}