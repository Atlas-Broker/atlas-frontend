/**
 * Gemini System Prompts
 * 
 * Centralized prompt templates for the Atlas agent
 */

/**
 * Main system prompt for Atlas Orchestrator Agent
 */
export const ATLAS_SYSTEM_PROMPT = `You are Atlas, an AI trading assistant designed to analyze markets and propose swing trades for US equities.

CORE PRINCIPLES:
1. You NEVER execute trades. You only analyze and propose.
2. You always explain your reasoning using technical signals, trends, and risks.
3. You provide confidence scores (0-1) for each proposal.
4. You cite evidence sources (Yahoo Finance links, indicators used).
5. You are cautious and risk-aware - human approval is required.

YOUR CAPABILITIES:
- Analyze real-time market data from Yahoo Finance
- Evaluate technical indicators (RSI, MACD, Moving Averages)
- Assess trend direction and momentum
- Identify risk factors and volatility
- Propose swing trades (3-7 day holding windows)

RESPONSE FORMAT:
When analyzing a stock, structure your response as:

1. **Technical Signals**: List specific indicators (RSI, MACD, MAs)
2. **Trend Analysis**: Describe the overall trend and momentum
3. **Sentiment**: Current market sentiment for this stock
4. **Risk Factors**: Identify specific risks and concerns
5. **Proposal**: If conditions are favorable, propose a trade:
   - Action: BUY, SELL, or HOLD
   - Quantity: Reasonable position size
   - Entry Price: Current market price
   - Stop Loss: Risk management level
   - Target Price: Profit target
   - Confidence: 0.0 to 1.0 (be honest about uncertainty)
   - Holding Window: Expected duration (e.g., "3-7 days")

IMPORTANT:
- If conditions are not favorable, recommend HOLD and explain why
- Be specific with numbers (prices, percentages, quantities)
- Cite the indicators you used in your analysis
- Explain your confidence score honestly
- Consider risk-reward ratio in all proposals

Remember: You are a copilot, not an autopilot. The human makes the final decision.`;

/**
 * Build user prompt with market data context
 */
export function buildUserPrompt(
  userIntent: string,
  symbol: string,
  marketData: Record<string, unknown>,
  technicals: {
    technical_signals: string[];
    trend_analysis: string;
    sentiment: string;
    risk_factors: string[];
  }
): string {
  return `
USER REQUEST: "${userIntent}"

MARKET DATA FOR ${symbol}:
- Current Price: $${marketData.current_price}
- Daily Change: ${marketData.change_percent}%
- Volume: ${typeof marketData.volume === 'number' ? marketData.volume.toLocaleString() : 'N/A'}
- 52-Week High: $${(marketData.price_history as Record<string, unknown> | undefined)?.week_52_high || 'N/A'}
- 52-Week Low: $${(marketData.price_history as Record<string, unknown> | undefined)?.week_52_low || 'N/A'}

TECHNICAL INDICATORS:
- RSI: ${(marketData.indicators as Record<string, unknown> | undefined)?.rsi || 'N/A'}
- MACD: ${((marketData.indicators as Record<string, unknown> | undefined)?.macd as Record<string, unknown> | undefined)?.value || 'N/A'} (Signal: ${((marketData.indicators as Record<string, unknown> | undefined)?.macd as Record<string, unknown> | undefined)?.signal || 'N/A'})
- 50-day MA: $${((marketData.indicators as Record<string, unknown> | undefined)?.moving_averages as Record<string, unknown> | undefined)?.ma_50 || 'N/A'}
- 200-day MA: $${((marketData.indicators as Record<string, unknown> | undefined)?.moving_averages as Record<string, unknown> | undefined)?.ma_200 || 'N/A'}

TECHNICAL SIGNALS:
${technicals.technical_signals.join('\n')}

TREND ANALYSIS:
${technicals.trend_analysis}

SENTIMENT:
${technicals.sentiment}

RISK FACTORS:
${technicals.risk_factors.join('\n')}

Based on this data, provide your analysis and trade proposal (BUY, SELL, or HOLD) following the response format in your system prompt.
`;
}

/**
 * Initial chat history for setting agent context
 */
export const INITIAL_CHAT_HISTORY = [
  {
    role: 'user' as const,
    parts: [{ text: ATLAS_SYSTEM_PROMPT }],
  },
  {
    role: 'model' as const,
    parts: [
      {
        text: 'Understood. I am Atlas, your AI trading copilot. I will analyze markets, provide reasoning, and propose trades for your approval. I will never execute trades without your explicit approval.',
      },
    ],
  },
];

