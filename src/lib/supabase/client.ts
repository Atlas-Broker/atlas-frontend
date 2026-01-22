/**
 * Supabase Client - Browser & Server with Clerk JWT
 */

import { createClient } from '@supabase/supabase-js';
import { auth } from '@clerk/nextjs/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client
 * Respects Row Level Security (RLS)
 * Use in Client Components
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Server-side Supabase client with Clerk JWT integration
 * Automatically uses the Clerk session token for RLS
 * Use in Server Components and API routes
 */
export async function getSupabaseClient() {
  const { getToken } = await auth();
  const supabaseAccessToken = await getToken({ template: 'supabase' });

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${supabaseAccessToken}`,
      },
    },
  });
}

