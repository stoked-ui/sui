import { MongoClient } from 'mongodb';

export {}; // This ensures the file is treated as a module

declare global {
  namespace NodeJS {
    interface Global {
      _mongoClientPromise: Promise<MongoClient>;
    }
  }
}
