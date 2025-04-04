/**
 * Initializes a new database instance with the given store name.
 *
 * @param {string} storeName - The name of the database store to create.
 * @returns {Promise<DB>} A promise resolving to the initialized database instance.
 */
import { openDB } from '@tempfix/idb';

const initDb = async (storeName) => {
  return openDB('editor', 1, {
    /**
     * Upgrades the database schema by creating the specified store.
     *
     * @param {IDBDatabase} db - The database instance to upgrade.
     */
    upgrade(db) {
      db.createObjectStore(storeName);
    }
  });
};

export default initDb;