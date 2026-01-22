/**
 * Supabase Query Functions
 * 
 * Centralized, reusable database queries
 * All queries are type-safe using models.ts types
 */

import { supabase } from './client';
import { supabaseAdmin } from './admin';
import type {
  Profile,
  TraderSettings,
  Watchlist,
  Order,
  Position,
  AuditLog,
  OrderStatus,
  EnvironmentType,
  InsertAuditLog,
} from './models';

// ============================================
// PROFILE QUERIES
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

// ============================================
// TRADER SETTINGS QUERIES
// ============================================

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

// ============================================
// WATCHLIST QUERIES
// ============================================

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

// ============================================
// ORDER QUERIES
// ============================================

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
  let query = supabase.from('orders').select('*').eq('user_id', userId);

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
 * Get all orders across all users (admin only)
 */
export async function getAllOrders(filters?: {
  limit?: number;
  status?: OrderStatus;
}): Promise<Order[]> {
  let query = supabaseAdmin.from('orders').select('*');

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

// ============================================
// POSITION QUERIES
// ============================================

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

// ============================================
// AUDIT LOG QUERIES
// ============================================

/**
 * Create audit log entry
 */
export async function createAuditLog(log: InsertAuditLog): Promise<void> {
  const { error } = await supabaseAdmin.from('audit_logs').insert(log);

  if (error) {
    console.error('Error creating audit log:', error);
  }
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

