/**
 * Custom type to represent the key used for merging two arrays.
 * @typedef {keyof T} MergeKey
 */

/**
 * Extends the native Array prototype to merge two arrays based on a specified key.
 * @template T, U
 */
declare global {
  interface Array<T> {
    /**
     * Merges the current array with another array based on a merge key.
     * @template U
     * @param {U[]} otherArray - The array to merge with.
     * @param {MergeKey<T & U>} mergeKey - The key used for merging.
     * @returns {Array<T | U>} The merged array.
     */
    mergeWith<U>(otherArray: U[], mergeKey: MergeKey<T & U>): Array<T | U>;
  }
}

/**
 * Merges the current array with another array based on a merge key.
 * @template T, U
 * @param {T[]} this - The current array.
 * @param {U[]} otherArray - The array to merge with.
 * @param {MergeKey<T & U>} mergeKey - The key used for merging.
 * @returns {Array<T | U>} The merged array.
 */
function mergeWith<T, U>(
  this: T[],
  otherArray: U[],
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

// eslint-disable-next-line no-extend-native
Array.prototype.mergeWith = mergeWith;

export { mergeWith };
