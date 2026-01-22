/**
 * MongoDB Connection Client
 * 
 * Singleton pattern for database connection
 * Handles development caching to avoid connection exhaustion
 */

import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'atlas_production';

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI is not configured in environment variables');
}

const uri = MONGODB_URI || 'mongodb://localhost:27017'; // Fallback to prevent module load crash
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

// Use global variable in development to preserve connection across hot reloads
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

/**
 * Get MongoDB client
 * Throws error if MONGODB_URI is not configured
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not defined. Please add it to your .env.local file.\n' +
      'See Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md for setup instructions.'
    );
  }
  return clientPromise;
}

/**
 * Get database instance
 * Throws error if MongoDB is not configured
 */
export async function getDatabase(): Promise<Db> {
  if (!MONGODB_URI || !MONGODB_DB_NAME) {
    throw new Error(
      'MongoDB is not configured. Please add MONGODB_URI and MONGODB_DB_NAME to your .env.local file.\n' +
      'See Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md for setup instructions.'
    );
  }
  const client = await getMongoClient();
  return client.db(MONGODB_DB_NAME);
}

/**
 * Initialize MongoDB collections and indexes
 * Should be called during app startup or via setup script
 */
export async function initializeMongoCollections(): Promise<void> {
  try {
    const db = await getDatabase();

    // Create agent_runs indexes
    const agentRuns = db.collection('agent_runs');
    await agentRuns.createIndex({ run_id: 1 }, { unique: true });
    await agentRuns.createIndex({ user_id: 1 });
    await agentRuns.createIndex({ timestamp: -1 });

    // Create market_data_cache indexes
    const marketCache = db.collection('market_data_cache');
    await marketCache.createIndex({ symbol: 1 });
    await marketCache.createIndex({ timestamp: -1 });
    await marketCache.createIndex({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index

    console.log('✅ MongoDB collections and indexes initialized');
  } catch (error) {
    console.error('❌ Error initializing MongoDB collections:', error);
    throw error;
  }
}

export default clientPromise;

