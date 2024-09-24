const open = (dbName: string, storeName: string) => {
  const request = indexedDB.open(dbName, 1);
  request.onerror = (event) => {
    if (event.target && "error" in event.target)
    console.error('Error opening database:', event.target?.error);
  };

  request.onsuccess = (event) => {
    if (event.target && "result" in event.target) {
      const db: any = event.target.result;
      console.log('Database opened successfully:', db);
    }

    // Now you can perform operations on the database
  };

  request.onupgradeneeded = (event) => {
    if (event.target && "result" in event.target) {
      const db: any = event.target.result;

      // Create object stores (tables) here
      if (!db.objectStoreNames.contains(storeName)) {
        const objectStore = db.createObjectStore(storeName, {
          keyPath: 'id',
          autoIncrement: true
        }); // 'yourObjectStoreName' is the name of your object store, 'id' is the primary key
      }
    }

  };
}
export default open;
