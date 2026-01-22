/**
 * Custom Error Classes
 */

/**
 * Agent execution error
 */
export class AgentError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AgentError';
  }
}

/**
 * Market data fetch error
 */
export class MarketDataError extends Error {
  constructor(
    message: string,
    public symbol: string,
    public source: string
  ) {
    super(message);
    this.name = 'MarketDataError';
  }
}

/**
 * Database operation error
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public operation: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Authentication/Authorization error
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'INVALID_TOKEN'
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Handle unknown errors and extract useful information
 */
export function handleError(error: unknown): { message: string; code: string } {
  if (error instanceof AgentError) {
    return { message: error.message, code: error.code };
  }

  if (error instanceof MarketDataError) {
    return { message: error.message, code: 'MARKET_DATA_ERROR' };
  }

  if (error instanceof DatabaseError) {
    return { message: error.message, code: 'DATABASE_ERROR' };
  }

  if (error instanceof AuthError) {
    return { message: error.message, code: error.code };
  }

  if (error instanceof Error) {
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { message: 'An unknown error occurred', code: 'UNKNOWN_ERROR' };
}

