import initDb from './init';

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
