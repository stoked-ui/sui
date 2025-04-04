import initDb from './init';

/**
 * Returns a list of keys starting with the given prefix in the specified database.
 *
 * @param {string} dbName - The name of the database to query.
 * @param {string} storeName - The name of the store to query.
 * @param {string} prefix - The prefix to search for in the key values.
 * @returns {Promise<string[]>} A promise resolving to an array of keys starting with the given prefix.
 */
export async function getKeysStartingWithPrefix(dbName: string, storeName: string, prefix: string): Promise<string[]> {
  const db = await initDb(dbName);
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);

  /**
   * An array to store the keys starting with the given prefix.
   */
  const keys: string[] = [];

  let cursor = await store.openKeyCursor();

  while (cursor) {
    /**
     * The current key being processed in the cursor.
     */
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