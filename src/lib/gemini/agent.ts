/**
 * Atlas Agent Orchestrator
 * 
 * Think → Act → Observe loop using Gemini
 */

import { getGeminiModel } from './client';
import { buildUserPrompt, INITIAL_CHAT_HISTORY } from './prompts';
import { extractSymbol, callMarketDataTool, analyzeTechnicalsTool } from './tools';
import type { AgentReasoning, TradeProposal, ToolCall } from '../mongodb/models';
import type { OrchestratorInput, OrchestratorOutput } from './types';

/**
 * UUID generator
 */
function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Main orchestrator function
 * Runs the Think → Act → Observe loop
 */
export async function runOrchestratorAgent(input: OrchestratorInput): Promise<OrchestratorOutput> {
  const runId = input.runId || uuidv4();
  const startTime = Date.now();

  console.log(`🤖 [${runId}] Starting Atlas agent for user: ${input.userId}`);
  console.log(`💬 User intent: "${input.userIntent}"`);

  const toolsCalled: ToolCall[] = [];
  const evidenceLinks: string[] = [];

  try {
    // Step 1: Extract symbol from intent
    const symbol = extractSymbol(input.userIntent);
    if (!symbol) {
      return {
        runId,
        status: 'ERROR',
        reasoning: {
          technical_signals: [],
          trend_analysis: '',
          sentiment: '',
          risk_factors: [],
        },
        evidence_links: [],
        tools_called: [],
        raw_trace: {
          user_intent: input.userIntent,
          agent_response:
            'Error: Could not identify a stock symbol in your request. Please include a ticker symbol (e.g., NVDA, AAPL).',
          tool_calls: [],
          processing_time_ms: Date.now() - startTime,
        },
        error: 'No symbol found in user intent',
      };
    }

    console.log(`📊 [${runId}] Identified symbol: ${symbol}`);

    // Step 2: Fetch market data
    console.log(`🔧 [${runId}] Calling market data tool for ${symbol}...`);
    const marketDataCall = await callMarketDataTool(symbol);
    toolsCalled.push(marketDataCall);
    evidenceLinks.push(`https://finance.yahoo.com/quote/${symbol}`);

    if (marketDataCall.result.error) {
      throw new Error(`Market data fetch failed: ${marketDataCall.result.error}`);
    }

    // Step 3: Analyze technicals
    console.log(`🔧 [${runId}] Analyzing technicals for ${symbol}...`);
    const technicalsCall = await analyzeTechnicalsTool(symbol);
    toolsCalled.push(technicalsCall);

    if (technicalsCall.result.error) {
      throw new Error(`Technical analysis failed: ${technicalsCall.result.error}`);
    }

    // Step 4: Prepare context for Gemini
    const marketData = marketDataCall.result;
    const technicals = technicalsCall.result as {
      technical_signals: string[];
      trend_analysis: string;
      sentiment: string;
      risk_factors: string[];
    };

    const contextForAI = buildUserPrompt(input.userIntent, symbol, marketData, technicals);

    // Step 5: Call Gemini
    console.log(`🧠 [${runId}] Calling Gemini for reasoning...`);
    const model = getGeminiModel();

    const chat = model.startChat({
      history: INITIAL_CHAT_HISTORY,
    });

    const result = await chat.sendMessage(contextForAI);
    const agentResponse = result.response.text();

    console.log(`✅ [${runId}] Gemini response received`);

    // Step 6: Parse response into structured format
    const parsed = parseAgentResponse(agentResponse, marketData, technicals);

    const processingTime = Date.now() - startTime;

    console.log(`🎉 [${runId}] Agent run completed in ${processingTime}ms`);

    return {
      runId,
      status: parsed.proposal ? 'COMPLETED' : 'PROPOSING',
      reasoning: parsed.reasoning,
      proposal: parsed.proposal,
      evidence_links: evidenceLinks,
      tools_called: toolsCalled,
      raw_trace: {
        user_intent: input.userIntent,
        agent_response: agentResponse,
        tool_calls: toolsCalled,
        processing_time_ms: processingTime,
      },
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${runId}] Agent error:`, error);

    return {
      runId,
      status: 'ERROR',
      reasoning: {
        technical_signals: [],
        trend_analysis: '',
        sentiment: '',
        risk_factors: [],
      },
      evidence_links: evidenceLinks,
      tools_called: toolsCalled,
      raw_trace: {
        user_intent: input.userIntent,
        agent_response: '',
        tool_calls: toolsCalled,
        processing_time_ms: processingTime,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Parse agent response into structured format
 */
function parseAgentResponse(
  response: string,
  marketData: Record<string, unknown>,
  technicals: {
    technical_signals: string[];
    trend_analysis: string;
    sentiment: string;
    risk_factors: string[];
  }
): {
  reasoning: AgentReasoning;
  proposal?: TradeProposal;
} {
  // Use the structured data we already have
  const reasoning: AgentReasoning = {
    technical_signals: technicals.technical_signals,
    trend_analysis: technicals.trend_analysis,
    sentiment: technicals.sentiment,
    risk_factors: technicals.risk_factors,
  };

  // Parse proposal from response (look for BUY/SELL/HOLD action)
  const actionMatch = response.match(/Action:\s*(BUY|SELL|HOLD)/i);
  const action = actionMatch ? (actionMatch[1].toUpperCase() as 'BUY' | 'SELL' | 'HOLD') : 'HOLD';

  // Extract confidence (look for percentage or decimal)
  const confidenceMatch = response.match(/Confidence:\s*(\d+(?:\.\d+)?)/i);
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
  const normalizedConfidence = confidence > 1 ? confidence / 100 : confidence;

  // Extract quantity
  const quantityMatch = response.match(/Quantity:\s*(\d+)/i);
  const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 10;

  // Only create proposal if action is BUY or SELL
  let proposal: TradeProposal | undefined;
  if (action === 'BUY' || action === 'SELL') {
    const currentPrice = typeof marketData.current_price === 'number' ? marketData.current_price : 100;

    proposal = {
      action,
      symbol: typeof marketData.symbol === 'string' ? marketData.symbol : 'UNKNOWN',
      quantity,
      entry_price: currentPrice,
      stop_loss: action === 'BUY' ? currentPrice * 0.95 : currentPrice * 1.05,
      target_price: action === 'BUY' ? currentPrice * 1.1 : currentPrice * 0.9,
      confidence: normalizedConfidence,
      holding_window: '3-7 days',
    };
  }

  return { reasoning, proposal };
}

