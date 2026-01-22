/**
 * GET /api/orders/recent
 * 
 * Fetches recent orders for the current user
 * Used by dashboard to show recent decisions
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch recent orders (last 10)
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return NextResponse.json({ orders: orders || [] });

  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

