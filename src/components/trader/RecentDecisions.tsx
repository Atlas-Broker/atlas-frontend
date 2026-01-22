'use client';

/**
 * RecentDecisions Component
 * 
 * Timeline-style list of recent agent proposals and decisions
 * Shows: Symbol, Action, Status, Timestamp
 * Click to expand and see full reasoning
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/shared/utils';

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

interface RecentDecisionsProps {
  decisions: Decision[];
}

export function RecentDecisions({ decisions }: RecentDecisionsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (decisions.length === 0) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Your trading history will appear here</p>
        <p className="text-sm text-muted-foreground mt-1">Submit your first analysis request above</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="profit">Approved</Badge>;
      case 'rejected':
        return <Badge variant="loss">Rejected</Badge>;
      default:
        return <Badge variant="pending">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary" />
        Recent Decisions
      </h3>

      <div className="space-y-2">
        {decisions.map((decision) => {
          const isExpanded = expandedId === decision.id;

          return (
            <div
              key={decision.id}
              className="glass-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-200"
            >
              {/* Summary Row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : decision.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Status Icon */}
                  {getStatusIcon(decision.status)}

                  {/* Symbol & Action */}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold terminal-font">{decision.symbol}</span>
                      <Badge variant={decision.action === 'BUY' ? 'profit' : 'loss'} className="text-xs">
                        {decision.action}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {decision.quantity} shares @ {formatCurrency(decision.entry_price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Status Badge */}
                  {getStatusBadge(decision.status)}

                  {/* Timestamp */}
                  <div className="text-sm text-muted-foreground text-right">
                    {formatDateTime(decision.proposed_at)}
                  </div>

                  {/* Expand Icon */}
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 pt-0 border-t border-border space-y-3">
                  {/* Confidence */}
                  <div>
                    <span className="text-sm text-muted-foreground">Confidence: </span>
                    <span className="font-medium">{(decision.confidence_score * 100).toFixed(0)}%</span>
                  </div>

                  {/* Reasoning Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Reasoning</h4>
                    <p className="text-sm">{decision.reasoning_summary}</p>
                  </div>

                  {/* Timestamps */}
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Proposed:</span> {formatDateTime(decision.proposed_at)}
                    </div>
                    {decision.approved_at && (
                      <div>
                        <span className="font-medium">Approved:</span> {formatDateTime(decision.approved_at)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

