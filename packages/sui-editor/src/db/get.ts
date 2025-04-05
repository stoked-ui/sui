/**
 * Retrieves keys from a specified indexedDB store that start with a given prefix.
 * 
 * @param {string} dbName - The name of the indexedDB database.
 * @param {string} storeName - The name of the indexedDB store to retrieve keys from.
 * @param {string} prefix - The prefix to filter keys by.
 * @returns {Promise<string[]>} The array of keys starting with the specified prefix.
 */
export async function getKeysStartingWithPrefix(dbName: string, storeName: string, prefix: string): Promise<string[]> {
  const db = await initDb(dbName);
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);

  const keys: string[] = [];

  let cursor = await store.openKeyCursor();

  while (cursor) {
    const key = cursor.key as string;
    if (key.startsWith(prefix)) {
      keys.push(key);
    }
    // eslint-disable-next-line no-await-in-loop
    cursor = await cursor.continue();
  }

  await tx.done;
  return keys;
}