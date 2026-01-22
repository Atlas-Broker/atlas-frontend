/**
 * POST /api/agent/approve-trade
 * 
 * Approves a proposed trade (enforces the human-in-the-loop boundary)
 * - Validates user has permission
 * - Updates order status: proposed → approved
 * - Logs action in audit_logs
 * - For now, 'approved' is final state (no broker execution yet)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // Step 1: Authenticate user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // Step 2: Parse request body
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    console.log(`✅ Trade approval request from user: ${userId} for order: ${orderId}`);

    const supabase = getSupabaseAdmin();

    // Step 3: Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, clerk_id, role')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Step 4: Fetch the order and validate ownership
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      console.error('❌ Order not found:', fetchError);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Validate user owns this order
    if (order.user_id !== profile.id) {
      console.error('❌ User does not own this order');
      return NextResponse.json(
        { error: 'You do not have permission to approve this order' },
        { status: 403 }
      );
    }

    // Validate order is in 'proposed' status
    if (order.status !== 'proposed') {
      return NextResponse.json(
        { error: `Order is already ${order.status}` },
        { status: 400 }
      );
    }

    // Step 5: Update order status to 'approved'
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: profile.id
      })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating order:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve order' },
        { status: 500 }
      );
    }

    console.log(`✅ Order approved: ${orderId}`);

    // Step 6: Create audit log entry
    try {
      await supabase.from('audit_logs').insert({
        user_id: profile.id,
        action: 'trade_approved',
        resource_type: 'order',
        resource_id: orderId,
        metadata: {
          symbol: order.symbol,
          side: order.side,
          quantity: order.quantity,
          agent_run_id: order.agent_run_id,
          confidence_score: order.confidence_score
        }
      });
      console.log(`✅ Audit log created for order approval: ${orderId}`);
    } catch (auditError) {
      console.error('⚠️ Failed to create audit log (non-critical):', auditError);
    }

    // Step 7: Return success response
    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Trade approved successfully'
    });

  } catch (error) {
    console.error('❌ Approve trade error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agent/reject-trade
 * 
 * Rejects a proposed trade
 */
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, clerk_id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    // Fetch order
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (!order || order.user_id !== profile.id) {
      return NextResponse.json({ error: 'Order not found or unauthorized' }, { status: 404 });
    }

    // Update status to rejected
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'rejected' })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      user_id: profile.id,
      action: 'trade_rejected',
      resource_type: 'order',
      resource_id: orderId,
      metadata: {
        symbol: order.symbol,
        side: order.side
      }
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: 'Trade rejected'
    });

  } catch (error) {
    console.error('❌ Reject trade error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

