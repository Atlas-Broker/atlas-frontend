# Supabase Database Service

This folder contains all Supabase (PostgreSQL) database utilities for the Atlas platform.

## 📁 File Structure

```
supabase/
├── client.ts          # Anonymous Supabase client
├── admin.ts           # Admin client with service role + JWT auth
├── models.ts          # TypeScript interfaces for all database tables
├── queries.ts         # Database query functions (CRUD operations)
├── permissions.ts     # Role-based access control (RBAC) functions
├── migrations/        # SQL migration files
│   ├── 001_initial_schema.sql
│   ├── 002_agent_fields.sql
│   └── README.md
└── README.md          # This file
```

## 📄 File Descriptions

### `client.ts`
**Purpose**: Anonymous Supabase client for public operations

**Exports**:
- `supabase` - Supabase client with anon key

**Usage**:
```typescript
import { supabase } from '@/lib/supabase/client';

// Public read operations
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId);
```

**When to Use**: Public data access (limited by RLS policies)

---

### `admin.ts`
**Purpose**: Admin Supabase client with service role key and JWT authentication

**Exports**:
- `getSupabaseClientWithAuth()` - Client with Clerk JWT (for user-specific RLS)
- `supabaseAdmin` - Admin client with service role (bypasses RLS)
- `getSupabaseAdmin()` - Getter for admin client

**Usage**:
```typescript
import { getSupabaseClientWithAuth, supabaseAdmin } from '@/lib/supabase/admin';

// User-specific queries (RLS enforced based on JWT)
const supabase = await getSupabaseClientWithAuth();
const { data } = await supabase.from('orders').select('*');

// Admin queries (bypasses RLS - use with caution)
const { data: allUsers } = await supabaseAdmin
  .from('profiles')
  .select('*');
```

**When to Use**:
- `getSupabaseClientWithAuth()` - User-specific operations with RLS
- `supabaseAdmin` - Admin operations, data aggregation, seeding

---

### `models.ts`
**Purpose**: TypeScript interfaces for all database tables and types

**Key Types**:
- `UserRole`: `'trader' | 'admin' | 'superadmin'`
- `EnvironmentType`: `'paper' | 'live'`
- `OrderSide`: `'buy' | 'sell' | 'short' | 'cover'`
- `OrderType`: `'market' | 'limit' | 'stop' | 'stop_limit'`
- `OrderStatus`: `'proposed' | 'approved' | 'submitted' | 'filled' | 'rejected' | 'cancelled' | 'failed'`

**Key Interfaces**:
- `Profile` - User profile (links to Clerk)
- `TraderSettings` - User risk preferences and limits
- `Watchlist` - User stock watchlists
- `Order` - Complete order record
- `Position` - Current holdings
- `AuditLog` - Activity tracking

**Insert/Update Types**:
- `InsertProfile`, `UpdateProfile`
- `InsertTraderSettings`, `UpdateTraderSettings`
- `InsertOrder`, `UpdateOrder`
- etc.

**Usage**:
```typescript
import type { Order, InsertOrder, OrderStatus } from '@/lib/supabase/models';

const newOrder: InsertOrder = {
  user_id: profile.id,
  symbol: 'NVDA',
  side: 'buy',
  quantity: 10,
  order_type: 'market',
  // ... other fields
};
```

**When to Use**: Type annotations for database operations

---

### `queries.ts`
**Purpose**: Database query functions for all CRUD operations

**Profile Queries**:
- `getProfileByClerkId(clerkId)` - Fetch profile by Clerk ID
- `getProfileById(id)` - Fetch profile by Supabase ID
- `createProfile(data)` - Create new profile
- `updateProfile(clerkId, data)` - Update profile
- `getAllUsers()` - Fetch all profiles (admin only)

**Trader Settings Queries**:
- `getTraderSettings(userId)` - Fetch user settings
- `createTraderSettings(data)` - Create settings
- `updateTraderSettings(userId, data)` - Update settings

**Watchlist Queries**:
- `getUserWatchlists(userId)` - Fetch user watchlists
- `createWatchlist(data)` - Create watchlist

**Order Queries**:
- `getUserOrders(userId, filters?)` - Fetch user orders
- `getAllOrders(filters?)` - Fetch all orders (admin)
- `createOrder(data)` - Create order
- `updateOrder(orderId, data)` - Update order

**Position Queries**:
- `getUserPositions(userId, environment)` - Fetch user positions

**Audit Log Queries**:
- `createAuditLog(log)` - Create audit log entry
- `getRecentAuditLogs(limit)` - Fetch recent logs

**Usage**:
```typescript
import { getUserOrders, createOrder } from '@/lib/supabase/queries';

// Fetch orders
const orders = await getUserOrders(userId, { 
  status: 'filled',
  limit: 10 
});

// Create order
const newOrder = await createOrder({
  user_id: userId,
  symbol: 'AAPL',
  side: 'buy',
  quantity: 5,
  order_type: 'market',
  // ... other fields
});
```

**When to Use**: All database operations (prefer these over raw queries)

---

### `permissions.ts`
**Purpose**: Role-based access control (RBAC) and user profile management

**Core Functions**:
- `getUserProfile()` - Get current user's profile (auto-creates if missing)
- `isAdmin()` - Check if current user is admin or superadmin
- `isSuperAdmin()` - Check if current user is superadmin
- `isTrader()` - Check if current user is trader
- `getUserRole()` - Get current user's role
- `requireAuth()` - Require authentication (throws if not signed in)
- `requireAdmin()` - Require admin role (throws if not admin)
- `requireSuperAdmin()` - Require superadmin role (throws if not superadmin)
- `canAccessResource(resourceUserId, allowAdminAccess?)` - Check resource access

**Usage**:
```typescript
// In API routes
import { requireAuth, requireAdmin } from '@/lib/supabase/permissions';

export async function POST(request: Request) {
  const profile = await requireAuth(); // Throws if not authenticated
  // ... proceed with logic
}

export async function DELETE(request: Request) {
  const profile = await requireAdmin(); // Throws if not admin
  // ... admin-only logic
}

// In server components
import { getUserProfile, isAdmin } from '@/lib/supabase/permissions';

export default async function Page() {
  const profile = await getUserProfile();
  const hasAdminAccess = await isAdmin();
  
  return (
    <div>
      <p>Welcome, {profile?.full_name}</p>
      {hasAdminAccess && <AdminPanel />}
    </div>
  );
}
```

**Auto-Profile Creation**:
- `getUserProfile()` automatically creates a profile if it doesn't exist
- Syncs email and name from Clerk
- Creates default `trader_settings` and `watchlists`
- Handles race conditions and duplicate key errors

**When to Use**: Authentication checks, role-based rendering, protected routes

---

## 🗄️ Database Schema

### Tables

#### `profiles`
User profiles linked to Clerk accounts

| Column       | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | uuid      | Primary key                          |
| clerk_id     | text      | Clerk user ID (unique)               |
| email        | text      | User email                           |
| full_name    | text      | User full name                       |
| role         | user_role | trader / admin / superadmin          |
| is_active    | boolean   | Account status                       |
| created_at   | timestamp | Creation timestamp                   |
| updated_at   | timestamp | Last update timestamp                |

#### `trader_settings`
User risk preferences and trading limits

| Column                   | Type      | Description                          |
|--------------------------|-----------|--------------------------------------|
| id                       | uuid      | Primary key                          |
| user_id                  | uuid      | Foreign key → profiles(id)           |
| autonomy_level           | smallint  | 0-3 (Observer → Full Auto)           |
| max_concurrent_positions | integer   | Max open positions                   |
| max_daily_orders         | integer   | Max orders per day                   |
| max_position_size_usd    | numeric   | Max $ per position                   |
| allow_shorting           | boolean   | Allow short selling                  |
| allow_margin             | boolean   | Allow margin trading                 |
| trading_hours            | text      | 'regular' or 'extended'              |

#### `watchlists`
User stock watchlists

| Column     | Type      | Description                          |
|------------|-----------|--------------------------------------|
| id         | uuid      | Primary key                          |
| user_id    | uuid      | Foreign key → profiles(id)           |
| name       | text      | Watchlist name                       |
| symbols    | text[]    | Array of ticker symbols              |
| is_active  | boolean   | Active status                        |

#### `orders`
Order records (proposed, approved, executed)

| Column            | Type         | Description                          |
|-------------------|--------------|--------------------------------------|
| id                | uuid         | Primary key                          |
| user_id           | uuid         | Foreign key → profiles(id)           |
| symbol            | text         | Stock ticker                         |
| side              | order_side   | buy / sell / short / cover           |
| quantity          | integer      | Number of shares                     |
| order_type        | order_type   | market / limit / stop / stop_limit   |
| limit_price       | numeric      | Limit price (if applicable)          |
| stop_price        | numeric      | Stop price (if applicable)           |
| status            | order_status | Order status                         |
| environment       | environment  | paper / live                         |
| broker_order_id   | text         | External broker order ID             |
| filled_price      | numeric      | Execution price                      |
| filled_at         | timestamp    | Execution time                       |
| agent_reasoning   | jsonb        | Agent reasoning (if AI-generated)    |
| confidence_score  | numeric      | AI confidence (0-1)                  |
| agent_run_id      | text         | MongoDB agent run ID                 |
| reasoning_summary | text         | Summary of reasoning                 |
| evidence_links    | text[]       | External evidence links              |
| proposed_at       | timestamp    | Proposal time                        |
| approved_at       | timestamp    | Approval time                        |
| approved_by       | uuid         | Approver user ID                     |

#### `positions`
Current holdings

| Column          | Type         | Description                          |
|-----------------|--------------|--------------------------------------|
| id              | uuid         | Primary key                          |
| user_id         | uuid         | Foreign key → profiles(id)           |
| symbol          | text         | Stock ticker                         |
| quantity        | integer      | Number of shares                     |
| avg_entry_price | numeric      | Average entry price                  |
| current_price   | numeric      | Current market price                 |
| unrealized_pnl  | numeric      | Unrealized profit/loss               |
| environment     | environment  | paper / live                         |
| opened_at       | timestamp    | Position open time                   |

#### `audit_logs`
Activity tracking for compliance

| Column        | Type      | Description                          |
|---------------|-----------|--------------------------------------|
| id            | uuid      | Primary key                          |
| user_id       | uuid      | User who performed action            |
| actor_id      | uuid      | Actor (if different from user)       |
| action        | text      | Action type                          |
| resource_type | text      | Resource type (order, position, etc.)|
| resource_id   | uuid      | Resource ID                          |
| metadata      | jsonb     | Additional context                   |
| ip_address    | text      | IP address                           |
| user_agent    | text      | User agent                           |
| created_at    | timestamp | Log timestamp                        |

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled with policies based on Clerk JWT:

### Profile Policies
- Users can read their own profile
- Service role can read/write all profiles

### Order Policies
- Users can read/create their own orders
- Admins can read all orders
- Service role has full access

### Position Policies
- Users can read their own positions
- Admins can read all positions

### Audit Log Policies
- Service role only (no user access)

**JWT Function**:
```sql
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS text AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    ''
  );
$$ LANGUAGE SQL STABLE;
```

This function extracts the `sub` claim (Clerk user ID) from the JWT token.

---

## 🛠️ Common Patterns

### Creating a Profile (Automatic)
```typescript
import { getUserProfile } from '@/lib/supabase/permissions';

// Automatically creates profile if it doesn't exist
const profile = await getUserProfile();
console.log(profile?.email, profile?.role);
```

### Creating an Order
```typescript
import { createOrder, createAuditLog } from '@/lib/supabase/queries';

const order = await createOrder({
  user_id: profile.id,
  symbol: 'TSLA',
  side: 'buy',
  quantity: 10,
  order_type: 'market',
  status: 'proposed',
  environment: 'paper',
  limit_price: null,
  stop_price: null,
  broker_order_id: null,
  filled_price: null,
  filled_at: null,
  agent_reasoning: null,
  confidence_score: null,
  agent_run_id: runId,
  reasoning_summary: 'AI analysis suggests strong buy',
  evidence_links: ['https://finance.yahoo.com/quote/TSLA'],
  proposed_at: new Date().toISOString(),
  approved_at: null,
  approved_by: null,
});

// Log to audit
await createAuditLog({
  user_id: profile.id,
  actor_id: profile.id,
  action: 'trade_proposed',
  resource_type: 'order',
  resource_id: order.id,
  metadata: { agent_run_id: runId },
  ip_address: null,
  user_agent: null,
});
```

### Updating an Order
```typescript
import { updateOrder } from '@/lib/supabase/queries';

const updatedOrder = await updateOrder(orderId, {
  status: 'approved',
  approved_at: new Date().toISOString(),
  approved_by: profile.id,
});
```

### Fetching Orders with Filters
```typescript
import { getUserOrders } from '@/lib/supabase/queries';

// Get filled orders
const filledOrders = await getUserOrders(userId, {
  status: 'filled',
  environment: 'paper',
  limit: 20,
});

// Get orders for specific symbol
const nvdaOrders = await getUserOrders(userId, {
  symbol: 'NVDA',
});
```

---

## ⚠️ Important Notes

### DO:
- ✅ Use query functions from `queries.ts` instead of raw SQL
- ✅ Always use `requireAuth()` or `getUserProfile()` in protected routes
- ✅ Log important actions to `audit_logs`
- ✅ Use `getSupabaseClientWithAuth()` for user-specific operations
- ✅ Handle errors with try-catch blocks

### DON'T:
- ❌ Expose `SUPABASE_SERVICE_ROLE_KEY` to the frontend
- ❌ Use `supabaseAdmin` for user-specific queries (bypasses RLS)
- ❌ Skip authentication checks in API routes
- ❌ Modify RLS policies without testing thoroughly
- ❌ Use raw SQL queries (prefer typed query functions)

---

## 🐛 Troubleshooting

### Issue: "profile doesn't exist"
**Solution**: `getUserProfile()` should auto-create. Check Clerk JWT template is configured correctly.

### Issue: "duplicate key value violates unique constraint"
**Solution**: Profile already exists. Use `updateProfile()` instead of `createProfile()`.

### Issue: "permission denied for table"
**Solution**: RLS policy is blocking access. Check that JWT is being passed correctly.

### Issue: "new row violates row-level security policy"
**Solution**: Trying to insert data that violates RLS. Ensure `user_id` matches JWT `sub` claim.

---

## 📚 Related Documentation
- [Supabase Docs](https://supabase.com/docs)
- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- Atlas Migrations: `./migrations/README.md`
- Atlas Setup Guide: `/Knowledge/001_SETUP.md`

---

**Last Updated**: 2026-01-22
