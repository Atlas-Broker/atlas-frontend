-- ============================================
-- Atlas Trading Platform - Complete Schema with Clerk JWT
-- ============================================
-- This migration creates all tables with Clerk JWT integration
-- Run this once in Supabase SQL Editor

-- ============================================
-- CLEANUP (Drop existing objects if any)
-- ============================================

-- Drop existing tables (CASCADE removes dependent objects)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS watchlists CASCADE;
DROP TABLE IF EXISTS trader_settings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.clerk_user_id();
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop existing types
DROP TYPE IF EXISTS environment_type CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS order_type CASCADE;
DROP TYPE IF EXISTS order_side CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

-- User role hierarchy: trader (default) < admin < superadmin
CREATE TYPE user_role AS ENUM ('trader', 'admin', 'superadmin');

-- Order side types
CREATE TYPE order_side AS ENUM ('buy', 'sell', 'short', 'cover');

-- Order types
CREATE TYPE order_type AS ENUM ('market', 'limit', 'stop', 'stop_limit');

-- Order status lifecycle
CREATE TYPE order_status AS ENUM (
  'proposed',      -- AI agent proposed the order
  'approved',      -- User approved the order
  'submitted',     -- Order sent to broker
  'filled',        -- Order executed
  'rejected',      -- User or broker rejected
  'cancelled',     -- User cancelled before fill
  'failed'         -- System/broker error
);

-- Trading environment
CREATE TYPE environment_type AS ENUM ('paper', 'live');

-- ============================================
-- TABLES
-- ============================================

-- PROFILES: Core user information linked to Clerk
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'trader',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_clerk_id ON profiles(clerk_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);

-- TRADER_SETTINGS: Risk and autonomy preferences
CREATE TABLE trader_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  autonomy_level INTEGER NOT NULL DEFAULT 1 CHECK (autonomy_level BETWEEN 0 AND 3),
  max_concurrent_positions INTEGER NOT NULL DEFAULT 5 CHECK (max_concurrent_positions > 0),
  max_daily_orders INTEGER NOT NULL DEFAULT 20 CHECK (max_daily_orders > 0),
  max_position_size_usd DECIMAL(12, 2) NOT NULL DEFAULT 10000.00 CHECK (max_position_size_usd > 0),
  allow_shorting BOOLEAN NOT NULL DEFAULT false,
  allow_margin BOOLEAN NOT NULL DEFAULT false,
  trading_hours TEXT NOT NULL DEFAULT 'regular',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_trader_settings_user_id ON trader_settings(user_id);

-- WATCHLISTS: User-curated stock lists
CREATE TABLE watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'My Watchlist',
  symbols TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);
CREATE INDEX idx_watchlists_is_active ON watchlists(is_active);

-- ORDERS: All order history
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  side order_side NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  order_type order_type NOT NULL,
  limit_price DECIMAL(12, 2),
  stop_price DECIMAL(12, 2),
  status order_status NOT NULL DEFAULT 'proposed',
  environment environment_type NOT NULL DEFAULT 'paper',
  broker_order_id TEXT,
  filled_price DECIMAL(12, 2),
  filled_at TIMESTAMPTZ,
  agent_reasoning JSONB,
  confidence_score DECIMAL(3, 2) CHECK (confidence_score BETWEEN 0 AND 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_symbol ON orders(symbol);
CREATE INDEX idx_orders_environment ON orders(environment);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- POSITIONS: Current open positions
CREATE TABLE positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  avg_entry_price DECIMAL(12, 2) NOT NULL,
  current_price DECIMAL(12, 2),
  unrealized_pnl DECIMAL(12, 2),
  environment environment_type NOT NULL DEFAULT 'paper',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, symbol, environment)
);

CREATE INDEX idx_positions_user_id ON positions(user_id);
CREATE INDEX idx_positions_symbol ON positions(symbol);
CREATE INDEX idx_positions_environment ON positions(environment);

-- AUDIT_LOGS: System-wide activity log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Extract Clerk user ID from JWT token (sub claim)
CREATE OR REPLACE FUNCTION public.clerk_user_id()
RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::json->>'sub', '')::text;
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION public.clerk_user_id() IS 
'Extracts Clerk user ID from JWT sub claim for RLS policies';

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trader_settings_updated_at BEFORE UPDATE ON trader_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON watchlists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trader_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES (using Clerk JWT)
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (clerk_id = public.clerk_user_id());

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (clerk_id = public.clerk_user_id());

-- TRADER_SETTINGS POLICIES
CREATE POLICY "Users can view their own settings"
  ON trader_settings FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

CREATE POLICY "Users can update their own settings"
  ON trader_settings FOR UPDATE
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

-- WATCHLISTS POLICIES
CREATE POLICY "Users can view their own watchlists"
  ON watchlists FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

CREATE POLICY "Users can create their own watchlists"
  ON watchlists FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

CREATE POLICY "Users can update their own watchlists"
  ON watchlists FOR UPDATE
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

CREATE POLICY "Users can delete their own watchlists"
  ON watchlists FOR DELETE
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

-- ORDERS POLICIES
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

-- POSITIONS POLICIES
CREATE POLICY "Users can view their own positions"
  ON positions FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

-- AUDIT_LOGS POLICIES
CREATE POLICY "Users can view their own audit logs"
  ON audit_logs FOR SELECT
  USING (user_id IN (SELECT id FROM profiles WHERE clerk_id = public.clerk_user_id()));

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT EXECUTE ON FUNCTION public.clerk_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.clerk_user_id() TO anon;

-- ============================================
-- NOTES
-- ============================================

-- This schema:
-- 1. Uses Clerk JWT for authentication (sub claim = clerk_id)
-- 2. Profile auto-creation happens in application code
-- 3. RLS enforces user data isolation
-- 4. Service role key bypasses RLS for admin operations

-- To promote a user to admin:
-- UPDATE profiles SET role = 'admin' WHERE clerk_id = 'user_xxxxx';

-- To promote a user to superadmin:
-- UPDATE profiles SET role = 'superadmin' WHERE clerk_id = 'user_xxxxx';

