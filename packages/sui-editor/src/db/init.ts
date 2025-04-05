/**
 * Initializes a indexedDB database with the specified store name.
 * 
 * @param {string} storeName - The name of the object store to create in the database.
 * @returns {Promise<IDBPDatabase>} A promise that resolves to the indexedDB database instance.
 */
const initDb = async (storeName) => {
  return openDB('editor', 1, {
    upgrade(db) {
      db.createObjectStore(storeName);
    }
  });
}

export default initDb;