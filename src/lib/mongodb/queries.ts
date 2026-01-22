/**
 * MongoDB Query Functions
 * 
 * Centralized, reusable MongoDB queries
 */

import { getAgentRunsCollection, getMarketDataCacheCollection } from './collections';
import type { AgentRun, MarketDataCache, AgentStats } from './models';

// ============================================
// AGENT RUN OPERATIONS
// ============================================

/**
 * Save complete agent execution trace to MongoDB
 */
export async function saveAgentRun(trace: Omit<AgentRun, '_id'>): Promise<string> {
  try {
    const collection = await getAgentRunsCollection();
    const result = await collection.insertOne({
      ...trace,
      created_at: new Date(),
    } as AgentRun);

    console.log(`✅ Agent run saved to MongoDB: ${trace.run_id}`);
    return result.insertedId.toString();
  } catch (error) {
    console.error('❌ Error saving agent run to MongoDB:', error);
    throw error;
  }
}

/**
 * Get specific agent run by run_id
 */
export async function getAgentRun(runId: string): Promise<AgentRun | null> {
  try {
    const collection = await getAgentRunsCollection();
    return await collection.findOne({ run_id: runId });
  } catch (error) {
    console.error('❌ Error fetching agent run:', error);
    throw error;
  }
}

/**
 * Get all agent runs for a specific user
 */
export async function getAgentRunsByUser(
  userId: string,
  limit: number = 10
): Promise<AgentRun[]> {
  try {
    const collection = await getAgentRunsCollection();
    return await collection
      .find({ user_id: userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error('❌ Error fetching user agent runs:', error);
    throw error;
  }
}

/**
 * Get latest agent run for a user
 */
export async function getLatestAgentRun(userId: string): Promise<AgentRun | null> {
  try {
    const collection = await getAgentRunsCollection();
    return await collection.findOne({ user_id: userId }, { sort: { timestamp: -1 } });
  } catch (error) {
    console.error('❌ Error fetching latest agent run:', error);
    throw error;
  }
}

/**
 * Get agent run statistics for admin dashboard
 */
export async function getAgentStats(since?: Date): Promise<AgentStats> {
  try {
    const collection = await getAgentRunsCollection();
    const matchStage = since ? { timestamp: { $gte: since } } : {};

    const stats = await collection
      .aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total_runs: { $sum: 1 },
            runs_with_proposals: {
              $sum: { $cond: [{ $ne: ['$proposal', null] }, 1, 0] },
            },
            avg_confidence: { $avg: '$proposal.confidence' },
            unique_users: { $addToSet: '$user_id' },
          },
        },
        {
          $project: {
            total_runs: 1,
            runs_with_proposals: 1,
            average_confidence: { $round: ['$avg_confidence', 2] },
            unique_users: { $size: '$unique_users' },
          },
        },
      ])
      .toArray();

    return (stats[0] as AgentStats | undefined) || {
      total_runs: 0,
      runs_with_proposals: 0,
      average_confidence: 0,
      unique_users: 0,
    };
  } catch (error) {
    console.error('❌ Error fetching agent stats:', error);
    throw error;
  }
}

// ============================================
// MARKET DATA CACHE OPERATIONS
// ============================================

/**
 * Get cached market data if fresh (< 15 minutes old)
 */
export async function getCachedMarketData(symbol: string): Promise<MarketDataCache | null> {
  try {
    const collection = await getMarketDataCacheCollection();
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    return await collection.findOne({
      symbol: symbol.toUpperCase(),
      timestamp: { $gte: fifteenMinutesAgo },
    });
  } catch (error) {
    console.error('❌ Error fetching cached market data:', error);
    return null;
  }
}

/**
 * Save market data to cache
 */
export async function cacheMarketData(data: Omit<MarketDataCache, '_id'>): Promise<void> {
  try {
    const collection = await getMarketDataCacheCollection();
    await collection.insertOne(data as MarketDataCache);
    console.log(`✅ Market data cached for ${data.symbol}`);
  } catch (error) {
    console.error('❌ Error caching market data:', error);
    // Don't throw - caching is not critical
  }
}

