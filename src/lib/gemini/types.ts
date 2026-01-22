/**
 * Gemini Service Type Definitions
 */

import type { AgentReasoning, TradeProposal, ToolCall } from '../mongodb/models';

export interface OrchestratorInput {
  userId: string;
  userIntent: string;
  runId?: string; // Optional - generated if not provided
}

export interface OrchestratorOutput {
  runId: string;
  status: 'ANALYZING' | 'PROPOSING' | 'COMPLETED' | 'ERROR';
  reasoning: AgentReasoning;
  proposal?: TradeProposal;
  evidence_links: string[];
  tools_called: ToolCall[];
  raw_trace: {
    user_intent: string;
    agent_response: string;
    tool_calls: ToolCall[];
    processing_time_ms: number;
  };
  error?: string;
}

