# Supabase Setup for Atlas

## Initial Setup

### 1. Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose organization and set project details:
   - **Name**: atlas-trading
   - **Database Password**: Save this securely!
   - **Region**: Choose closest to your users
4. Wait for project to finish provisioning (~2 minutes)

### 2. Run Database Migration

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the entire contents of `migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. Verify success - you should see "Success. No rows returned"

### 3. Get API Keys

1. Go to **Settings** > **API** in your Supabase dashboard
2. Copy the following to your `.env.local`:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

## Manual Role Management

Users are created with `trader` role by default via Clerk webhook. To promote users to admin or superadmin, use these SQL commands:

### Promote User to Admin

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE clerk_id = 'user_xxxxxxxxxxxxxxxxxxxxxx';
```

### Promote User to SuperAdmin

```sql
UPDATE profiles 
SET role = 'superadmin' 
WHERE clerk_id = 'user_xxxxxxxxxxxxxxxxxxxxxx';
```

### Demote User to Trader

```sql
UPDATE profiles 
SET role = 'trader' 
WHERE clerk_id = 'user_xxxxxxxxxxxxxxxxxxxxxx';
```

### Find Your Clerk ID

After signing in to Atlas, you can find your Clerk ID by:

1. Check your profile in the database:
   ```sql
   SELECT clerk_id, email, full_name, role FROM profiles;
   ```
2. Or check Clerk Dashboard > Users > click your user > copy User ID

## Seeding Test Data (Optional)

If you want to populate your database with test data for development:

### Create Test Orders

```sql
-- Get your user_id first
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM profiles WHERE email = 'your-email@example.com';
  
  -- Insert sample orders
  INSERT INTO orders (user_id, symbol, side, quantity, order_type, status, environment, agent_reasoning, confidence_score)
  VALUES 
    (test_user_id, 'AAPL', 'buy', 10, 'market', 'filled', 'paper', 
     '{"reason": "Strong upward momentum", "indicators": ["RSI oversold", "MACD crossover"]}', 0.85),
    (test_user_id, 'TSLA', 'buy', 5, 'limit', 'proposed', 'paper',
     '{"reason": "Breakout pattern forming", "indicators": ["Volume surge", "Above 50-day MA"]}', 0.78),
    (test_user_id, 'NVDA', 'buy', 15, 'market', 'approved', 'paper',
     '{"reason": "AI sector momentum", "indicators": ["Industry strength", "Earnings beat"]}', 0.92);
END $$;
```

### Create Test Positions

```sql
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM profiles WHERE email = 'your-email@example.com';
  
  INSERT INTO positions (user_id, symbol, quantity, avg_entry_price, current_price, unrealized_pnl, environment)
  VALUES 
    (test_user_id, 'AAPL', 10, 175.50, 178.25, 27.50, 'paper'),
    (test_user_id, 'MSFT', 8, 380.00, 385.50, 44.00, 'paper'),
    (test_user_id, 'GOOGL', 12, 142.30, 139.80, -30.00, 'paper');
END $$;
```

### Create Test Watchlist

```sql
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM profiles WHERE email = 'your-email@example.com';
  
  INSERT INTO watchlists (user_id, name, symbols, is_active)
  VALUES 
    (test_user_id, 'Tech Giants', ARRAY['AAPL', 'MSFT', 'GOOGL', 'META', 'AMZN'], true),
    (test_user_id, 'EV Sector', ARRAY['TSLA', 'RIVN', 'LCID', 'NIO'], true);
END $$;
```

## Database Schema Overview

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User accounts linked to Clerk authentication |
| `trader_settings` | Per-user trading preferences and risk limits |
| `watchlists` | User-curated lists of stocks to monitor |
| `orders` | Complete order history and audit trail |
| `positions` | Current open positions (holdings) |
| `audit_logs` | System-wide activity log for compliance |

### Key Relationships

```
profiles (1) ──→ (1) trader_settings
profiles (1) ──→ (many) watchlists
profiles (1) ──→ (many) orders
profiles (1) ──→ (many) positions
profiles (1) ──→ (many) audit_logs
```

## Row Level Security (RLS)

All tables have RLS enabled. Regular users can only access their own data. Admin operations must use the **service role key** which bypasses RLS.

### Testing RLS

You can test RLS policies in the SQL editor:

```sql
-- This uses RLS (anon key)
SELECT * FROM orders;  -- Only shows your orders

-- This bypasses RLS (service role)
-- You can't test this in the SQL editor, but the Next.js backend uses it
```

## Troubleshooting

### Migration Fails

- **Error: "type user_role already exists"**
  - The migration was already run. Check the table browser to verify tables exist.

- **Error: "permission denied"**
  - Make sure you're logged into the correct Supabase project
  - Try refreshing your session

### Can't See Data

- **Tables are empty after migration**
  - This is normal. Users are created via Clerk webhook after first sign-in.
  - Run the seeding scripts above to add test data.

### RLS Blocks Queries

- **Getting "permission denied" in your app**
  - Make sure you're using the correct Supabase client (anon vs service role)
  - Admin operations should use the service role client
  - Check that your Clerk authentication is working

## Backup & Maintenance

### Manual Backup

In Supabase dashboard:
1. Go to **Database** > **Backups**
2. Click "Create backup"
3. Download SQL file for safekeeping

### View Recent Activity

```sql
-- See recent orders
SELECT 
  p.email,
  o.symbol,
  o.side,
  o.quantity,
  o.status,
  o.created_at
FROM orders o
JOIN profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 20;

-- See active users
SELECT email, role, created_at
FROM profiles
WHERE is_active = true
ORDER BY created_at DESC;
```

## Next Steps

After setting up Supabase:
1. ✅ Copy API keys to `.env.local`
2. ✅ Run the migration
3. ✅ Set up Clerk webhook (see main README)
4. ✅ Start the Next.js dev server
5. ✅ Sign in and verify profile creation
6. ✅ Promote yourself to admin/superadmin if needed

