# MongoDB Service

This folder contains all MongoDB (NoSQL) database utilities for storing agent traces and market data cache.

## 📁 File Structure

```
mongodb/
├── client.ts            # MongoDB connection and database access
├── models.ts            # TypeScript interfaces for MongoDB collections
├── collections.ts       # Collection accessor functions
├── queries.ts           # MongoDB query operations
├── setup-mongodb.ts     # Initialization script for indexes
└── README.md            # This file
```

## 📄 File Descriptions

### `client.ts`
**Purpose**: MongoDB client connection and database access

**Exports**:
- `getMongoClient()` - Get MongoDB client (singleton pattern)
- `getDatabase()` - Get database instance

**Usage**:
```typescript
import { getDatabase } from '@/lib/mongodb/client';

const db = await getDatabase();
const collection = db.collection('agent_runs');
```

**Connection Pooling**: Uses global caching in development to prevent exhausting connection pool.

**When to Use**: Direct database access (prefer `queries.ts` for most operations)

---

### `models.ts`
**Purpose**: TypeScript interfaces for MongoDB collections

**Key Interfaces**:

#### `ToolCall`
Represents a single tool execution by the agent
```typescript
{
  tool: string;                 // Tool name (e.g., "get_market_data")
  symbol: string;               // Stock symbol
  data_source: string;          // Data source (e.g., "yahoo_finance")
  timestamp: Date;              // Execution time
  cache_hit: boolean;           // Whether data was cached
  result: Record<string, unknown>; // Tool result
  duration_ms?: number;         // Execution duration
}
```

#### `AgentReasoning`
Structured reasoning from the AI agent
```typescript
{
  technical_signals: string[];  // RSI, MACD, etc.
  trend_analysis: string;       // Overall trend description
  sentiment: string;            // Market sentiment
  risk_factors: string[];       // Identified risks
}
```

#### `TradeProposal`
Trade recommendation from the agent
```typescript
{
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  quantity: number;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  confidence: number;           // 0-1
  holding_window: string;       // e.g., "3-7 days"
}
```

#### `AgentRun`
Complete agent execution trace
```typescript
{
  _id?: ObjectId;
  run_id: string;                // UUID
  user_id: string;               // Clerk user ID
  timestamp: Date;
  input: string;                 // User intent
  agent_status: 'ANALYZING' | 'PROPOSING' | 'COMPLETED' | 'ERROR';
  tools_called: ToolCall[];
  reasoning: AgentReasoning;
  proposal?: TradeProposal;
  evidence_links: string[];
  error?: string;
  duration_ms: number;
  created_at: Date;
}
```

#### `MarketDataCache`
Cached market data (15-minute TTL)
```typescript
{
  _id?: ObjectId;
  symbol: string;
  timestamp: Date;
  source: string;               // "yahoo_finance"
  data: Record<string, unknown>; // Raw API response
  processed: {
    current_price: number;
    change_percent: number;
    volume: number;
    indicators: {
      rsi?: number;
      macd?: { value, signal, histogram };
      moving_averages?: { ma_50, ma_200 };
    };
  };
  expires_at: Date;             // TTL index
}
```

**When to Use**: Type annotations for MongoDB operations

---

### `collections.ts`
**Purpose**: Collection accessor functions with types

**Exports**:
- `COLLECTIONS` - Collection name constants
- `getAgentRunsCollection()` - Get typed agent_runs collection
- `getMarketDataCacheCollection()` - Get typed market_data_cache collection

**Usage**:
```typescript
import { getAgentRunsCollection } from '@/lib/mongodb/collections';

const collection = await getAgentRunsCollection();
const runs = await collection.find({ user_id: userId }).toArray();
```

**When to Use**: Direct collection access with type safety

---

### `queries.ts`
**Purpose**: High-level MongoDB query operations

**Agent Run Operations**:
- `saveAgentRun(trace)` - Save agent execution trace
- `getAgentRun(runId)` - Fetch specific agent run
- `getAgentRunsByUser(userId, limit?)` - Fetch user's agent runs
- `getLatestAgentRun(userId)` - Fetch most recent agent run
- `getAgentStats(since?)` - Get aggregated stats

**Market Data Cache Operations**:
- `getCachedMarketData(symbol)` - Fetch cached data (if < 15 min old)
- `saveCachedMarketData(data)` - Store market data with TTL

**Usage**:
```typescript
import { saveAgentRun, getAgentRunsByUser } from '@/lib/mongodb/queries';

// Save agent run
await saveAgentRun({
  run_id: uuidv4(),
  user_id: clerkUserId,
  timestamp: new Date(),
  input: "Should I buy NVDA?",
  agent_status: 'COMPLETED',
  tools_called: [{ tool: 'get_market_data', ... }],
  reasoning: { technical_signals: [...], ... },
  proposal: { action: 'BUY', ... },
  evidence_links: ['https://finance.yahoo.com/quote/NVDA'],
  duration_ms: 3542,
  created_at: new Date(),
});

// Fetch user's runs
const runs = await getAgentRunsByUser(clerkUserId, 10);
```

**When to Use**: All MongoDB operations (prefer these over raw queries)

---

### `setup-mongodb.ts`
**Purpose**: Initialization script to create collections and indexes

**What it does**:
1. Creates `agent_runs` collection with indexes:
   - `run_id` (unique)
   - `user_id` (for user queries)
   - `timestamp` (for sorting)
2. Creates `market_data_cache` collection with indexes:
   - `symbol` + `timestamp` (for cache lookups)
   - `expires_at` (TTL index - auto-deletes expired data)

**Usage**:
```bash
npm run setup:mongo
```

**When to run**: Once after setting up MongoDB, or after schema changes

---

## 🗄️ Database Schema

### Collections

#### `agent_runs`
Stores complete agent execution traces for debugging and compliance

**Indexes**:
- `run_id` (unique) - For direct lookups
- `user_id` - For user-specific queries
- `timestamp` - For sorting by date

**Typical Size**: ~10KB per run

**Retention**: No automatic expiration (manual cleanup recommended)

#### `market_data_cache`
Stores market data with 15-minute expiration

**Indexes**:
- `symbol` + `timestamp` - For cache lookups
- `expires_at` (TTL) - Auto-deletes after expiration

**Typical Size**: ~5KB per entry

**Retention**: 15 minutes (automatic via TTL index)

---

## 🔄 Data Flow

### Agent Run Flow
```
1. User submits intent → "/api/agent/analyze"
2. Agent runs → generates trace
3. saveAgentRun(trace) → MongoDB
4. Return run_id to frontend
5. Frontend can fetch trace via "/api/agent/trace/[runId]"
```

### Market Data Caching Flow
```
1. Agent needs data for "NVDA"
2. Check getCachedMarketData("NVDA")
   ├─ If cache hit (< 15 min) → Return cached data
   └─ If cache miss → Fetch from Yahoo Finance
      └─ saveCachedMarketData() → MongoDB
3. Next request within 15 min → Cache hit
```

---

## 🛠️ Common Patterns

### Saving an Agent Run
```typescript
import { saveAgentRun } from '@/lib/mongodb/queries';
import { v4 as uuidv4 } from 'uuid';

const runId = uuidv4();
const startTime = Date.now();

try {
  // ... agent execution logic ...

  await saveAgentRun({
    run_id: runId,
    user_id: userId,
    timestamp: new Date(),
    input: userIntent,
    agent_status: 'COMPLETED',
    tools_called: toolsCalled,
    reasoning: reasoning,
    proposal: proposal,
    evidence_links: evidenceLinks,
    duration_ms: Date.now() - startTime,
    created_at: new Date(),
  });
} catch (error) {
  await saveAgentRun({
    run_id: runId,
    user_id: userId,
    timestamp: new Date(),
    input: userIntent,
    agent_status: 'ERROR',
    tools_called: [],
    reasoning: { technical_signals: [], trend_analysis: '', sentiment: '', risk_factors: [] },
    evidence_links: [],
    error: error.message,
    duration_ms: Date.now() - startTime,
    created_at: new Date(),
  });
}
```

### Fetching Agent Runs (Admin View)
```typescript
import { getAgentRunsByUser, getAgentStats } from '@/lib/mongodb/queries';

// Get specific user's runs
const userRuns = await getAgentRunsByUser(userId, 20);

// Get aggregated stats
const stats = await getAgentStats(new Date(Date.now() - 24 * 60 * 60 * 1000)); // Last 24h
console.log(stats);
// {
//   total_runs: 45,
//   runs_with_proposals: 38,
//   average_confidence: 0.73,
//   unique_users: 12
// }
```

### Using Market Data Cache
```typescript
import { getCachedMarketData, saveCachedMarketData } from '@/lib/mongodb/queries';

const symbol = 'AAPL';
let marketData = await getCachedMarketData(symbol);

if (!marketData) {
  // Cache miss - fetch from API
  const freshData = await fetchFromYahooFinance(symbol);
  
  await saveCachedMarketData({
    symbol: symbol,
    timestamp: new Date(),
    source: 'yahoo_finance',
    data: freshData.raw,
    processed: freshData.processed,
    expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
  });
  
  marketData = freshData;
}
```

---

## ⚠️ Important Notes

### DO:
- ✅ Use query functions from `queries.ts` for all operations
- ✅ Save every agent run for compliance and debugging
- ✅ Use the cache for market data to reduce API calls
- ✅ Run `setup-mongodb.ts` after setting up MongoDB
- ✅ Handle connection errors gracefully

### DON'T:
- ❌ Expose `MONGODB_URI` to the frontend
- ❌ Store sensitive user data in MongoDB (use Supabase instead)
- ❌ Skip saving agent runs (required for audit trail)
- ❌ Cache market data for more than 15 minutes
- ❌ Use MongoDB for relational data (use Supabase)

---

## 🐛 Troubleshooting

### Issue: "MongoServerError: E11000 duplicate key error"
**Solution**: Duplicate `run_id` or violating unique index. Ensure `run_id` is unique (use `uuidv4()`).

### Issue: "MONGODB_URI is not defined"
**Solution**: Add `MONGODB_URI` and `MONGODB_DB_NAME` to `.env.local`.

### Issue: "connect ECONNREFUSED"
**Solution**: MongoDB server is not running or URI is incorrect. Check MongoDB connection string.

### Issue: "Cache always misses"
**Solution**: Check that `expires_at` is set correctly and TTL index exists (`npm run setup:mongo`).

---

## 📊 Performance Considerations

### Agent Runs
- **Write Performance**: ~10ms per insert
- **Query Performance**: ~50ms for 100 runs
- **Storage**: ~10MB per 1000 runs
- **Recommendation**: Archive runs older than 90 days

### Market Data Cache
- **Cache Hit Rate**: ~80% (typical)
- **Cache Miss Penalty**: ~500ms (Yahoo Finance API call)
- **Storage**: ~5MB per 1000 cached entries
- **Auto-Cleanup**: TTL index removes expired data

---

## 📚 Related Documentation
- [MongoDB Node.js Driver Docs](https://docs.mongodb.com/drivers/node/)
- [MongoDB TTL Indexes](https://docs.mongodb.com/manual/core/index-ttl/)
- Atlas Setup Guide: `/Knowledge/001_SETUP.md`
- Agent Implementation: `/Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md`

---

**Last Updated**: 2026-01-22
