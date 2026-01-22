# Supabase Database Migrations

This folder contains SQL migration files for the Atlas database schema.

## 📁 Migration Files

```
migrations/
├── 001_initial_schema.sql   # Initial schema with Clerk JWT integration
├── 002_agent_fields.sql     # Agent-related fields for orders table
└── README.md                # This file
```

## 📄 Migration Descriptions

### `001_initial_schema.sql`
**Purpose**: Initial database schema creation with Clerk JWT integration

**What it creates**:

#### Custom Types
- `user_role` - trader | admin | superadmin
- `order_side` - buy | sell | short | cover
- `order_type` - market | limit | stop | stop_limit
- `order_status` - proposed | approved | submitted | filled | rejected | cancelled | failed
- `environment_type` - paper | live

#### Functions
- `clerk_user_id()` - Extract Clerk user ID from JWT token
- `is_service_role()` - Check if current role is service_role
- `update_updated_at_column()` - Trigger function to auto-update updated_at

#### Tables
- `profiles` - User profiles linked to Clerk
- `trader_settings` - User risk preferences and trading limits
- `watchlists` - User stock watchlists
- `orders` - Order records (proposed, approved, executed)
- `positions` - Current holdings
- `audit_logs` - Activity tracking for compliance

#### Row Level Security (RLS)
- Policies for user-specific data access
- Admin override policies
- Service role policies

#### Indexes
- `clerk_id` (profiles) - For user lookups
- `user_id` (all tables) - For user-specific queries
- `symbol` (orders, positions) - For symbol-specific queries
- `status` (orders) - For order status filtering
- `environment` (orders, positions) - For paper/live filtering

**When to run**: First-time database setup

---

### `002_agent_fields.sql`
**Purpose**: Extend orders table with agent-related fields

**What it adds**:

#### New Columns (orders table)
- `agent_run_id` (text) - MongoDB agent run ID
- `confidence_score` (numeric) - AI confidence (0-1)
- `reasoning_summary` (text) - Summary of AI reasoning
- `evidence_links` (text[]) - External evidence links (e.g., Yahoo Finance)
- `proposed_at` (timestamp) - When agent proposed the trade
- `approved_at` (timestamp) - When user approved the trade
- `approved_by` (uuid) - User who approved the trade

#### New Audit Log Actions
- `agent_analysis_requested`
- `trade_proposed`
- `trade_approved`
- `trade_rejected`

**When to run**: After implementing AI agent features (Phase 2)

---

## 🚀 Running Migrations

### Method 1: Supabase CLI (Recommended)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or run specific migration
supabase db push --file src/lib/supabase/migrations/001_initial_schema.sql
```

### Method 2: Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of a migration file
4. Paste into the SQL editor
5. Click **Run**

### Method 3: Direct SQL Execution

```typescript
import { supabaseAdmin } from '@/lib/supabase/admin';
import { readFileSync } from 'fs';

const sql = readFileSync('src/lib/supabase/migrations/001_initial_schema.sql', 'utf-8');
const { error } = await supabaseAdmin.rpc('exec', { sql });

if (error) {
  console.error('Migration failed:', error);
} else {
  console.log('Migration successful');
}
```

---

## 📋 Migration Checklist

When creating a new migration:

### Before Creating
- [ ] Plan schema changes carefully
- [ ] Consider backward compatibility
- [ ] Document new fields/tables
- [ ] Plan RLS policies

### Migration File
- [ ] Use sequential numbering (003, 004, etc.)
- [ ] Add `DROP IF EXISTS` for idempotency (where safe)
- [ ] Create indexes for frequently queried columns
- [ ] Add RLS policies for new tables
- [ ] Add trigger for `updated_at` column
- [ ] Test locally first

### After Running
- [ ] Verify tables were created
- [ ] Check RLS policies work correctly
- [ ] Test queries with different roles
- [ ] Update TypeScript types in `models.ts`
- [ ] Update query functions in `queries.ts`
- [ ] Document breaking changes

---

## 🔒 Row Level Security (RLS)

### Policy Patterns

#### User-Specific Access
```sql
CREATE POLICY "users_own_data"
  ON profiles
  FOR ALL
  USING (clerk_id = public.clerk_user_id());
```

#### Admin Override
```sql
CREATE POLICY "admins_can_view_all"
  ON orders
  FOR SELECT
  USING (
    clerk_id = public.clerk_user_id()
    OR is_service_role()
    OR (
      SELECT role FROM profiles WHERE clerk_id = public.clerk_user_id()
    ) IN ('admin', 'superadmin')
  );
```

#### Service Role Only
```sql
CREATE POLICY "service_role_only"
  ON audit_logs
  FOR ALL
  USING (is_service_role());
```

---

## 🛠️ Common Migration Tasks

### Adding a Column
```sql
-- Add column
ALTER TABLE orders
  ADD COLUMN new_field text;

-- Add index
CREATE INDEX idx_orders_new_field ON orders(new_field);

-- Update RLS (if needed)
-- Existing policies typically cover new columns automatically
```

### Creating a New Table
```sql
-- Create table
CREATE TABLE new_table (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "users_own_data"
  ON new_table
  FOR ALL
  USING (user_id IN (
    SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()
  ));

-- Add updated_at trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON new_table
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Adding an Index
```sql
-- Simple index
CREATE INDEX idx_orders_symbol ON orders(symbol);

-- Composite index
CREATE INDEX idx_orders_user_symbol ON orders(user_id, symbol);

-- Partial index (for specific conditions)
CREATE INDEX idx_orders_active ON orders(user_id, status)
  WHERE status IN ('proposed', 'approved', 'submitted');
```

---

## 🐛 Troubleshooting

### Issue: "type already exists"
**Solution**: Add `DROP TYPE IF EXISTS` before `CREATE TYPE`
```sql
DROP TYPE IF EXISTS order_status CASCADE;
CREATE TYPE order_status AS ENUM ('proposed', 'approved', ...);
```

### Issue: "permission denied for schema auth"
**Solution**: Use `public` schema for functions, not `auth`
```sql
-- Wrong:
CREATE FUNCTION auth.clerk_user_id() ...

-- Correct:
CREATE FUNCTION public.clerk_user_id() ...
```

### Issue: "new row violates row-level security policy"
**Solution**: Check that JWT is being passed correctly and policies match
```sql
-- Debug: Temporarily disable RLS to test
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test query
-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Issue: "relation already exists"
**Solution**: Add `DROP TABLE IF EXISTS` or use `CREATE TABLE IF NOT EXISTS`
```sql
DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (...);

-- OR

CREATE TABLE IF NOT EXISTS profiles (...);
```

---

## 📊 Database Health Checks

### Check Tables
```sql
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check Indexes
```sql
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### Check Foreign Keys
```sql
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;
```

---

## 📚 Related Documentation
- [Supabase Migrations Docs](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- Atlas Setup Guide: `/Knowledge/001_SETUP.md`

---

**Last Updated**: 2026-01-22
