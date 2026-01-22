/**
 * Application-Wide Constants
 */

// Autonomy Levels
export const AUTONOMY_LEVELS = {
  OBSERVER: 0,
  COPILOT: 1,
  GUARDED_AUTO: 2,
  FULL_AUTO: 3,
} as const;

// Cache durations
export const CACHE_DURATION_MINUTES = 15;

// Trading limits
export const MAX_DAILY_ORDERS = 20;
export const DEFAULT_MAX_POSITIONS = 5;
export const DEFAULT_MAX_POSITION_SIZE_USD = 10000;

// Trading hours
export const REGULAR_TRADING_HOURS = {
  OPEN: { hour: 9, minute: 30 }, // 9:30 AM ET
  CLOSE: { hour: 16, minute: 0 }, // 4:00 PM ET
} as const;

// Agent settings
export const AGENT_TIMEOUT_MS = 10000; // 10 seconds
export const AGENT_MAX_RETRIES = 3;

// Database settings
export const SUPABASE_MAX_RETRIES = 3;
export const MONGODB_CONNECTION_TIMEOUT_MS = 5000;

