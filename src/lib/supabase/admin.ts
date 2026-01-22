/**
 * Supabase Admin Client - Bypasses RLS
 * 
 * ⚠️  SECURITY WARNING ⚠️
 * This client bypasses Row Level Security.
 * Use ONLY in:
 * - Server Components
 * - API routes
 * - Server actions
 * 
 * NEVER expose to the browser!
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Admin client with full database access
 * Bypasses all Row Level Security policies
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Function wrapper for consistency with other services
 */
export function getSupabaseAdmin() {
  return supabaseAdmin;
}

