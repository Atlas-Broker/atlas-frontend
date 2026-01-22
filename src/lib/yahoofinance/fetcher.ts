/**
 * Yahoo Finance Market Data Fetcher
 * 
 * Main data fetching functions with intelligent caching
 */

import { yahooFinance } from './client';
import { getCachedData, setCachedData } from './cache';
import { calculateRSI, calculateMA, calculateMACD, analyzeTechnicalSignals, determineTrend, getBasicSentiment, identifyRiskFactors } from './utils';
import type { MarketData } from './types';

// Export analysis functions for use by agent
export { analyzeTechnicalSignals, determineTrend, getBasicSentiment, identifyRiskFactors };

/**
 * Get market data for a symbol with intelligent caching
 * 
 * Flow:
 * 1. Check MongoDB cache (data < 15 minutes old)
 * 2. If cache hit → return cached data
 * 3. If cache miss → fetch from Yahoo Finance
 * 4. Process raw data and calculate indicators
 * 5. Store in MongoDB with TTL
 * 6. Return processed data
 */
export async function getMarketData(symbol: string): Promise<MarketData> {
  const startTime = Date.now();
  const symbolUpper = symbol.toUpperCase();

  console.log(`📊 Fetching market data for ${symbolUpper}...`);

  try {
    // Step 1: Check cache
    const cached = await getCachedData(symbolUpper);

    if (cached) {
      console.log(`✅ Cache HIT for ${symbolUpper}`);
      return {
        symbol: cached.symbol,
        current_price: cached.processed.current_price,
        change_percent: cached.processed.change_percent,
        volume: cached.processed.volume,
        indicators: cached.processed.indicators,
        price_history: {
          daily_high: cached.processed.current_price * 1.02, // Approximation from cache
          daily_low: cached.processed.current_price * 0.98,
          week_52_high: cached.processed.current_price * 1.2,
          week_52_low: cached.processed.current_price * 0.8,
        },
        raw_data: cached.data,
        cached_at: cached.timestamp.toISOString(),
        cache_hit: true,
      };
    }

    console.log(`❌ Cache MISS for ${symbolUpper} - fetching from Yahoo Finance...`);

    // Step 2: Fetch from Yahoo Finance
    let quote: unknown = null;
    let historical: unknown[] = [];

    try {
      quote = await yahooFinance.quote(symbolUpper);
    } catch (err) {
      console.error(`Error fetching quote for ${symbolUpper}:`, err);
      quote = null;
    }

    try {
      historical = await yahooFinance.historical(symbolUpper, {
        period1: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        period2: new Date().toISOString().split('T')[0],
        interval: '1d',
      });
    } catch (err) {
      console.error(`Error fetching historical data for ${symbolUpper}:`, err);
      historical = [];
    }

    if (!quote) {
      throw new Error(`Unable to fetch data for symbol: ${symbolUpper}`);
    }

    // Step 3: Extract key metrics
    const quoteData = quote as Record<string, unknown> | null;
    const currentPrice = (quoteData?.regularMarketPrice as number) || 0;
    const previousClose = (quoteData?.regularMarketPreviousClose as number) || currentPrice;
    const changePercent = ((currentPrice - previousClose) / previousClose) * 100;

    // Step 4: Calculate technical indicators
    const closingPrices = (historical as Array<Record<string, unknown>>).map((h) => (h.close as number) || 0);
    const rsi = calculateRSI(closingPrices);
    const ma50 = calculateMA(closingPrices, 50);
    const ma200 = calculateMA(closingPrices, 200);
    const macd = calculateMACD(closingPrices);

    // Step 5: Build processed data
    const processedData: MarketData = {
      symbol: symbolUpper,
      current_price: currentPrice,
      change_percent: Math.round(changePercent * 100) / 100,
      volume: (quoteData?.regularMarketVolume as number) || 0,
      market_cap: quoteData?.marketCap as number | undefined,
      indicators: {
        rsi,
        macd,
        moving_averages: {
          ma_50: ma50,
          ma_200: ma200,
        },
      },
      price_history: {
        daily_high: (quoteData?.regularMarketDayHigh as number) || currentPrice,
        daily_low: (quoteData?.regularMarketDayLow as number) || currentPrice,
        week_52_high: (quoteData?.fiftyTwoWeekHigh as number) || currentPrice,
        week_52_low: (quoteData?.fiftyTwoWeekLow as number) || currentPrice,
      },
      raw_data: (quoteData || {}) as Record<string, unknown>,
      cached_at: new Date().toISOString(),
      cache_hit: false,
    };

    // Step 6: Cache the data
    await setCachedData(symbolUpper, quote as Record<string, unknown>, processedData);

    const duration = Date.now() - startTime;
    console.log(`✅ Market data fetched for ${symbolUpper} in ${duration}ms`);

    return processedData;
  } catch (error) {
    console.error(`❌ Error fetching market data for ${symbolUpper}:`, error);

    // Return mock data for demo purposes if Yahoo Finance fails
    console.warn(`⚠️ Returning mock data for ${symbolUpper} due to API error`);
    return getMockMarketData(symbolUpper);
  }
}

/**
 * Batch fetch market data for multiple symbols
 */
export async function getMultipleMarketData(symbols: string[]): Promise<Map<string, MarketData>> {
  const results = new Map<string, MarketData>();

  // Fetch in parallel
  const promises = symbols.map(async (symbol) => {
    try {
      const data = await getMarketData(symbol);
      results.set(symbol.toUpperCase(), data);
    } catch (error) {
      console.error(`Failed to fetch data for ${symbol}:`, error);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * Mock market data for demo/fallback
 */
function getMockMarketData(symbol: string): MarketData {
  const basePrice = 100 + Math.random() * 500;
  const changePercent = (Math.random() - 0.5) * 10;

  return {
    symbol: symbol.toUpperCase(),
    current_price: Math.round(basePrice * 100) / 100,
    change_percent: Math.round(changePercent * 100) / 100,
    volume: Math.floor(Math.random() * 10000000),
    indicators: {
      rsi: Math.round((Math.random() * 60 + 20) * 100) / 100,
      macd: {
        value: Math.round((Math.random() - 0.5) * 10 * 100) / 100,
        signal: Math.round((Math.random() - 0.5) * 8 * 100) / 100,
        histogram: Math.round((Math.random() - 0.5) * 5 * 100) / 100,
      },
      moving_averages: {
        ma_50: Math.round(basePrice * 0.95 * 100) / 100,
        ma_200: Math.round(basePrice * 0.9 * 100) / 100,
      },
    },
    price_history: {
      daily_high: Math.round(basePrice * 1.02 * 100) / 100,
      daily_low: Math.round(basePrice * 0.98 * 100) / 100,
      week_52_high: Math.round(basePrice * 1.3 * 100) / 100,
      week_52_low: Math.round(basePrice * 0.7 * 100) / 100,
    },
    raw_data: { mock: true },
    cached_at: new Date().toISOString(),
    cache_hit: false,
  };
}

