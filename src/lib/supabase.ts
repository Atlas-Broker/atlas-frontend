import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

// ============================================
// SUPABASE CLIENTS
// ============================================

// Browser-side client (respects RLS)
// Use this in Client Components and API routes for user-specific data
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Server-side client with Clerk JWT integration
// This automatically uses the Clerk session token for RLS
export async function getSupabaseClient() {
  const { getToken } = await auth();
  const supabaseAccessToken = await getToken({ template: 'supabase' });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`,
        },
      },
    }
  );

  return supabase;
}

// Admin client (bypasses RLS)
// Use this ONLY in Server Components and API routes for admin operations
// Never expose this client to the browser!
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// ============================================
// TYPESCRIPT INTERFACES
// ============================================

// User role hierarchy
export type UserRole = 'trader' | 'admin' | 'superadmin';

// Trading environment
export type EnvironmentType = 'paper' | 'live';

// Order types
export type OrderSide = 'buy' | 'sell' | 'short' | 'cover';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus = 
  | 'proposed'    // AI agent proposed
  | 'approved'    // User approved
  | 'submitted'   // Sent to broker
  | 'filled'      // Executed
  | 'rejected'    // User/broker rejected
  | 'cancelled'   // User cancelled
  | 'failed';     // System error

// Profile (links to Clerk user)
export interface Profile {
  id: string;
  clerk_id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Trader settings (risk preferences)
export interface TraderSettings {
  id: string;
  user_id: string;
  autonomy_level: 0 | 1 | 2 | 3;  // 0=Observer, 1=Copilot, 2=Guarded, 3=Full Auto
  max_concurrent_positions: number;
  max_daily_orders: number;
  max_position_size_usd: number;
  allow_shorting: boolean;
  allow_margin: boolean;
  trading_hours: 'regular' | 'extended';
  created_at: string;
  updated_at: string;
}

// Watchlist (user stock lists)
export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  symbols: string[];  // Array of tickers
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Order (complete order record)
export interface Order {
  id: string;
  user_id: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  order_type: OrderType;
  limit_price: number | null;
  stop_price: number | null;
  status: OrderStatus;
  environment: EnvironmentType;
  broker_order_id: string | null;
  filled_price: number | null;
  filled_at: string | null;
  agent_reasoning: AgentReasoning | null;
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

// Agent reasoning structure (stored in JSONB)
export interface AgentReasoning {
  reason: string;
  indicators: string[];
  risk_assessment?: string;
  timeframe?: string;
  target_price?: number;
  stop_loss?: number;
}

// Position (current holdings)
export interface Position {
  id: string;
  user_id: string;
  symbol: string;
  quantity: number;
  avg_entry_price: number;
  current_price: number | null;
  unrealized_pnl: number | null;
  environment: EnvironmentType;
  opened_at: string;
  updated_at: string;
}

// Audit log (activity tracking)
export interface AuditLog {
  id: string;
  user_id: string | null;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================
// DATABASE HELPER FUNCTIONS
// ============================================

/**
 * Get user profile by Clerk ID
 */
export async function getProfileByClerkId(clerkId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Get user profile by internal ID
 */
export async function getProfileById(id: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

/**
 * Get trader settings for a user
 */
export async function getTraderSettings(userId: string): Promise<TraderSettings | null> {
  const { data, error } = await supabase
    .from('trader_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching trader settings:', error);
    return null;
  }

  return data;
}

/**
 * Create audit log entry
 */
export async function createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabaseAdmin
    .from('audit_logs')
    .insert(log);

  if (error) {
    console.error('Error creating audit log:', error);
  }
}

/**
 * Get user's watchlists
 */
export async function getUserWatchlists(userId: string): Promise<Watchlist[]> {
  const { data, error } = await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching watchlists:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user's orders with optional filters
 */
export async function getUserOrders(
  userId: string,
  filters?: {
    status?: OrderStatus;
    environment?: EnvironmentType;
    symbol?: string;
    limit?: number;
  }
): Promise<Order[]> {
  let query = supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId);

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.environment) {
    query = query.eq('environment', filters.environment);
  }
  if (filters?.symbol) {
    query = query.eq('symbol', filters.symbol);
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user's positions
 */
export async function getUserPositions(
  userId: string,
  environment: EnvironmentType = 'paper'
): Promise<Position[]> {
  const { data, error } = await supabase
    .from('positions')
    .select('*')
    .eq('user_id', userId)
    .eq('environment', environment)
    .order('opened_at', { ascending: false });

  if (error) {
    console.error('Error fetching positions:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all orders across all users (admin only)
 */
export async function getAllOrders(filters?: {
  limit?: number;
  status?: OrderStatus;
}): Promise<Order[]> {
  let query = supabaseAdmin
    .from('orders')
    .select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  query = query.order('created_at', { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching all orders:', error);
    return [];
  }

  return data || [];
}

/**
 * Get recent audit logs (admin only)
 */
export async function getRecentAuditLogs(limit: number = 50): Promise<AuditLog[]> {
  const { data, error } = await supabaseAdmin
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching audit logs:', error);
    return [];
  }

  return data || [];
}

