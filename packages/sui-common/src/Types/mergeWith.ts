/**
 * Type alias for the merge key type.
 *
 * The merge key type is a union of two types, T and U, where both types have the same keys as specified by the MergeKey function.
 */
type MergeKey<T> = keyof T;

/**
 * Global interface to extend the Array prototype with the mergeWith method.
 *
 * This extension allows arrays to be merged with other arrays using the mergeWith method.
 */
declare global {
  interface Array<T> {
    /**
     * Merges two arrays together, combining their properties based on a common key.
     *
     * The first array is iterated over and its items are added to the map. Then, the second array is iterated over,
     * and any duplicate items are overwritten in the map. Finally, the values of the map are returned as an array.
     *
     * @param otherArray - The second array to merge with.
     * @param mergeKey - The key function to determine which items to combine.
     * @returns A new array containing all combined properties.
     */
    mergeWith<U>(otherArray: U[], mergeKey: MergeKey<T & U>): Array<T | U>;
  }
}

/**
 * Merges two arrays together, combining their properties based on a common key.
 *
 * This function takes three arguments: the current array (this), the second array to merge with, and the merge key.
 *
 * @param this - The current array to merge into.
 * @param otherArray - The second array to merge with.
 * @param mergeKey - The key function to determine which items to combine.
 * @returns A new array containing all combined properties.
 */
function mergeWith<T, U>(
  /**
   * The current array to merge into.
   *
   * This is the array that will be modified by adding or overwriting its properties based on the merge key.
   */
  this: T[],
  otherArray: U[],
  /**
   * The key function to determine which items to combine.
   *
   * This function takes an item from either array and returns a string representing the common key for that item.
   */
  mergeKey: MergeKey<T & U>
): Array<T | U> {
  const mergedMap = new Map<any, T | U>();
  const instance = this.filter(Boolean);
  if (!Array.isArray(otherArray)) {
    return instance;
  }
  otherArray = otherArray.filter(Boolean);

  // Add items from the first array
  instance.forEach((item) => {
    const key = item[mergeKey as keyof T];
    mergedMap.set(key, item);
  });

  // Add items from the second array, overwriting duplicates based on the key
  otherArray.forEach((item) => {
    const key = item[mergeKey as keyof U];
    mergedMap.set(key, item);
  });

  return Array.from(mergedMap.values());
}

/**
 * Extends the Array prototype with the mergeWith method.
 *
 * This allows arrays to be merged with other arrays using the mergeWith method.
 */
// eslint-disable-next-line no-extend-native
Array.prototype.mergeWith = mergeWith;

export { mergeWith };