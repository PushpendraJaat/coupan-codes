import { MongoClient, ServerApiVersion, type Db } from "mongodb";

// Validate environment variables
if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in environment variables");
}

const uri = process.env.MONGODB_URI;
const dbName = "coupon_distribution";

// MongoDB connection configuration
const clientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 10,        // Adjust based on your workload
  minPoolSize: 2,         // Maintain a small pool for quick operations
  socketTimeoutMS: 30000,  // Close sockets after 30s of inactivity
  connectTimeoutMS: 5000,  // Fail quickly if can't connect
  heartbeatFrequencyMS: 10000, // Maintain connection health
};

type MongoConnection = {
  client: MongoClient;
  db: Db;
};

// Use TypeScript's global augmentation for development caching
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let cachedDb: Db;

if (process.env.NODE_ENV === "development") {
  // Development-mode-specific optimizations
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, clientOptions);
    global._mongoClientPromise = client.connect();
    console.log("Created new MongoDB connection in development mode");
  }
  clientPromise = global._mongoClientPromise;
} else {
  // Production optimizations
  client = new MongoClient(uri, clientOptions);
  clientPromise = client.connect();
}

// Pre-resolve the database instance when possible
clientPromise.then(client => {
  cachedDb = client.db(dbName);
}).catch((err) => {
  console.error("Failed to connect to MongoDB:", err);
  process.exit(1);
});

export async function connectToDatabase(): Promise<MongoConnection> {
  try {
    const client = await clientPromise;
    
    // Use cached database instance if available
    const db = cachedDb || client.db(dbName);
    
    // Verify connection immediately
    await client.db("admin").command({ ping: 1 });
    
    return { client, db };
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw new Error("Failed to connect to database");
  }
}

// Optional: Cleanup connection on process termination
["SIGINT", "SIGTERM"].forEach(signal => {
  process.on(signal, async () => {
    try {
      const client = await clientPromise;
      await client.close();
      console.log("MongoDB connection closed through app termination");
      process.exit(0);
    } catch (err) {
      console.error("Failed to close MongoDB connection:", err);
      process.exit(1);
    }
  });
});