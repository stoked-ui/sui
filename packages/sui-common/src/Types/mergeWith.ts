type MergeKey<T> = keyof T;

declare global {
  interface Array<T> {
    mergeWith<U>(otherArray: U[], mergeKey: MergeKey<T & U>): Array<T | U>;
  }
}

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

