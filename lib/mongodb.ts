import * as dns from "node:dns";
import { MongoClient, type MongoClientOptions } from "mongodb";
import { attachDatabasePool } from "@vercel/functions";

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  appName: "hubx.dashboard",
  serverSelectionTimeoutMS: 3000,
};

if (uri?.startsWith("mongodb+srv://")) {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
}

let client: MongoClient | null = null;

if (uri && process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient;
  };

  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options);
    attachDatabasePool(globalWithMongo._mongoClient);
  }
  client = globalWithMongo._mongoClient;
} else if (uri) {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  attachDatabasePool(client);
}

// Export a module-scoped MongoClient. By doing this in a
// separate module, the client can be shared across functions.

export default client;
