/**
 * Supabase Database Type Definitions - Unified Schema
 * 
 * SINGLE SOURCE OF TRUTH
 * Synced with atlas-database/schemas/typescript/supabase.types.ts
 */

// ============================================
// ENUMS
// ============================================

export type UserRole = 'trader' | 'admin' | 'superadmin' | 'system';
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
 * Profile - User account information (Clerk users + system accounts)
 */
export interface Profile {
  id: string; // UUID
  clerk_id: string | null; // NULL for system accounts
  email: string | null;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  is_system: boolean; // true for autonomous pilot
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Account - Trading accounts (replaces paper_accounts)
 */
export interface Account {
  id: string; // UUID
  user_id: string; // UUID
  environment: EnvironmentType;
  cash_balance: number;
  starting_cash: number;
  total_equity: number;
  broker_account_id: string | null;
  is_active: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Trader Settings - Risk preferences and trading parameters
 */
export interface TraderSettings {
  id: string; // UUID
  user_id: string; // UUID
  autonomy_level: number; // 0-3
  max_concurrent_positions: number;
  max_daily_orders: number;
  max_position_size_usd: number;
  allow_shorting: boolean;
  allow_margin: boolean;
  trading_hours: string; // 'regular', 'extended', 'all'
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Watchlist - User stock watchlists
 */
export interface Watchlist {
  id: string; // UUID
  user_id: string; // UUID
  name: string;
  symbols: string[]; // Array of ticker symbols
  is_active: boolean;
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Order - Complete order record with agent data (unified)
 */
export interface Order {
  id: string; // UUID
  account_id: string; // UUID
  user_id: string; // UUID (denormalized)
  symbol: string;
  side: OrderSide;
  quantity: number;
  order_type: OrderType;
  limit_price: number | null;
  stop_price: number | null;
  status: OrderStatus;
  environment: EnvironmentType;

  // Execution details
  broker_order_id: string | null;
  filled_price: number | null;
  filled_quantity: number | null;
  filled_at: string | null; // ISO datetime

  // AI agent details
  agent_run_id: string | null; // Links to MongoDB
  confidence_score: number | null; // 0.0-1.0
  reasoning_summary: string | null;
  agent_reasoning: Record<string, any> | null; // JSONB

  // Approval tracking
  approved_by: string | null; // UUID
  approved_at: string | null; // ISO datetime
  rejected_reason: string | null;

  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Position - Current holdings (unified)
 */
export interface Position {
  id: string; // UUID
  account_id: string; // UUID
  user_id: string; // UUID (denormalized)
  symbol: string;
  quantity: number;
  avg_entry_price: number;
  current_price: number | null;
  unrealized_pnl: number | null;
  realized_pnl: number;
  environment: EnvironmentType;
  opened_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

/**
 * Equity Snapshot - Portfolio value time series
 */
export interface EquitySnapshot {
  id: string; // UUID
  account_id: string; // UUID
  equity: number;
  cash: number;
  positions_value: number;
  timestamp: string; // ISO datetime
}

/**
 * Audit Log - Activity tracking
 */
export interface AuditLog {
  id: string; // UUID
  user_id: string | null; // UUID
  actor_id: string | null; // UUID
  action: string;
  resource_type: string;
  resource_id: string | null; // UUID
  metadata: Record<string, any> | null; // JSONB
  ip_address: string | null;
  user_agent: string | null;
  created_at: string; // ISO datetime
}

// ============================================
// INSERT TYPES (Omit auto-generated fields)
// ============================================

export type InsertProfile = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
export type InsertAccount = Omit<Account, 'id' | 'created_at' | 'updated_at'>;
export type InsertTraderSettings = Omit<TraderSettings, 'id' | 'created_at' | 'updated_at'>;
export type InsertWatchlist = Omit<Watchlist, 'id' | 'created_at' | 'updated_at'>;
export type InsertOrder = Omit<Order, 'id' | 'created_at' | 'updated_at'>;
export type InsertPosition = Omit<Position, 'id' | 'updated_at'>;
export type InsertEquitySnapshot = Omit<EquitySnapshot, 'id'>;
export type InsertAuditLog = Omit<AuditLog, 'id' | 'created_at'>;

// ============================================
// UTILITY TYPES
// ============================================

export type OrderStatusBadgeColor =
  | 'gray' // proposed
  | 'blue' // approved
  | 'yellow' // submitted
  | 'green' // filled
  | 'red' // rejected/failed
  | 'orange'; // cancelled

export const ORDER_STATUS_COLORS: Record<OrderStatus, OrderStatusBadgeColor> = {
  proposed: 'gray',
  approved: 'blue',
  submitted: 'yellow',
  filled: 'green',
  rejected: 'red',
  cancelled: 'orange',
  failed: 'red',
};

export const ORDER_SIDE_COLORS: Record<OrderSide, 'green' | 'red' | 'purple' | 'orange'> = {
  buy: 'green',
  sell: 'red',
  short: 'purple',
  cover: 'orange',
};

export const AUTONOMY_LEVEL_LABELS: Record<number, string> = {
  0: 'Manual',
  1: 'Suggest Only',
  2: 'Auto with Approval',
  3: 'Full Auto',
};

// ============================================
// TYPE GUARDS
// ============================================

export function isSystemProfile(profile: Profile): boolean {
  return profile.is_system === true;
}

export function isFilledOrder(order: Order): boolean {
  return order.status === 'filled';
}

export function isPendingOrder(order: Order): boolean {
  return ['proposed', 'approved', 'submitted'].includes(order.status);
}

// ============================================
// AGENT COMPETITION TYPES
// ============================================

// agent_competitors table
export interface AgentCompetitor {
  id: string; // UUID
  name: string;
  model_id: string;
  description: string | null;
  initial_capital: number;
  current_equity: number;
  total_return: number;
  sharpe_ratio: number | null;
  max_drawdown: number | null;
  win_rate: number | null;
  total_trades: number;
  is_active: boolean;
  started_at: string; // ISO datetime
  last_trade_at: string | null; // ISO datetime
  created_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// agent_daily_performance table
export interface AgentDailyPerformance {
  id: string; // UUID
  competitor_id: string; // UUID
  trading_date: string; // ISO date
  equity: number;
  cash: number;
  positions_value: number;
  daily_return: number | null;
  cumulative_return: number | null;
  trades_today: number;
  created_at: string; // ISO datetime
}

// agent_positions table
export interface AgentPosition {
  id: string; // UUID
  competitor_id: string; // UUID
  symbol: string;
  quantity: number;
  avg_entry_price: number;
  current_price: number | null;
  unrealized_pnl: number | null;
  cost_basis: number;
  market_value: number | null;
  weight: number | null;
  opened_at: string; // ISO datetime
  updated_at: string; // ISO datetime
}

// agent_trades table
export interface AgentTrade {
  id: string; // UUID
  competitor_id: string; // UUID
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  total_amount: number;
  reasoning_summary: string | null;
  confidence_score: number | null;
  executed_at: string; // ISO datetime
  created_at: string; // ISO datetime
}

// agent_reasoning table
export interface AgentReasoningDetail {
  id: string; // UUID
  competitor_id: string; // UUID
  trade_id: string | null; // UUID
  reasoning_type: string; // 'market_analysis', 'risk_assessment', 'decision'
  content: string;
  metadata: Record<string, any> | null;
  created_at: string; // ISO datetime
}

// agent_leaderboard table
export interface AgentLeaderboard {
  id: string; // UUID
  competitor_id: string; // UUID
  ranking_date: string; // ISO date
  rank: number;
  equity: number;
  total_return: number;
  daily_return: number | null;
  sharpe_ratio: number | null;
  win_rate: number | null;
  total_trades: number;
  created_at: string; // ISO datetime
}

// ============================================
// AGENT COMPETITION VIEW TYPES
// ============================================

// Combined leaderboard view with competitor info
export interface LeaderboardEntry extends AgentLeaderboard {
  competitor: AgentCompetitor;
}

// Agent performance with historical data
export interface AgentPerformanceData {
  competitor: AgentCompetitor;
  daily_performance: AgentDailyPerformance[];
  current_positions: AgentPosition[];
  recent_trades: AgentTrade[];
}

// Portfolio details with reasoning
export interface AgentPortfolioDetail {
  competitor: AgentCompetitor;
  positions: AgentPosition[];
  reasoning: AgentReasoningDetail[];
  total_market_value: number;
  cash_balance: number;
}

