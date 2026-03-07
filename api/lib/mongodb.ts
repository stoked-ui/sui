// lib/mongodb.ts
import { MongoClient } from "mongodb";
import { Resource } from "sst";

const globalWithMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const uri = Resource.MONGODB_URI.value;
if (!uri) throw new Error("MONGODB_URI is not defined");

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!globalWithMongo._mongoClientPromise) {
  client = new MongoClient(uri);
  globalWithMongo._mongoClientPromise = client.connect();
}
clientPromise = globalWithMongo._mongoClientPromise;

export default clientPromise;
