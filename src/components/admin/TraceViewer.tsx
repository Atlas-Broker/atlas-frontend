'use client';

/**
 * TraceViewer Component
 * 
 * Modal for displaying complete agent execution traces from MongoDB
 * Shows: Reasoning, Tool Calls, Raw JSON
 * Proves auditability and transparency
 */

import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock, Database } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { formatDateTime } from '@/lib/shared/utils';

interface TraceViewerProps {
  agentRunId: string;
  onClose: () => void;
}

interface AgentTrace {
  run_id: string;
  user_id: string;
  timestamp: string;
  input: string;
  agent_status: string;
  tools_called: Array<{
    tool: string;
    symbol: string;
    data_source: string;
    timestamp: string;
    cache_hit: boolean;
    duration_ms?: number;
  }>;
  reasoning: {
    technical_signals: string[];
    trend_analysis: string;
    sentiment: string;
    risk_factors: string[];
  };
  proposal?: {
    action: string;
    symbol: string;
    quantity: number;
    entry_price: number;
    stop_loss: number;
    target_price: number;
    confidence: number;
    holding_window: string;
  };
  evidence_links: string[];
  duration_ms: number;
}

export function TraceViewer({ agentRunId, onClose }: TraceViewerProps) {
  const [trace, setTrace] = useState<AgentTrace | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reasoning' | 'tools' | 'raw'>('reasoning');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchTrace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentRunId]);

  const fetchTrace = async () => {
    try {
      const response = await fetch(`/api/agent/trace/${agentRunId}`);
      if (response.ok) {
        const data = await response.json();
        setTrace(data.trace);
      }
    } catch (error) {
      console.error('Error fetching trace:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!trace) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading trace...</p>
        </div>
      </div>
    );
  }

  if (!trace) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="glass-card p-8 rounded-2xl max-w-md">
          <p className="text-muted-foreground">Trace not found</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card border-2 border-primary/30 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Database className="w-6 h-6 text-primary" />
              Agent Execution Trace
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Run ID: <code className="terminal-font text-xs">{trace.run_id}</code>
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Metadata */}
        <div className="p-6 border-b border-border bg-muted/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Status</div>
              <Badge variant={trace.agent_status === 'COMPLETED' ? 'profit' : 'pending'}>
                {trace.agent_status}
              </Badge>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Timestamp</div>
              <div className="text-sm font-medium">{formatDateTime(trace.timestamp)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Duration</div>
              <div className="text-sm font-medium">{trace.duration_ms}ms</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tools Called</div>
              <div className="text-sm font-medium">{trace.tools_called.length}</div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">User Intent</div>
            <div className="text-sm font-medium italic">&ldquo;{trace.input}&rdquo;</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex">
          <button
            onClick={() => setActiveTab('reasoning')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'reasoning'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Reasoning Summary
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'tools'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tool Calls
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'raw'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Raw JSON
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'reasoning' && (
            <div className="space-y-6">
              {/* Technical Signals */}
              <div>
                <h3 className="font-semibold mb-2">Technical Signals</h3>
                <ul className="space-y-1">
                  {trace.reasoning.technical_signals.map((signal, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{signal}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trend Analysis */}
              <div>
                <h3 className="font-semibold mb-2">Trend Analysis</h3>
                <p className="text-sm">{trace.reasoning.trend_analysis}</p>
              </div>

              {/* Sentiment */}
              <div>
                <h3 className="font-semibold mb-2">Market Sentiment</h3>
                <p className="text-sm">{trace.reasoning.sentiment}</p>
              </div>

              {/* Risk Factors */}
              <div>
                <h3 className="font-semibold mb-2">Risk Factors</h3>
                <ul className="space-y-1">
                  {trace.reasoning.risk_factors.map((risk, idx) => (
                    <li key={idx} className="text-sm">• {risk}</li>
                  ))}
                </ul>
              </div>

              {/* Proposal */}
              {trace.proposal && (
                <div>
                  <h3 className="font-semibold mb-2">Proposal</h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div><span className="font-medium">Action:</span> {trace.proposal.action}</div>
                    <div><span className="font-medium">Symbol:</span> {trace.proposal.symbol}</div>
                    <div><span className="font-medium">Quantity:</span> {trace.proposal.quantity}</div>
                    <div><span className="font-medium">Entry:</span> ${trace.proposal.entry_price}</div>
                    <div><span className="font-medium">Target:</span> ${trace.proposal.target_price}</div>
                    <div><span className="font-medium">Stop Loss:</span> ${trace.proposal.stop_loss}</div>
                    <div><span className="font-medium">Confidence:</span> {(trace.proposal.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'tools' && (
            <div className="space-y-4">
              {trace.tools_called.map((tool, idx) => (
                <div key={idx} className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{tool.tool}</span>
                      <Badge variant={tool.cache_hit ? 'profit' : 'default'} className="text-xs">
                        {tool.cache_hit ? 'Cache Hit' : 'API Call'}
                      </Badge>
                    </div>
                    {tool.duration_ms && (
                      <span className="text-sm text-muted-foreground">{tool.duration_ms}ms</span>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Symbol:</span> {tool.symbol}</div>
                    <div><span className="font-medium">Data Source:</span> {tool.data_source}</div>
                    <div><span className="font-medium">Timestamp:</span> {formatDateTime(tool.timestamp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="relative">
              <Button
                onClick={handleCopy}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 z-10"
              >
                {copied ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
              <pre className="bg-muted/50 rounded-lg p-4 text-xs overflow-x-auto terminal-font">
                {JSON.stringify(trace, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

