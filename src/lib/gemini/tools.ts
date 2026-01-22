/**
 * Gemini Agent Tools
 * 
 * Tool definitions and execution handlers for the agent
 */

import { getMarketData, analyzeTechnicalSignals, determineTrend, getBasicSentiment, identifyRiskFactors } from '../yahoofinance/fetcher';
import type { ToolCall } from '../mongodb/models';

/**
 * Extract stock symbol from user intent
 */
export function extractSymbol(intent: string): string | null {
  // Common company name mappings (check first for better accuracy)
  const nameMap: Record<string, string> = {
    nvidia: 'NVDA',
    apple: 'AAPL',
    tesla: 'TSLA',
    microsoft: 'MSFT',
    amazon: 'AMZN',
    google: 'GOOGL',
    meta: 'META',
    netflix: 'NFLX',
    amd: 'AMD',
    intel: 'INTC',
    facebook: 'META',
  };

  const lowerIntent = intent.toLowerCase();
  for (const [name, symbol] of Object.entries(nameMap)) {
    if (lowerIntent.includes(name)) {
      return symbol;
    }
  }

  // Look for ticker symbols: "NVDA", "AAPL", "TSLA", etc.
  // Match 2-5 uppercase letters that are not common words
  const symbolMatch = intent.match(/\b([A-Z]{2,5})\b/);
  if (symbolMatch) {
    const symbol = symbolMatch[1];
    // Exclude common words that might be mistaken for tickers
    const excludeWords = ['I', 'A', 'THE', 'AND', 'OR', 'FOR', 'TO', 'IN', 'IS', 'IT', 'AI'];
    if (!excludeWords.includes(symbol)) {
      return symbol;
    }
  }

  return null;
}

/**
 * Call market data tool
 */
export async function callMarketDataTool(symbol: string): Promise<ToolCall> {
  const startTime = Date.now();

  try {
    const data = await getMarketData(symbol);
    const duration = Date.now() - startTime;

    return {
      tool: 'get_market_data',
      symbol: symbol.toUpperCase(),
      data_source: 'yahoo_finance',
      timestamp: new Date(),
      cache_hit: data.cache_hit,
      result: {
        current_price: data.current_price,
        change_percent: data.change_percent,
        volume: data.volume,
        indicators: data.indicators,
        price_history: data.price_history,
      },
      duration_ms: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      tool: 'get_market_data',
      symbol: symbol.toUpperCase(),
      data_source: 'yahoo_finance',
      timestamp: new Date(),
      cache_hit: false,
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      duration_ms: duration,
    };
  }
}

/**
 * Analyze technicals tool
 */
export async function analyzeTechnicalsTool(symbol: string): Promise<ToolCall> {
  const startTime = Date.now();

  try {
    const data = await getMarketData(symbol);
    const signals = analyzeTechnicalSignals(data);
    const trend = determineTrend(data);
    const sentiment = getBasicSentiment(data);
    const risks = identifyRiskFactors(data);
    const duration = Date.now() - startTime;

    return {
      tool: 'analyze_technicals',
      symbol: symbol.toUpperCase(),
      data_source: 'yahoo_finance',
      timestamp: new Date(),
      cache_hit: data.cache_hit,
      result: {
        technical_signals: signals,
        trend_analysis: trend,
        sentiment,
        risk_factors: risks,
      },
      duration_ms: duration,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      tool: 'analyze_technicals',
      symbol: symbol.toUpperCase(),
      data_source: 'yahoo_finance',
      timestamp: new Date(),
      cache_hit: false,
      result: { error: error instanceof Error ? error.message : 'Unknown error' },
      duration_ms: duration,
    };
  }
}

