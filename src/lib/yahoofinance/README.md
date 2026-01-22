# Yahoo Finance Market Data Service

This folder contains all Yahoo Finance integration utilities for fetching real-time and historical market data.

## 📁 File Structure

```
yahoofinance/
├── client.ts      # Yahoo Finance client instance
├── fetcher.ts     # Market data fetching with caching
├── types.ts       # Market data type definitions
├── utils.ts       # Technical indicator calculations (RSI, MACD, MA)
└── README.md      # This file
```

## 📄 File Descriptions

### `client.ts`
**Purpose**: Initialize and export Yahoo Finance client

**Exports**:
- `yahooFinance` - Configured Yahoo Finance client instance

**Usage**:
```typescript
import { yahooFinance } from '@/lib/yahoofinance/client';

const quote = await yahooFinance.quote('AAPL');
const historical = await yahooFinance.historical('AAPL', {
  period1: '2024-01-01',
  period2: '2024-12-31',
});
```

**When to Use**: Direct API access (prefer `fetcher.ts` for standard workflows)

---

### `fetcher.ts`
**Purpose**: Fetch market data with intelligent MongoDB caching

**Exports**:
- `getMarketData(symbol)` - Fetch market data with caching
- `getMultipleMarketData(symbols)` - Batch fetch multiple symbols
- `getMockMarketData(symbol)` - Fallback mock data (internal)

**Main Function**: `getMarketData(symbol)`

**Flow**:
1. Check MongoDB cache (data < 15 minutes old)
2. If cache hit → Return cached data immediately
3. If cache miss → Fetch from Yahoo Finance API
4. Calculate technical indicators (RSI, MACD, MAs)
5. Store in MongoDB with 15-minute TTL
6. Return processed data

**Returns**: `MarketData` object
```typescript
{
  symbol: string;
  current_price: number;
  change_percent: number;
  volume: number;
  market_cap?: number;
  indicators: {
    rsi: number;
    macd: { value, signal, histogram };
    moving_averages: { ma_50, ma_200 };
  };
  price_history: {
    daily_high, daily_low,
    week_52_high, week_52_low
  };
  recent_news?: string[];
  raw_data: Record<string, unknown>;
  cached_at: string;
  cache_hit: boolean;
}
```

**Usage**:
```typescript
import { getMarketData } from '@/lib/yahoofinance/fetcher';

const data = await getMarketData('NVDA');
console.log(`${data.symbol}: $${data.current_price} (${data.change_percent}%)`);
console.log(`RSI: ${data.indicators.rsi}`);
console.log(`Cache hit: ${data.cache_hit}`);
```

**Batch Fetching**:
```typescript
import { getMultipleMarketData } from '@/lib/yahoofinance/fetcher';

const symbols = ['AAPL', 'NVDA', 'TSLA'];
const dataMap = await getMultipleMarketData(symbols);

dataMap.forEach((data, symbol) => {
  console.log(`${symbol}: $${data.current_price}`);
});
```

**Error Handling**: Falls back to mock data if Yahoo Finance API fails (for demo purposes)

**When to Use**: All market data fetching (automatically called by agent tools)

---

### `types.ts`
**Purpose**: TypeScript type definitions for market data

**Exports**:
- `MarketData` - Complete market data structure
- `YahooFinanceQuoteResult` - Raw Yahoo Finance quote response
- `YahooFinanceHistoricalResult` - Raw Yahoo Finance historical data

**MarketData Interface**:
```typescript
{
  symbol: string;              // Stock ticker
  current_price: number;       // Current market price
  change_percent: number;      // Daily % change
  volume: number;              // Trading volume
  market_cap?: number;         // Market capitalization
  indicators: {
    rsi?: number;              // Relative Strength Index (0-100)
    macd?: {
      value: number;           // MACD line
      signal: number;          // Signal line
      histogram: number;       // MACD histogram
    };
    moving_averages?: {
      ma_50: number;           // 50-day moving average
      ma_200: number;          // 200-day moving average
    };
  };
  price_history: {
    daily_high: number;        // Today's high
    daily_low: number;         // Today's low
    week_52_high: number;      // 52-week high
    week_52_low: number;       // 52-week low
  };
  recent_news?: string[];      // Recent news headlines
  raw_data: Record<string, unknown>; // Full Yahoo Finance response
  cached_at: string;           // Cache timestamp
  cache_hit: boolean;          // Whether data was cached
}
```

**When to Use**: Type annotations for market data operations

---

### `utils.ts`
**Purpose**: Technical indicator calculations and market analysis

**Exports**:
- `calculateRSI(prices, period?)` - Calculate Relative Strength Index
- `calculateMA(prices, period)` - Calculate Moving Average
- `calculateMACD(prices)` - Calculate MACD indicator
- `analyzeTechnicalSignals(data)` - Generate human-readable signals
- `determineTrend(data)` - Determine overall trend direction
- `getBasicSentiment(data)` - Get basic sentiment (mock)
- `identifyRiskFactors(data)` - Identify risk factors

**Technical Indicator Calculations**:

#### RSI (Relative Strength Index)
```typescript
import { calculateRSI } from '@/lib/yahoofinance/utils';

const prices = [100, 102, 101, 105, 107, 106, 108, 110];
const rsi = calculateRSI(prices, 14); // 14-period RSI
console.log(rsi); // e.g., 68.5

// Interpretation:
// RSI < 30: Oversold (potential buy)
// RSI > 70: Overbought (potential sell)
// 30-70: Neutral
```

#### MACD (Moving Average Convergence Divergence)
```typescript
import { calculateMACD } from '@/lib/yahoofinance/utils';

const prices = [100, 102, 101, 105, ...]; // 26+ prices
const macd = calculateMACD(prices);
console.log(macd); // { value: 2.5, signal: 2.1, histogram: 0.4 }

// Interpretation:
// histogram > 0: Bullish momentum
// histogram < 0: Bearish momentum
```

#### Moving Averages
```typescript
import { calculateMA } from '@/lib/yahoofinance/utils';

const prices = [100, 102, 101, 105, 107, 106, 108, 110];
const ma_50 = calculateMA(prices, 50);   // 50-day MA
const ma_200 = calculateMA(prices, 200); // 200-day MA

// Golden Cross: ma_50 > ma_200 (bullish)
// Death Cross: ma_50 < ma_200 (bearish)
```

**Market Analysis Functions**:

#### Analyze Technical Signals
```typescript
import { analyzeTechnicalSignals } from '@/lib/yahoofinance/utils';

const signals = analyzeTechnicalSignals(marketData);
console.log(signals);
// [
//   "RSI oversold at 28.3 (strong buy signal)",
//   "MACD bullish crossover (positive momentum)",
//   "Price above 50-day MA at $450.23 (bullish)",
//   "Golden cross (50-day > 200-day MA)",
//   "High volume (12.5M shares)"
// ]
```

#### Determine Trend
```typescript
import { determineTrend } from '@/lib/yahoofinance/utils';

const trend = determineTrend(marketData);
console.log(trend);
// "Strong uptrend - multiple bullish indicators"
// OR
// "Downtrend - caution advised"
// OR
// "Sideways/neutral trend - mixed signals"
```

#### Identify Risk Factors
```typescript
import { identifyRiskFactors } from '@/lib/yahoofinance/utils';

const risks = identifyRiskFactors(marketData);
console.log(risks);
// [
//   "High intraday volatility (>5% range)",
//   "Extreme overbought conditions - potential reversal",
//   "Trading near 52-week high - limited upside"
// ]
```

**When to Use**: Agent tool execution, technical analysis, risk assessment

---

## 📊 Market Data Caching

### Cache Strategy

```
Request for "NVDA"
       ↓
┌──────────────────┐
│ Check MongoDB    │
│ Cache            │
└──────────────────┘
       ↓
   Cache Hit? ────────── YES ──→ Return cached data (< 1ms)
       │
       NO
       ↓
┌──────────────────┐
│ Fetch from       │
│ Yahoo Finance    │  (~500ms)
└──────────────────┘
       ↓
┌──────────────────┐
│ Calculate        │
│ Indicators       │  (~50ms)
└──────────────────┘
       ↓
┌──────────────────┐
│ Store in         │
│ MongoDB Cache    │  (15-min TTL)
└──────────────────┘
       ↓
   Return data
```

### Cache Performance

**Typical Cache Hit Rate**: ~80%

**Benefits**:
- **Speed**: 500x faster (< 1ms vs 500ms)
- **API Limits**: Reduces Yahoo Finance API calls
- **Reliability**: Fallback if API is down
- **Cost**: Free (no API key required for basic usage)

**TTL (Time To Live)**: 15 minutes

**Auto-Cleanup**: MongoDB TTL index automatically removes expired data

---

## 🛠️ Common Patterns

### Fetching Market Data (with caching)
```typescript
import { getMarketData } from '@/lib/yahoofinance/fetcher';

export async function GET(
  request: Request,
  { params }: { params: { symbol: string } }
) {
  try {
    const data = await getMarketData(params.symbol);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Batch Fetching Multiple Symbols
```typescript
import { getMultipleMarketData } from '@/lib/yahoofinance/fetcher';

const watchlistSymbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT'];
const dataMap = await getMultipleMarketData(watchlistSymbols);

const enrichedWatchlist = watchlistSymbols.map(symbol => {
  const data = dataMap.get(symbol);
  return {
    symbol,
    price: data?.current_price,
    change: data?.change_percent,
    rsi: data?.indicators.rsi,
  };
});
```

### Using Technical Indicators
```typescript
import { getMarketData } from '@/lib/yahoofinance/fetcher';
import { analyzeTechnicalSignals, identifyRiskFactors } from '@/lib/yahoofinance/utils';

const data = await getMarketData('AAPL');

const signals = analyzeTechnicalSignals(data);
const risks = identifyRiskFactors(data);

console.log('Signals:', signals);
console.log('Risks:', risks);

// Decision logic
if (data.indicators.rsi < 30 && risks.length < 2) {
  console.log('Strong BUY signal');
} else if (data.indicators.rsi > 70) {
  console.log('Potential SELL signal');
}
```

---

## ⚠️ Important Notes

### DO:
- ✅ Use `getMarketData()` for all data fetching (handles caching automatically)
- ✅ Trust the cache for < 15-minute-old data
- ✅ Use batch fetching for multiple symbols
- ✅ Handle API errors gracefully (falls back to mock data)
- ✅ Check `cache_hit` field for debugging

### DON'T:
- ❌ Bypass the cache (unless you need real-time data)
- ❌ Make excessive API calls (respect rate limits)
- ❌ Trust mock data in production (check `cached_at` and `cache_hit`)
- ❌ Use historical data for real-time decisions (15-min delay)
- ❌ Store API keys (Yahoo Finance basic usage is free)

---

## 🐛 Troubleshooting

### Issue: "Symbol not found" or "Invalid symbol"
**Solution**: Ensure the symbol is a valid US equity ticker. Yahoo Finance uses different symbols for international stocks.

### Issue: "Rate limit exceeded"
**Solution**: Yahoo Finance has rate limits. Use caching to reduce API calls, or add delays between requests.

### Issue: "Historical data is empty"
**Solution**: Some symbols may not have sufficient historical data. Check that the symbol is actively traded.

### Issue: "All data shows cache_hit: false"
**Solution**: MongoDB cache may not be configured. Run `npm run setup:mongo` to create indexes.

---

## 📊 API Limits & Performance

### Yahoo Finance API
- **Rate Limits**: ~2000 requests/hour (unofficial)
- **Response Time**: ~300-500ms per request
- **Data Freshness**: Real-time (15-minute delay for free tier)
- **Cost**: Free (no API key required)

### With MongoDB Caching
- **Effective Rate**: Unlimited (for repeated requests within 15 min)
- **Response Time**: ~1-5ms (cache hit) / ~500ms (cache miss)
- **Cache Hit Rate**: ~80% (typical)

### Technical Indicator Performance
- **RSI Calculation**: ~1ms
- **MACD Calculation**: ~2ms
- **MA Calculation**: ~1ms
- **Total Overhead**: ~5-10ms

---

## 📚 Related Documentation
- [Yahoo Finance API (unofficial)](https://www.npmjs.com/package/yahoo-finance2)
- [Technical Indicators Explained](https://www.investopedia.com/terms/t/technicalindicator.asp)
- Atlas Agent Implementation: `/Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md`
- Atlas Setup Guide: `/Knowledge/001_SETUP.md`

---

**Last Updated**: 2026-01-22
