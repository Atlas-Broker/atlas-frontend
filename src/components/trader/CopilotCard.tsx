'use client';

/**
 * CopilotCard Component
 * 
 * Displays agent proposal with full reasoning
 * Prominent "Approve Trade" button (enforces the boundary)
 * Collapsible sections for reasoning, risks, evidence
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, AlertTriangle, ExternalLink, CheckCircle, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatCurrency } from '@/lib/shared/utils';

interface CopilotCardProps {
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
  orderId?: string;
  onApprove: () => Promise<void>;
  onReject: () => Promise<void>;
  isProcessing?: boolean;
}

export function CopilotCard({
  proposal,
  reasoning,
  evidence_links,
  onApprove,
  onReject,
  isProcessing = false
}: CopilotCardProps) {
  const [showReasoning, setShowReasoning] = useState(true);
  const [showRisks, setShowRisks] = useState(true);
  const [showEvidence, setShowEvidence] = useState(false);

  const potentialProfit = proposal.target_price - proposal.entry_price;
  const potentialLoss = proposal.entry_price - proposal.stop_loss;
  const riskRewardRatio = potentialProfit / potentialLoss;

  const confidenceColor = proposal.confidence >= 0.7 ? 'text-green-500' : proposal.confidence >= 0.5 ? 'text-yellow-500' : 'text-red-500';
  const confidenceBg = proposal.confidence >= 0.7 ? 'bg-green-500/20' : proposal.confidence >= 0.5 ? 'bg-yellow-500/20' : 'bg-red-500/20';

  return (
    <div className="glass-card border-2 border-primary/30 rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 p-6 border-b border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold terminal-font">{proposal.symbol}</h2>
              <Badge variant={proposal.action === 'BUY' ? 'profit' : proposal.action === 'SELL' ? 'loss' : 'default'} className="text-lg px-3 py-1">
                {proposal.action}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {proposal.quantity} shares @ {formatCurrency(proposal.entry_price)}
            </p>
          </div>

          {/* Confidence Score */}
          <div className={`${confidenceBg} ${confidenceColor} px-4 py-2 rounded-xl border border-current/30`}>
            <div className="text-sm font-medium">Confidence</div>
            <div className="text-2xl font-bold">{(proposal.confidence * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Trade Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Entry</div>
            <div className="text-lg font-semibold">{formatCurrency(proposal.entry_price)}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Target</div>
            <div className="text-lg font-semibold text-green-500">{formatCurrency(proposal.target_price)}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">Stop Loss</div>
            <div className="text-lg font-semibold text-red-500">{formatCurrency(proposal.stop_loss)}</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3">
            <div className="text-sm text-muted-foreground">R:R Ratio</div>
            <div className="text-lg font-semibold">{riskRewardRatio.toFixed(2)}:1</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 space-y-4">
        {/* Why (Reasoning) */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold">Why This Trade?</span>
            </div>
            {showReasoning ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showReasoning && (
            <div className="p-4 pt-0 space-y-3">
              {/* Technical Signals */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Technical Signals</h4>
                <ul className="space-y-1">
                  {reasoning.technical_signals.map((signal, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trend Analysis */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Trend Analysis</h4>
                <p className="text-sm">{reasoning.trend_analysis}</p>
              </div>

              {/* Sentiment */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Market Sentiment</h4>
                <p className="text-sm">{reasoning.sentiment}</p>
              </div>
            </div>
          )}
        </div>

        {/* Risk Factors */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowRisks(!showRisks)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="font-semibold">Risk Factors</span>
            </div>
            {showRisks ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showRisks && (
            <div className="p-4 pt-0">
              <ul className="space-y-1">
                {reasoning.risk_factors.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Evidence */}
        <div className="border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setShowEvidence(!showEvidence)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5 text-blue-500" />
              <span className="font-semibold">Evidence Sources</span>
            </div>
            {showEvidence ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          
          {showEvidence && (
            <div className="p-4 pt-0 space-y-2">
              {evidence_links.map((link, idx) => (
                <a
                  key={idx}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  {link}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Holding Window */}
        <div className="text-sm text-muted-foreground text-center">
          Expected holding period: <span className="font-medium text-foreground">{proposal.holding_window}</span>
        </div>
      </div>

      {/* Footer - Action Buttons */}
      <div className="p-6 pt-0 flex gap-3">
        <Button
          onClick={onApprove}
          disabled={isProcessing}
          variant="glow"
          size="lg"
          className="flex-1 text-lg font-semibold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-2" />
              Approve Trade
            </>
          )}
        </Button>
        
        <Button
          onClick={onReject}
          disabled={isProcessing}
          variant="outline"
          size="lg"
          className="px-8"
        >
          <X className="w-5 h-5 mr-2" />
          Reject
        </Button>
      </div>
    </div>
  );
}

