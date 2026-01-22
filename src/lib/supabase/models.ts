/**
 * Supabase Database Type Definitions
 * 
 * All database table interfaces and enums
 */

// ============================================
// ENUMS
// ============================================

export type UserRole = 'trader' | 'admin' | 'superadmin';
export type EnvironmentType = 'paper' | 'live';
export type OrderSide = 'buy' | 'sell' | 'short' | 'cover';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type OrderStatus =
  | 'proposed' // AI agent proposed
  | 'approved' // User approved
  | 'submitted' // Sent to broker
  | 'filled' // Executed
  | 'rejected' // User/broker rejected
  | 'cancelled' // User cancelled
  | 'failed'; // System error

// ============================================
// TABLE INTERFACES
// ============================================

/**
 * Profile - User account information (synced from Clerk)
 */
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

/**
 * Trader Settings - Risk preferences and trading parameters
 */
export interface TraderSettings {
  id: string;
  user_id: string;
  autonomy_level: 0 | 1 | 2 | 3; // 0=Observer, 1=Copilot, 2=Guarded, 3=Full Auto
  max_concurrent_positions: number;
  max_daily_orders: number;
  max_position_size_usd: number;
  allow_shorting: boolean;
  allow_margin: boolean;
  trading_hours: 'regular' | 'extended';
  created_at: string;
  updated_at: string;
}

/**
 * Watchlist - User stock watchlists
 */
export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  symbols: string[]; // Array of ticker symbols
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Order - Complete order record with agent data
 */
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
  // Agent-related fields (from migration 002)
  agent_run_id: string | null;
  reasoning_summary: string | null;
  evidence_links: string[] | null;
  proposed_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Agent Reasoning (stored in JSONB column)
 */
export interface AgentReasoning {
  reason: string;
  indicators: string[];
  risk_assessment?: string;
  timeframe?: string;
  target_price?: number;
  stop_loss?: number;
}

/**
 * Position - Current holdings
 */
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

/**
 * Audit Log - Activity tracking
 */
export interface AuditLog {
  id: string;
  user_id: string | null;
  actor_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

// ============================================
// INSERT TYPES (Omit auto-generated fields)
// ============================================

export type InsertProfile = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type InsertTraderSettings = Omit<TraderSettings, 'id' | 'created_at' | 'updated_at'>;
export type InsertWatchlist = Omit<Watchlist, 'id' | 'created_at' | 'updated_at'>;
export type InsertOrder = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type InsertPosition = Omit<Position, 'id' | 'updated_at'>;
export type InsertAuditLog = Omit<AuditLog, 'id' | 'created_at'>;

