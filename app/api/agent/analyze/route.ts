/**
 * POST /api/agent/analyze
 * 
 * Executes the Atlas agent orchestrator
 * - Receives user intent
 * - Runs agent analysis
 * - Saves trace to MongoDB
 * - Creates order in Supabase with 'proposed' status
 * - Returns proposal to frontend
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { runOrchestratorAgent } from '@/lib/gemini/agent';
import { saveAgentRun } from '@/lib/mongodb/queries';
import { getSupabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
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
    const { intent } = body;

    if (!intent || typeof intent !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid "intent" field' },
        { status: 400 }
      );
    }

    console.log(`🚀 Agent analyze request from user: ${userId}`);
    console.log(`💬 Intent: "${intent}"`);

    // Step 3: Run agent orchestrator
    const agentResult = await runOrchestratorAgent({
      userId,
      userIntent: intent
    });

    // Step 4: Save complete trace to MongoDB
    try {
      await saveAgentRun({
        run_id: agentResult.runId,
        user_id: userId,
        timestamp: new Date(),
        input: intent,
        agent_status: agentResult.status,
        tools_called: agentResult.tools_called,
        reasoning: agentResult.reasoning,
        proposal: agentResult.proposal,
        evidence_links: agentResult.evidence_links,
        error: agentResult.error,
        duration_ms: Date.now() - startTime,
        created_at: new Date()
      });
      console.log(`✅ Agent trace saved to MongoDB: ${agentResult.runId}`);
    } catch (mongoError) {
      console.error('⚠️ Failed to save to MongoDB (non-critical):', mongoError);
      // Don't fail the request if MongoDB save fails
    }

    // Step 5: If agent proposed a BUY/SELL trade, create order in Supabase
    // HOLD recommendations don't create orders - they're just analysis results
    const proposal = agentResult.proposal;
    const isActionableTrade = proposal && 
                              agentResult.status === 'COMPLETED' &&
                              (proposal.action === 'BUY' || proposal.action === 'SELL');

    if (isActionableTrade && proposal) {
      try {
        const supabase = getSupabaseAdmin();
        
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('clerk_id', userId)
          .single();

        if (!profile) {
          console.error('❌ User profile not found');
          return NextResponse.json(
            { error: 'User profile not found' },
            { status: 404 }
          );
        }

        // Create proposed order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: profile.id,
            symbol: proposal.symbol,
            side: proposal.action.toLowerCase() as 'buy' | 'sell',
            quantity: proposal.quantity,
            order_type: 'limit',
            limit_price: proposal.entry_price,
            stop_price: proposal.stop_loss,
            status: 'proposed',
            environment: 'paper',
            agent_run_id: agentResult.runId,
            confidence_score: proposal.confidence,
            reasoning_summary: agentResult.reasoning.trend_analysis,
            evidence_links: agentResult.evidence_links,
            proposed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (orderError) {
          console.error('❌ Error creating order:', orderError);
          throw orderError;
        }

        console.log(`✅ Order created in Supabase: ${order.id}`);

        // Create audit log for trade proposal
        await supabase.from('audit_logs').insert({
          user_id: profile.id,
          action: 'trade_proposed',
          resource_type: 'order',
          resource_id: order.id,
          metadata: {
            intent,
            agent_run_id: agentResult.runId,
            symbol: proposal.symbol,
            action: proposal.action,
            confidence: proposal.confidence
          }
        });

        // Return response with order ID
        return NextResponse.json({
          success: true,
          runId: agentResult.runId,
          status: agentResult.status,
          reasoning: agentResult.reasoning,
          proposal: proposal,
          evidence_links: agentResult.evidence_links,
          orderId: order.id,
          processing_time_ms: Date.now() - startTime
        });

      } catch (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
        return NextResponse.json(
          { error: 'Failed to create order in database' },
          { status: 500 }
        );
      }
    } else {
      // Agent returned HOLD recommendation or analysis only
      console.log(`ℹ️ No actionable trade - returning analysis only (action: ${proposal?.action || 'none'})`);
      
      // Still create audit log for analysis request
      if (proposal) {
        try {
          const supabase = getSupabaseAdmin();
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('clerk_id', userId)
            .single();

          if (profile) {
            await supabase.from('audit_logs').insert({
              user_id: profile.id,
              action: 'agent_analysis_requested',
              resource_type: 'agent_run',
              resource_id: agentResult.runId,
              metadata: {
                intent,
                symbol: proposal.symbol,
                action: proposal.action,
                confidence: proposal.confidence
              }
            });
          }
        } catch (auditError) {
          console.error('⚠️ Failed to create audit log (non-critical):', auditError);
        }
      }

      return NextResponse.json({
        success: true,
        runId: agentResult.runId,
        status: agentResult.status,
        reasoning: agentResult.reasoning,
        proposal: proposal,
        evidence_links: agentResult.evidence_links,
        error: agentResult.error,
        processing_time_ms: Date.now() - startTime
      });
    }

  } catch (error) {
    console.error('❌ Agent analyze error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Internal server error',
        success: false
      },
      { status: 500 }
    );
  }
}

