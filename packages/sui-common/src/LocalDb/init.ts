import { openDB } from '@tempfix/idb';

const initDb = async (storeName) => {
  return openDB('editor', 1, {
    upgrade(db) {
      db.createObjectStore(storeName);
    }
  });
}

export default initDb;
