/**
 * Yahoo Finance Utility Functions
 * 
 * Technical indicators and data transformation utilities
 */

/**
 * Calculate Relative Strength Index (RSI)
 * Simplified calculation using recent price changes
 */
export function calculateRSI(prices: number[], period: number = 14): number {
  if (prices.length < period + 1) return 50; // Default neutral RSI

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  const gains = changes.map((c) => (c > 0 ? c : 0));
  const losses = changes.map((c) => (c < 0 ? Math.abs(c) : 0));

  const avgGain = gains.slice(-period).reduce((a, b) => a + b, 0) / period;
  const avgLoss = losses.slice(-period).reduce((a, b) => a + b, 0) / period;

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return Math.round(rsi * 100) / 100;
}

/**
 * Calculate Moving Average
 */
export function calculateMA(prices: number[], period: number): number {
  if (prices.length < period) return prices[prices.length - 1] || 0;

  const recentPrices = prices.slice(-period);
  const sum = recentPrices.reduce((a, b) => a + b, 0);
  return Math.round((sum / period) * 100) / 100;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 * Simplified: 12-period EMA - 26-period EMA
 */
export function calculateMACD(prices: number[]): {
  value: number;
  signal: number;
  histogram: number;
} {
  if (prices.length < 26) {
    return { value: 0, signal: 0, histogram: 0 };
  }

  // Simple approximation using SMAs instead of EMAs for demo
  const ema12 = calculateMA(prices, 12);
  const ema26 = calculateMA(prices, 26);
  const macdValue = ema12 - ema26;
  const signal = macdValue; // Simplified - normally would be 9-period EMA of MACD
  const histogram = macdValue - signal;

  return {
    value: Math.round(macdValue * 100) / 100,
    signal: Math.round(signal * 100) / 100,
    histogram: Math.round(histogram * 100) / 100,
  };
}

/**
 * Analyze technical signals for agent reasoning
 */
export function analyzeTechnicalSignals(data: { indicators: { rsi?: number; macd?: { histogram: number }; moving_averages?: { ma_50: number; ma_200: number } }; current_price: number; volume: number }): string[] {
  const signals: string[] = [];

  // RSI Analysis
  if (data.indicators.rsi) {
    if (data.indicators.rsi < 30) {
      signals.push(`RSI oversold at ${data.indicators.rsi.toFixed(1)} (strong buy signal)`);
    } else if (data.indicators.rsi > 70) {
      signals.push(`RSI overbought at ${data.indicators.rsi.toFixed(1)} (potential sell signal)`);
    } else {
      signals.push(`RSI neutral at ${data.indicators.rsi.toFixed(1)}`);
    }
  }

  // MACD Analysis
  if (data.indicators.macd) {
    if (data.indicators.macd.histogram > 0) {
      signals.push('MACD bullish crossover (positive momentum)');
    } else {
      signals.push('MACD bearish crossover (negative momentum)');
    }
  }

  // Moving Average Analysis
  if (data.indicators.moving_averages) {
    const { ma_50, ma_200 } = data.indicators.moving_averages;
    if (data.current_price > ma_50) {
      signals.push(`Price above 50-day MA at $${ma_50.toFixed(2)} (bullish)`);
    } else {
      signals.push(`Price below 50-day MA at $${ma_50.toFixed(2)} (bearish)`);
    }

    if (ma_50 > ma_200) {
      signals.push('Golden cross (50-day > 200-day MA)');
    } else if (ma_50 < ma_200) {
      signals.push('Death cross (50-day < 200-day MA)');
    }
  }

  // Volume Analysis
  if (data.volume > 1000000) {
    signals.push(`High volume (${(data.volume / 1000000).toFixed(1)}M shares)`);
  }

  return signals;
}

/**
 * Determine trend direction
 */
export function determineTrend(data: { indicators: { rsi?: number; macd?: { histogram: number }; moving_averages?: { ma_50: number; ma_200: number } }; current_price: number; volume: number }): string {
  const signals = analyzeTechnicalSignals(data);
  const bullishCount = signals.filter((s) => s.includes('bullish') || s.includes('Golden') || s.includes('above')).length;
  const bearishCount = signals.filter((s) => s.includes('bearish') || s.includes('Death') || s.includes('below')).length;

  if (bullishCount > bearishCount) {
    return 'Strong uptrend - multiple bullish indicators';
  } else if (bearishCount > bullishCount) {
    return 'Downtrend - caution advised';
  } else {
    return 'Sideways/neutral trend - mixed signals';
  }
}

/**
 * Get basic sentiment (mock for now - can integrate news API later)
 */
export function getBasicSentiment(data: { change_percent: number }): string {
  // Simple sentiment based on price change
  if (data.change_percent > 2) {
    return 'Positive - strong upward momentum today';
  } else if (data.change_percent < -2) {
    return 'Negative - significant decline today';
  } else {
    return 'Neutral - stable price action';
  }
}

/**
 * Identify risk factors
 */
export function identifyRiskFactors(data: { indicators: { rsi?: number }; current_price: number; price_history: { daily_high: number; daily_low: number; week_52_high: number; week_52_low: number } }): string[] {
  const risks: string[] = [];

  // Volatility check
  const dailyRange = ((data.price_history.daily_high - data.price_history.daily_low) / data.current_price) * 100;
  if (dailyRange > 5) {
    risks.push('High intraday volatility (>5% range)');
  }

  // Overbought/oversold extremes
  if (data.indicators.rsi && data.indicators.rsi > 75) {
    risks.push('Extreme overbought conditions - potential reversal');
  }
  if (data.indicators.rsi && data.indicators.rsi < 25) {
    risks.push('Extreme oversold conditions - high risk');
  }

  // Near 52-week highs/lows
  if (data.current_price >= data.price_history.week_52_high * 0.95) {
    risks.push('Trading near 52-week high - limited upside');
  }
  if (data.current_price <= data.price_history.week_52_low * 1.05) {
    risks.push('Trading near 52-week low - catching falling knife risk');
  }

  if (risks.length === 0) {
    risks.push('Standard market risk - normal volatility');
  }

  return risks;
}

