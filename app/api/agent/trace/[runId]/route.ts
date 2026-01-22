/**
 * GET /api/agent/trace/[runId]
 * 
 * Fetches complete agent execution trace from MongoDB
 * Used by admin trace viewer for auditability
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getAgentRun } from '@/lib/mongodb/queries';
import { getUserProfile } from '@/lib/supabase/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { runId } = await params;

    // Get user profile to check permissions
    const profile = await getUserProfile();
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Fetch trace from MongoDB
    const trace = await getAgentRun(runId);

    if (!trace) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
    }

    // Check if user owns this trace (or is admin/superadmin)
    if (trace.user_id !== userId && !['admin', 'superadmin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ trace });

  } catch (error) {
    console.error('Error fetching agent trace:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

