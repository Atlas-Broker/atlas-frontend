/**
 * Yahoo Finance Type Definitions
 */

export interface MarketData {
  symbol: string;
  current_price: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  indicators: {
    rsi?: number;
    macd?: {
      value: number;
      signal: number;
      histogram: number;
    };
    moving_averages?: {
      ma_50: number;
      ma_200: number;
    };
  };
  price_history: {
    daily_high: number;
    daily_low: number;
    week_52_high: number;
    week_52_low: number;
  };
  recent_news?: string[];
  raw_data: Record<string, unknown>;
  cached_at: string;
  cache_hit: boolean;
}

