/**
 * MongoDB Type Definitions
 * 
 * Types for all MongoDB collections
 */

import { ObjectId } from 'mongodb';

// ============================================
// AGENT RUNS COLLECTION
// ============================================

export interface ToolCall {
  tool: string;
  symbol: string;
  data_source: string;
  timestamp: Date;
  cache_hit: boolean;
  result: Record<string, unknown>;
  duration_ms?: number;
}

export interface AgentReasoning {
  technical_signals: string[];
  trend_analysis: string;
  sentiment: string;
  risk_factors: string[];
}

export interface TradeProposal {
  action: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  quantity: number;
  entry_price: number;
  stop_loss: number;
  target_price: number;
  confidence: number;
  holding_window: string;
}

export interface AgentRun {
  _id?: ObjectId;
  run_id: string; // UUID
  user_id: string; // Clerk ID
  timestamp: Date;
  input: string; // User intent
  agent_status: 'ANALYZING' | 'PROPOSING' | 'COMPLETED' | 'ERROR';
  tools_called: ToolCall[];
  reasoning: AgentReasoning;
  proposal?: TradeProposal;
  evidence_links: string[];
  error?: string;
  duration_ms: number;
  created_at: Date;
}

// ============================================
// MARKET DATA CACHE COLLECTION
// ============================================

export interface MarketDataCache {
  _id?: ObjectId;
  symbol: string;
  timestamp: Date;
  source: string;
  data: Record<string, unknown>; // Raw Yahoo Finance response
  processed: {
    current_price: number;
    change_percent: number;
    volume: number;
    indicators: {
      rsi?: number;
      macd?: {
        value: number;
        signal: number;
        histogram: number;
      };
      moving_averages?: {
        ma_50: number;
        ma_200: number;
      };
    };
  };
  expires_at: Date; // TTL index
}

// ============================================
// AGENT STATISTICS (Aggregation Result)
// ============================================

export interface AgentStats {
  total_runs: number;
  runs_with_proposals: number;
  average_confidence: number;
  unique_users: number;
}

