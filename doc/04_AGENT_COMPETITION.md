# Frontend: AI Agent Competition Landing Page

## Overview

Public landing page showcasing the live AI agent trading competition. Displays real-time performance, leaderboard, portfolios, and explainable AI reasoning.

**Route:** `/competition`

## Components

### 1. Performance Chart (`PerformanceChart.tsx`)

Interactive line chart showing equity progression over time.

**Features:**
- Multi-line chart (4 agents, different colors)
- Time range selector (7D, 30D, 90D)
- Auto-updates from API
- Responsive design using Recharts
- Formatted tooltips with currency display

**Data Source:** `GET /api/v1/competition/performance?days=30`

### 2. Leaderboard (`Leaderboard.tsx`)

Real-time rankings of all competing agents.

**Features:**
- Medal emojis for top 3 (🥇🥈🥉)
- Live equity values
- Total return % with trending indicators
- Win rate and trade count
- Auto-refreshes every 30 seconds
- Special styling for #1 position

**Data Source:** `GET /api/v1/competition/leaderboard`

### 3. Agent Card (`AgentCard.tsx`)

Detailed card for each competing agent with expandable portfolio view.

**Features:**
- Current equity and returns
- Performance metrics (Sharpe ratio, max drawdown, win rate)
- Color-coded model badges
- Expandable portfolio section
- Position details (symbol, quantity, P&L)
- Real-time market values

**Data Sources:**
- `GET /api/v1/competition/competitors` (agent details)
- `GET /api/v1/competition/portfolio/{id}` (on expand)

### 4. Reasoning Panel (`ReasoningPanel.tsx`)

Explainable AI panel showing agent decision-making process.

**Features:**
- Agent selector dropdown
- Reasoning type filter (all, market_analysis, risk_assessment, decision)
- Color-coded reasoning cards
- Icon indicators per type
- Timestamps for each reasoning record
- Scrollable history (last 10 entries)

**Data Source:** `GET /api/v1/competition/reasoning/{id}?reasoning_type={type}`

## API Client

**File:** `src/lib/api/competition.ts`

All functions use the `NEXT_PUBLIC_API_URL` environment variable (defaults to `http://localhost:8000`).

### Available Functions:

```typescript
getLeaderboard(): Promise<LeaderboardEntry[]>
getPerformanceData(days: number): Promise<DailyPerformance[]>
getCompetitors(): Promise<Competitor[]>
getAgentPortfolio(competitorId: string): Promise<Position[]>
getAgentTrades(competitorId: string, limit: number): Promise<Trade[]>
getAgentReasoning(competitorId: string, reasoningType?: string, limit: number): Promise<Reasoning[]>
```

## Page Layout

**File:** `app/competition/page.tsx`

**Structure:**
1. **Hero Section** - Title, description, feature badges
2. **Performance Chart** - Full-width time-series chart
3. **Grid Layout:**
   - **Left (1/3):** Leaderboard
   - **Right (2/3):** Agent Cards (4 cards)
4. **Explainable AI Panel** - Full-width reasoning viewer
5. **Info Section** - "How It Works" and "Explainable AI" details

## Styling

**Theme Integration:**
- Uses Tailwind CSS with dark mode support
- shadcn/ui components for consistency
- Custom color schemes per agent:
  - Gemini 3 Flash: Blue (#3b82f6)
  - Gemini 3 Pro: Purple (#8b5cf6)
  - Gemini 2.5 Flash: Green (#10b981)
  - Gemini 2.5 Pro: Orange (#f59e0b)

## Environment Variables

**Required in `.env.local`:**

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production (Vercel):
```bash
NEXT_PUBLIC_API_URL=https://your-backend.render.com
```

## Navigation

**Home Page Header:** Added "🏆 AI Competition" link in navbar

## Testing Locally

1. **Start Backend:**
   ```bash
   cd atlas-backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend:**
   ```bash
   cd atlas-frontend
   npm run dev
   ```

3. **Visit:** http://localhost:3000/competition

4. **Seed Data (if empty):**
   ```bash
   # Backend must deploy migration 002 first
   curl -X POST http://localhost:8000/api/v1/jobs/run-competition-dev
   ```

## Error Handling

All components include:
- Loading states (animated spinners)
- Error messages with retry buttons
- Empty state handling
- Type-safe API responses

## Deployment Notes

### Vercel (Frontend)
1. Set `NEXT_PUBLIC_API_URL` to production backend URL
2. Deploy from `atlas-frontend` directory
3. Competition page is public (no authentication)

### Backend Integration
- Competition endpoints must be deployed
- Database migration 002 must be applied
- Backend scheduler should be running for daily updates

## Future Enhancements

Potential additions:
1. Trade history timeline per agent
2. Real-time WebSocket updates
3. Agent comparison view (side-by-side)
4. Performance metrics deep dive
5. Export data as CSV
6. Share competition results on social media
