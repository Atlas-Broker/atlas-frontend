/**
 * Yahoo Finance Caching Layer
 * 
 * MongoDB-based caching with 15-minute TTL
 */

import { getCachedMarketData, cacheMarketData } from '../mongodb/queries';
import type { MarketData } from './types';

/**
 * Get cached data for a symbol
 * Returns null if cache miss or data is stale
 */
export async function getCachedData(symbol: string) {
  return await getCachedMarketData(symbol);
}

/**
 * Set cached data for a symbol
 */
export async function setCachedData(
  symbol: string,
  rawData: Record<string, unknown>,
  processedData: MarketData
): Promise<void> {
  await cacheMarketData({
    symbol: symbol.toUpperCase(),
    timestamp: new Date(),
    source: 'yahoo_finance',
    data: rawData,
    processed: {
      current_price: processedData.current_price,
      change_percent: processedData.change_percent,
      volume: processedData.volume,
      indicators: processedData.indicators,
    },
    expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes TTL
  });
}

