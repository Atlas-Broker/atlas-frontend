# Gemini AI Agent Service

This folder contains all Google Gemini AI agent utilities for market analysis and trade proposal generation.

## 📁 File Structure

```
gemini/
├── client.ts      # Gemini AI client initialization
├── agent.ts       # Orchestrator agent (Think → Act → Observe loop)
├── tools.ts       # Agent tool definitions and execution
├── prompts.ts     # System prompts and agent instructions
├── types.ts       # Agent response types
└── README.md      # This file
```

## 📄 File Descriptions

### `client.ts`
**Purpose**: Initialize and export Gemini AI client

**Exports**:
- `geminiModel` - Configured Gemini model instance (`gemini-2.0-flash-exp`)

**Usage**:
```typescript
import { geminiModel } from '@/lib/gemini/client';

const result = await geminiModel.generateContent(prompt);
console.log(result.response.text());
```

**Model**: Currently uses `gemini-2.0-flash-exp` (fast, experimental)

**When to Use**: Direct model access (prefer `agent.ts` for standard workflows)

---

### `agent.ts`
**Purpose**: Main orchestrator agent that coordinates the Think → Act → Observe loop

**Exports**:
- `runOrchestratorAgent(input)` - Execute full agent workflow

**Input Interface**:
```typescript
{
  userId: string;       // Clerk user ID
  userIntent: string;   // User's request (e.g., "Should I buy NVDA?")
  runId?: string;       // Optional - generated if not provided
}
```

**Output Interface**:
```typescript
{
  runId: string;
  status: 'ANALYZING' | 'PROPOSING' | 'COMPLETED' | 'ERROR';
  reasoning: AgentReasoning;
  proposal?: TradeProposal;
  evidence_links: string[];
  tools_called: ToolCall[];
  raw_trace: {
    user_intent: string;
    agent_response: string;
    tool_calls: ToolCall[];
    processing_time_ms: number;
  };
  error?: string;
}
```

**Agent Workflow**:
1. **Extract Symbol**: Parse ticker from user intent (e.g., "NVDA" from "Should I buy NVDA?")
2. **Fetch Market Data**: Call `get_market_data` tool → Yahoo Finance (with caching)
3. **Analyze Technicals**: Call `analyze_technicals` tool → RSI, MACD, trends, risks
4. **Generate Reasoning**: Use Gemini to analyze data and generate structured reasoning
5. **Propose Trade**: Generate BUY/SELL/HOLD recommendation with confidence
6. **Save Trace**: Store complete execution trace in MongoDB
7. **Return Result**: Send proposal back to API route

**Usage**:
```typescript
import { runOrchestratorAgent } from '@/lib/gemini/agent';

const result = await runOrchestratorAgent({
  userId: clerkUserId,
  userIntent: "Should I buy NVDA?"
});

console.log(result.proposal);
// {
//   action: 'BUY',
//   symbol: 'NVDA',
//   quantity: 10,
//   entry_price: 485.23,
//   stop_loss: 460.97,
//   target_price: 533.75,
//   confidence: 0.78,
//   holding_window: '3-7 days'
// }
```

**Error Handling**: Catches all errors, logs to MongoDB with `ERROR` status, returns error response

**When to Use**: All agent analysis requests from `/api/agent/analyze`

---

### `tools.ts`
**Purpose**: Define and execute agent tools

**Exports**:
- `tools` - Array of tool definitions (for documentation)
- `extractSymbol(intent)` - Extract stock symbol from user intent
- `callTool(toolName, params)` - Execute a specific tool

**Available Tools**:

#### `get_market_data`
Fetches current market data for a stock symbol

**Parameters**: `{ symbol: string }`

**Returns**:
```typescript
{
  current_price: number;
  change_percent: number;
  volume: number;
  indicators: {
    rsi: number;
    macd: { value, signal, histogram };
    moving_averages: { ma_50, ma_200 };
  };
  price_history: {
    daily_high, daily_low,
    week_52_high, week_52_low
  };
  symbol: string;
}
```

#### `analyze_technicals`
Analyzes technical indicators and generates signals

**Parameters**: `{ symbol: string }`

**Returns**:
```typescript
{
  technical_signals: string[];  // e.g., "RSI oversold at 28.3"
  trend_analysis: string;       // e.g., "Strong uptrend - multiple bullish indicators"
  sentiment: string;            // e.g., "Positive - strong upward momentum today"
  risk_factors: string[];       // e.g., "High intraday volatility (>5% range)"
}
```

**Symbol Extraction**:
```typescript
extractSymbol("Should I buy NVDA?")  // → "NVDA"
extractSymbol("What about nvidia?")  // → "NVDA" (company name mapping)
extractSymbol("Is AAPL a good buy?") // → "AAPL"
```

**Company Name Mapping**:
- nvidia → NVDA
- apple → AAPL
- tesla → TSLA
- microsoft → MSFT
- amazon → AMZN
- google → GOOGL
- meta / facebook → META
- netflix → NFLX

**Usage**:
```typescript
import { callTool, extractSymbol } from '@/lib/gemini/tools';

const symbol = extractSymbol("Should I buy nvidia?"); // "NVDA"

const marketData = await callTool('get_market_data', { symbol });
console.log(marketData.result.current_price);

const analysis = await callTool('analyze_technicals', { symbol });
console.log(analysis.result.technical_signals);
```

**When to Use**: Agent tool execution (called automatically by orchestrator)

---

### `prompts.ts`
**Purpose**: System prompts and agent instructions

**Exports**:
- `ATLAS_SYSTEM_PROMPT` - Core agent instruction prompt

**Prompt Structure**:
1. **Core Principles**: Never execute trades, always explain reasoning, provide confidence
2. **Capabilities**: Market data analysis, technical indicators, trend assessment, risk identification
3. **Response Format**: Structured output with technical signals, trend analysis, sentiment, risks, proposal
4. **Important Notes**: HOLD recommendations when conditions aren't favorable, specific numbers, cite indicators

**Example Response Format**:
```
1. **Technical Signals**: RSI oversold at 28.3, MACD bullish crossover
2. **Trend Analysis**: Strong uptrend - price above 50-day MA
3. **Sentiment**: Positive - strong upward momentum today
4. **Risk Factors**: High intraday volatility (>5% range)
5. **Proposal**:
   - Action: BUY
   - Quantity: 10
   - Entry Price: $485.23
   - Stop Loss: $460.97
   - Target Price: $533.75
   - Confidence: 0.78
   - Holding Window: 3-7 days
```

**When to Use**: Initial agent setup, prompt engineering experiments

---

### `types.ts`
**Purpose**: TypeScript types for agent responses

**Exports**:
- `GeminiAgentResponse` - Structured agent response
- `GeminiToolCall` - Re-export of MongoDB `ToolCall` type

**When to Use**: Type annotations for agent functions

---

## 🤖 Agent Architecture

### Think → Act → Observe Loop

```
┌─────────────────────────────────────────────────────────────┐
│ 1. THINK (Extract Intent)                                   │
│    - Parse user input                                       │
│    - Extract stock symbol                                   │
│    - Determine required tools                               │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. ACT (Execute Tools)                                      │
│    - Call get_market_data tool                              │
│    - Call analyze_technicals tool                           │
│    - (Future: check_sentiment tool)                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. OBSERVE (Generate Reasoning)                             │
│    - Send context to Gemini AI                              │
│    - Parse structured response                              │
│    - Generate trade proposal                                │
│    - Calculate confidence score                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. STORE (Save Trace)                                       │
│    - Log all tool calls                                     │
│    - Save reasoning to MongoDB                              │
│    - Store proposal for approval                            │
└─────────────────────────────────────────────────────────────┘
```

### Agent Capabilities

**✅ What the Agent CAN do**:
- Analyze real-time market data
- Evaluate technical indicators (RSI, MACD, MAs)
- Identify trends and momentum
- Assess risks and volatility
- Propose swing trades with reasoning
- Provide confidence scores
- Cite evidence sources

**❌ What the Agent CANNOT do**:
- Execute trades (human approval required)
- Access live trading accounts
- Make financial decisions autonomously
- Guarantee returns or accuracy

### Human-in-the-Loop Boundary

```
Agent Proposes        Human Decides        System Executes
─────────────────     ─────────────────    ─────────────────
• Analyze market      • Review proposal    • Submit order
• Generate trade      • Check reasoning    • Track execution
• Explain logic       • Approve/reject     • Update positions
• Provide evidence    • Modify params      • Log audit trail
```

---

## 🛠️ Common Patterns

### Running Agent Analysis
```typescript
import { runOrchestratorAgent } from '@/lib/gemini/agent';

export async function POST(request: Request) {
  const { userIntent } = await request.json();
  const { userId } = auth(); // Clerk
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const result = await runOrchestratorAgent({
      userId,
      userIntent
    });
    
    // If proposal exists, create order in Supabase
    if (result.proposal) {
      await createOrder({
        user_id: userId,
        symbol: result.proposal.symbol,
        side: result.proposal.action.toLowerCase(),
        quantity: result.proposal.quantity,
        order_type: 'market',
        status: 'proposed',
        agent_run_id: result.runId,
        confidence_score: result.proposal.confidence,
        // ... other fields
      });
    }
    
    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### Approving a Proposed Trade
```typescript
import { updateOrder, createAuditLog } from '@/lib/supabase/queries';

export async function POST(request: Request) {
  const { orderId } = await request.json();
  const { userId } = auth();
  
  const order = await updateOrder(orderId, {
    status: 'approved',
    approved_at: new Date().toISOString(),
    approved_by: userId,
  });
  
  await createAuditLog({
    user_id: userId,
    action: 'trade_approved',
    resource_type: 'order',
    resource_id: orderId,
    metadata: { agent_run_id: order.agent_run_id },
  });
  
  return Response.json({ success: true });
}
```

---

## ⚠️ Important Notes

### DO:
- ✅ Always save agent runs to MongoDB (compliance requirement)
- ✅ Include confidence scores in proposals
- ✅ Cite evidence sources (Yahoo Finance links)
- ✅ Handle errors gracefully and log them
- ✅ Use market data caching to reduce API calls

### DON'T:
- ❌ Let the agent execute trades without approval
- ❌ Skip saving agent traces (audit requirement)
- ❌ Expose `GOOGLE_AI_API_KEY` to the frontend
- ❌ Trust agent proposals blindly (human review required)
- ❌ Use agent for day trading (designed for swing trading)

---

## 🐛 Troubleshooting

### Issue: "GOOGLE_AI_API_KEY is not defined"
**Solution**: Add `GOOGLE_AI_API_KEY` to `.env.local`. Get key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Issue: "Could not identify a stock symbol"
**Solution**: User intent doesn't contain a recognizable ticker or company name. Update `extractSymbol()` in `tools.ts`.

### Issue: "Agent always returns HOLD"
**Solution**: Market conditions may be unfavorable. Check reasoning in agent trace for explanation.

### Issue: "Rate limit exceeded"
**Solution**: Gemini API rate limit hit. Implement rate limiting or upgrade API quota.

---

## 📊 Performance

### Typical Agent Run
- **Duration**: 3-5 seconds
- **API Calls**: 
  - 1x Yahoo Finance (if cache miss)
  - 1x Gemini AI
- **Token Usage**: ~2000-3000 tokens per run
- **Cost**: ~$0.002 per run (Gemini Flash)

### Optimization Tips
1. **Use Market Data Caching**: Reduces Yahoo Finance API calls by ~80%
2. **Batch Requests**: Process multiple symbols in parallel
3. **Streaming**: Use Gemini streaming for faster perceived response time
4. **Prompt Optimization**: Shorter prompts = faster responses

---

## 📚 Related Documentation
- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Gemini 2.0 Flash Exp](https://ai.google.dev/models/gemini)
- Atlas Agent Implementation: `/Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md`
- Atlas Setup Guide: `/Knowledge/001_SETUP.md`

---

**Last Updated**: 2026-01-22
