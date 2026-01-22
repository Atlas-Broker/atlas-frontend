/**
 * MongoDB Collection Accessors
 * 
 * Typed collection getters
 */

import { Collection } from 'mongodb';
import { getDatabase } from './client';
import type { AgentRun, MarketDataCache } from './models';

// Collection name constants
export const COLLECTIONS = {
  AGENT_RUNS: 'agent_runs',
  MARKET_DATA_CACHE: 'market_data_cache',
} as const;

/**
 * Get agent_runs collection with proper typing
 */
export async function getAgentRunsCollection(): Promise<Collection<AgentRun>> {
  const db = await getDatabase();
  return db.collection<AgentRun>(COLLECTIONS.AGENT_RUNS);
}

/**
 * Get market_data_cache collection with proper typing
 */
export async function getMarketDataCacheCollection(): Promise<Collection<MarketDataCache>> {
  const db = await getDatabase();
  return db.collection<MarketDataCache>(COLLECTIONS.MARKET_DATA_CACHE);
}

