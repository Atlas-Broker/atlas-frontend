import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { EnvironmentType, OrderStatus, UserRole } from './supabase';

/**
 * Merge Tailwind CSS classes with proper precedence
 * Useful for component variants and conditional styling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as USD currency
 * @param value - Number to format
 * @param includeSign - Whether to include +/- sign for positive/negative values
 */
export function formatCurrency(value: number, includeSign: boolean = false): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));

  if (includeSign) {
    if (value > 0) return `+${formatted}`;
    if (value < 0) return `-${formatted}`;
  }

  return formatted;
}

/**
 * Format number as percentage
 * @param value - Number to format (0.05 = 5%)
 * @param includeSign - Whether to include +/- sign
 * @param decimals - Number of decimal places (default: 2)
 */
export function formatPercentage(
  value: number,
  includeSign: boolean = false,
  decimals: number = 2
): string {
  const percentage = (value * 100).toFixed(decimals);
  
  if (includeSign) {
    if (value > 0) return `+${percentage}%`;
    if (value < 0) return `${percentage}%`;
  }

  return `${percentage}%`;
}

/**
 * Format timestamp as readable date/time
 * @param timestamp - ISO timestamp string
 * @param includeTime - Whether to include time (default: true)
 */
export function formatDateTime(timestamp: string | null, includeTime: boolean = true): string {
  if (!timestamp) return 'N/A';

  const date = new Date(timestamp);
  
  if (includeTime) {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Format timestamp as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDateTime(timestamp, false);
}

/**
 * Get Tailwind color classes for environment badge
 */
export function getEnvironmentBadgeColor(environment: EnvironmentType): string {
  switch (environment) {
    case 'paper':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'live':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get Tailwind color classes for order status badge
 */
export function getOrderStatusColor(status: OrderStatus): string {
  switch (status) {
    case 'proposed':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'approved':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'submitted':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'filled':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'cancelled':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'failed':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get Tailwind color classes for user role badge
 */
export function getRoleBadgeColor(role: UserRole): string {
  switch (role) {
    case 'trader':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'admin':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'superadmin':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

/**
 * Get readable label for autonomy level
 */
export function getAutonomyLevelLabel(level: 0 | 1 | 2 | 3): string {
  switch (level) {
    case 0:
      return 'Observer';
    case 1:
      return 'Copilot';
    case 2:
      return 'Guarded Auto';
    case 3:
      return 'Full Auto';
    default:
      return 'Unknown';
  }
}

/**
 * Get description for autonomy level
 */
export function getAutonomyLevelDescription(level: 0 | 1 | 2 | 3): string {
  switch (level) {
    case 0:
      return 'Agent only monitors markets, never trades';
    case 1:
      return 'Agent proposes trades, you approve each one';
    case 2:
      return 'Agent trades within limits, notifies you';
    case 3:
      return 'Agent trades freely within risk parameters';
    default:
      return '';
  }
}

/**
 * Get text color class for P&L value
 */
export function getPnLColor(value: number): string {
  if (value > 0) return 'text-green-600';
  if (value < 0) return 'text-red-600';
  return 'text-gray-600';
}

/**
 * Get background color class for P&L value
 */
export function getPnLBgColor(value: number): string {
  if (value > 0) return 'bg-green-50';
  if (value < 0) return 'bg-red-50';
  return 'bg-gray-50';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Capitalize first letter of string
 */
export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Convert string to title case
 */
export function toTitleCase(text: string): string {
  return text
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue);
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(1) + 'B';
  }
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(1) + 'M';
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(1) + 'K';
  }
  return value.toString();
}

/**
 * Sleep utility for async delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate stock symbol format
 */
export function isValidSymbol(symbol: string): boolean {
  // Basic validation: 1-5 uppercase letters
  return /^[A-Z]{1,5}$/.test(symbol);
}

/**
 * Get current trading day (market close is 4 PM ET)
 */
export function getTradingDate(): Date {
  const now = new Date();
  const hour = now.getHours();
  
  // If before 4 PM, use current date, otherwise use next day
  if (hour < 16) {
    return now;
  }
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

/**
 * Check if current time is during regular trading hours (9:30 AM - 4:00 PM ET)
 */
export function isRegularTradingHours(): boolean {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour * 100 + minute;
  
  // Approximate check (doesn't account for timezone perfectly)
  return time >= 930 && time < 1600;
}

