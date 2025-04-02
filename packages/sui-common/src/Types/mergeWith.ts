/**
 * Type alias for a key that can be used to merge two objects of type T.
 *
 * @template T
 * @typedef {string|number|symbol} MergeKey<T>
 */
type MergeKey<T> = keyof T;

declare global {
  /**
   * Interface for the global Array type, added to support the mergeWith method.
   *
   * @interface Array<T>
   */
  interface Array<T> {
    /**
     * Merges two arrays into one, overwriting duplicates based on a common key.
     *
     * @template U
     * @param {U[]} otherArray The array to merge with this array.
     * @param {keyof (T & U)} mergeKey The key to use for merging items between the two arrays.
     * @returns {Array<T | U>} A new array containing all unique items from both input arrays.
     */
    /**
     * Merges two arrays into one, overwriting duplicates based on a common key.
     *
     * @template T
     * @param {T[]} this The current instance of an array type, used to access the filter method.
     * @param {any[]} otherArray The array to merge with this array.
     * @param {keyof (T & U)} mergeKey The key to use for merging items between the two arrays.
     * @returns {Array<T | U>} A new array containing all unique items from both input arrays.
     */
    /**
     * Merges two arrays into one, overwriting duplicates based on a common key.
     *
     * @template T
     * @param {T[]} this The current instance of an array type, used to access the filter method.
     * @param {any[]} otherArray The array to merge with this array.
     * @param {keyof (T & U)} mergeKey The key to use for merging items between the two arrays.
     * @returns {Array<T | U>} A new array containing all unique items from both input arrays.
     */
    /**
     * Merges two arrays into one, overwriting duplicates based on a common key.
     *
     * @param {any[]} otherArray The array to merge with this array.
     * @param {keyof (T & U)} mergeKey The key to use for merging items between the two arrays.
     * @returns {Array<T | U>} A new array containing all unique items from both input arrays.
     */
    /**
     * Merges two arrays into one, overwriting duplicates based on a common key.
     *
     * @param {any[]} otherArray The array to merge with this array.
     * @param {keyof (T & U)} mergeKey The key to use for merging items between the two arrays.
     * @returns {Array<T | U>} A new array containing all unique items from both input arrays.
     */
    /**
     * Merges two arrays into one, overwriting duplicates based on a common key.
     *
     * @param {any[]} otherArray The array to merge with this array.
     * @param {keyof (T & U)} mergeKey The key to use for merging items between the two arrays.
     * @returns {Array<T | U>} A new array containing all unique items from both input arrays.
     */
    mergeWith<U>(otherArray: U[], mergeKey: MergeKey<T & U>): Array<T | U>;
  }
}

/**
 * Merges two arrays into one, overwriting duplicates based on a common key.
 *
 * @template T
 * @param {T[]} this The current instance of an array type, used to access the filter method.
 * @param {any[]} otherArray The array to merge with this array.
 * @param {keyof (T & U)} mergeKey The key to use for merging items between the two arrays.
 * @returns {Array<T | U>} A new array containing all unique items from both input arrays.
 */
function mergeWith<T, U>(
  /**
   * The current instance of an array type, used to access the filter method.
   */
  this: T[],
  otherArray: U[],
  /**
   * The key to use for merging items between the two arrays.
   */
  mergeKey: MergeKey<T & U>
): Array<T | U> {
  const mergedMap = new Map<any, T | U>();

  /**
   * Filter out any non-existent or falsy elements from the first array.
   */
  const instance = this.filter(Boolean);

  if (!Array.isArray(otherArray)) {
    return instance;
  }

  /**
   * Remove any non-existent or falsy elements from the second array.
   */
  otherArray = otherArray.filter(Boolean);

  /**
   * Add items from the first array to the map, using the mergeKey as the key.
   */
  instance.forEach((item) => {
    const key = item[mergeKey as keyof T];
    mergedMap.set(key, item);
  });

  /**
   * Add items from the second array to the map, overwriting duplicates based on the mergeKey.
   */
  otherArray.forEach((item) => {
    const key = item[mergeKey as keyof U];
    mergedMap.set(key, item);
  });

  /**
   * Convert the map values back into an array and return it.
   */
  return Array.from(mergedMap.values());
}

// eslint-disable-next-line no-extend-native
Array.prototype.mergeWith = mergeWith;

export { mergeWith };