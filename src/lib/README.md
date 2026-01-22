# Atlas Service Library

This directory contains all external service integrations and shared utilities for the Atlas trading platform. Each service is organized into its own folder with a clear, modular structure.

## 📁 Directory Structure

```
src/lib/
├── clerk/              # Clerk authentication service
├── supabase/          # Supabase (PostgreSQL) database service
├── mongodb/           # MongoDB (agent traces & cache) service
├── gemini/            # Google Gemini AI agent service
├── yahoofinance/      # Yahoo Finance market data service
└── shared/            # Shared utilities and helpers
```

## 🔧 Service Overview

### 🔐 Clerk (`/clerk`)
**Purpose**: User authentication and identity management

**Key Files**:
- `client.ts` - Client-side auth hooks (`useAuth`, `useUser`)
- `server.ts` - Server-side auth functions (`auth()`, `currentUser()`)
- `types.ts` - Clerk user type definitions
- `utils.ts` - User formatting and display helpers

**When to Use**: Authentication checks, user data access, protected routes

---

### 🗄️ Supabase (`/supabase`)
**Purpose**: PostgreSQL database for user profiles, orders, positions, and audit logs

**Key Files**:
- `client.ts` - Anonymous Supabase client
- `admin.ts` - Admin client with service role + JWT auth
- `models.ts` - TypeScript interfaces for all database tables
- `queries.ts` - Database query functions (CRUD operations)
- `permissions.ts` - Role-based access control (RBAC) functions
- `migrations/` - SQL migration files

**When to Use**: Storing/fetching user data, orders, positions, watchlists, audit logs

---

### 🍃 MongoDB (`/mongodb`)
**Purpose**: NoSQL storage for agent run traces and market data cache

**Key Files**:
- `client.ts` - MongoDB connection and database access
- `models.ts` - TypeScript interfaces for MongoDB collections
- `collections.ts` - Collection accessor functions
- `queries.ts` - MongoDB query operations (agent runs, cache)
- `setup-mongodb.ts` - Initialization script for indexes

**When to Use**: Agent reasoning traces, market data caching (15-min TTL)

---

### 🤖 Gemini (`/gemini`)
**Purpose**: Google Gemini AI agent for market analysis and trade proposals

**Key Files**:
- `client.ts` - Gemini AI client initialization
- `agent.ts` - Orchestrator agent (Think → Act → Observe loop)
- `tools.ts` - Agent tool definitions and execution
- `prompts.ts` - System prompts and agent instructions
- `types.ts` - Agent response types

**When to Use**: Running AI analysis, generating trade proposals, agent reasoning

---

### 📊 Yahoo Finance (`/yahoofinance`)
**Purpose**: Real-time and historical market data fetching

**Key Files**:
- `client.ts` - Yahoo Finance client instance
- `fetcher.ts` - Market data fetching with caching
- `types.ts` - Market data type definitions
- `utils.ts` - Technical indicator calculations (RSI, MACD, MA)

**When to Use**: Fetching stock quotes, technical indicators, price history

---

### 🛠️ Shared (`/shared`)
**Purpose**: Common utilities used across the entire application

**Key Files**:
- `utils.ts` - Formatting, date/time, styling utilities
- `constants.ts` - Application-wide constants
- `errors.ts` - Custom error classes and error handling

**When to Use**: Formatting currency, dates, percentages; styling helpers; error handling

---

## 🔄 Data Flow Example

Here's how a typical agent analysis request flows through the services:

```
1. User Input (frontend)
   ↓
2. /api/agent/analyze (API route)
   ↓
3. Gemini Agent (src/lib/gemini/agent.ts)
   ├── Extract symbol → Yahoo Finance (src/lib/yahoofinance/fetcher.ts)
   │   ├── Check MongoDB cache (src/lib/mongodb/queries.ts)
   │   └── If miss → Fetch from Yahoo Finance API
   ├── Analyze technicals → Yahoo Finance utils
   └── Generate proposal → Gemini AI
   ↓
4. Save agent run → MongoDB (src/lib/mongodb/queries.ts)
   ↓
5. Create order → Supabase (src/lib/supabase/queries.ts)
   ↓
6. Return proposal to frontend
```

## 🔑 Environment Variables

Each service requires specific environment variables. See `env.template` in the root directory for the complete list.

### Quick Reference:
- **Clerk**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`
- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **MongoDB**: `MONGODB_URI`, `MONGODB_DB_NAME`
- **Gemini**: `GOOGLE_AI_API_KEY`
- **Yahoo Finance**: (No API key required for basic usage)

## 📚 Usage Guidelines

### ✅ DO:
- Import from specific service files (e.g., `@/lib/supabase/queries`)
- Use server-side functions in API routes and server components
- Use client-side hooks in client components only
- Handle errors with try-catch blocks
- Log important operations with descriptive messages

### ❌ DON'T:
- Mix server and client code in the same file
- Expose service role keys or admin clients to the frontend
- Skip authentication checks in API routes
- Use `any` types (prefer `unknown` for error handling)
- Bypass RBAC functions (use `requireAuth`, `requireAdmin`, etc.)

## 🧪 Testing

Each service folder should have its own test file (future implementation):

```
src/lib/
├── clerk/__tests__/
├── supabase/__tests__/
├── mongodb/__tests__/
├── gemini/__tests__/
├── yahoofinance/__tests__/
└── shared/__tests__/
```

## 📖 Documentation

Each service folder contains its own `README.md` with:
- Service purpose and overview
- File structure and descriptions
- Usage examples
- Common patterns and best practices
- Troubleshooting tips

## 🚀 Getting Started

1. **Read the service-specific READMEs** in each folder for detailed documentation
2. **Check the Knowledge folder** (`/Knowledge`) for setup guides and architectural decisions
3. **Review the main README** in the root directory for project overview
4. **Explore the code** - each file is well-commented with TSDoc

## 🆘 Need Help?

- **Setup Issues**: See `/Knowledge/001_SETUP.md`
- **Quick Start**: See `/Knowledge/002_QUICK_START.md`
- **Phase 2 (Agent)**: See `/Knowledge/007_FRIDAY_DEMO_IMPLEMENTATION.md`
- **Design System**: See `/Knowledge/003_DESIGN_SYSTEM.md`

---

**Last Updated**: 2026-01-22
**Maintained by**: Atlas Development Team
