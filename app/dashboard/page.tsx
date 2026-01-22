'use client';

/**
 * Atlas Dashboard - Agent Intelligence Layer
 * 
 * Phase 2: AI-powered trading copilot with human-in-the-loop approval
 * Focus: Agent reasoning and decision boundary, not Bloomberg terminal
 */

import { useState, useEffect } from 'react';
import { CommandBar } from '@/components/trader/CommandBar';
import { AgentStatus, AgentStatusType } from '@/components/trader/AgentStatus';
import { CopilotCard } from '@/components/trader/CopilotCard';
import { RecentDecisions } from '@/components/trader/RecentDecisions';
import { useToast } from '@/components/ui/toast';

interface AgentProposal {
  runId: string;
  orderId?: string;
  proposal: {
    action: 'BUY' | 'SELL' | 'HOLD';
    symbol: string;
    quantity: number;
    entry_price: number;
    stop_loss: number;
    target_price: number;
    confidence: number;
    holding_window: string;
  };
  reasoning: {
    technical_signals: string[];
    trend_analysis: string;
    sentiment: string;
    risk_factors: string[];
  };
  evidence_links: string[];
}

interface Decision {
  id: string;
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  status: 'proposed' | 'approved' | 'rejected';
  quantity: number;
  entry_price: number;
  confidence_score: number;
  reasoning_summary: string;
  proposed_at: string;
  approved_at?: string;
}

export default function DashboardPage() {
  const [agentStatus, setAgentStatus] = useState<AgentStatusType>('IDLE');
  const [currentProposal, setCurrentProposal] = useState<AgentProposal | null>(null);
  const [recentDecisions, setRecentDecisions] = useState<Decision[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  // Fetch recent decisions on mount
  useEffect(() => {
    fetchRecentDecisions();
  }, []);

  const fetchRecentDecisions = async () => {
    try {
      const response = await fetch('/api/orders/recent');
      if (response.ok) {
        const data = await response.json();
        setRecentDecisions(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching recent decisions:', error);
    }
  };

  const handleAnalyze = async (intent: string) => {
    try {
      setAgentStatus('ANALYZING');
      setCurrentProposal(null);

      const response = await fetch('/api/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent })
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server configuration error. Please check MongoDB and Google AI API keys are configured in .env.local');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed');
      }

      if (data.proposal) {
        setAgentStatus('AWAITING_APPROVAL');
        setCurrentProposal({
          runId: data.runId,
          orderId: data.orderId,
          proposal: data.proposal,
          reasoning: data.reasoning,
          evidence_links: data.evidence_links
        });
        
        showToast({
          title: 'Analysis Complete',
          description: `Atlas has proposed a ${data.proposal.action} for ${data.proposal.symbol}`,
          variant: 'default'
        });
      } else {
        setAgentStatus('COMPLETED');
        showToast({
          title: 'Analysis Complete',
          description: data.error || 'No trade proposal generated',
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Agent analyze error:', error);
      setAgentStatus('ERROR');
      showToast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    }
  };

  const handleApprove = async () => {
    if (!currentProposal?.orderId) {
      console.error('❌ No orderId found in proposal:', currentProposal);
      showToast({
        title: 'Cannot Approve',
        description: 'No order ID found. This might be a HOLD recommendation.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🔄 Approving order:', currentProposal.orderId);

      const response = await fetch('/api/agent/approve-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: currentProposal.orderId })
      });

      console.log('📡 Approve response status:', response.status);

      const data = await response.json();
      console.log('📡 Approve response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Approval failed');
      }

      showToast({
        title: 'Trade Approved! ✅',
        description: `${currentProposal.proposal.action} order for ${currentProposal.proposal.symbol} has been approved`,
        variant: 'default'
      });

      // Clear proposal and refresh decisions
      setCurrentProposal(null);
      setAgentStatus('IDLE');
      await fetchRecentDecisions();

    } catch (error) {
      console.error('❌ Approve error:', error);
      showToast({
        title: 'Approval Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentProposal) {
      console.error('❌ No proposal found');
      return;
    }

    // For HOLD recommendations (no orderId), just clear the proposal
    if (!currentProposal.orderId) {
      console.log('ℹ️ HOLD recommendation - clearing without API call');
      showToast({
        title: 'Acknowledged',
        description: `Analysis for ${currentProposal.proposal.symbol} has been acknowledged`,
        variant: 'default'
      });

      setCurrentProposal(null);
      setAgentStatus('IDLE');
      return;
    }

    // For actual trade proposals (BUY/SELL with orderId), reject via API
    try {
      setIsProcessing(true);
      console.log('🔄 Rejecting order:', currentProposal.orderId);

      const response = await fetch('/api/agent/approve-trade', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: currentProposal.orderId })
      });

      console.log('📡 Reject response status:', response.status);

      const data = await response.json();
      console.log('📡 Reject response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Rejection failed');
      }

      showToast({
        title: 'Trade Rejected',
        description: `Proposal for ${currentProposal.proposal.symbol} has been rejected`,
        variant: 'default'
      });

      // Clear proposal and refresh decisions
      setCurrentProposal(null);
      setAgentStatus('IDLE');
      await fetchRecentDecisions();

    } catch (error) {
      console.error('❌ Reject error:', error);
      showToast({
        title: 'Rejection Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
          Atlas Intelligence Layer
        </h1>
        <p className="text-muted-foreground">
          AI-powered market analysis with human-in-the-loop approval
        </p>
      </div>

      {/* Command Bar */}
      <div className="max-w-4xl mx-auto">
        <CommandBar
          onAnalyze={handleAnalyze}
          isAnalyzing={agentStatus === 'ANALYZING' || agentStatus === 'PROPOSING'}
        />
      </div>

      {/* Agent Status */}
      {agentStatus !== 'IDLE' && (
        <div className="flex justify-center">
          <AgentStatus status={agentStatus} />
        </div>
      )}

      {/* Copilot Proposal Card */}
      {currentProposal && agentStatus === 'AWAITING_APPROVAL' && (
        <div className="max-w-4xl mx-auto">
          <CopilotCard
            proposal={currentProposal.proposal}
            reasoning={currentProposal.reasoning}
            evidence_links={currentProposal.evidence_links}
            orderId={currentProposal.orderId}
            onApprove={handleApprove}
            onReject={handleReject}
            isProcessing={isProcessing}
          />
        </div>
      )}

      {/* Recent Decisions */}
      <div className="max-w-4xl mx-auto">
        <RecentDecisions decisions={recentDecisions} />
      </div>
    </div>
  );
}
