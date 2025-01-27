
// lib/mongodb.ts
import { MongoClient } from "mongodb";
import { Resource } from "sst";

const uri = Resource.mongoDbUri.value;
if (!uri) throw new Error("MONGODB_URI is not defined");


let client: MongoClient;
if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
} else {
  client = global._mongoClientPromise;
}

export default client;
