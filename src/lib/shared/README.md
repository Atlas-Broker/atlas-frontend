# Shared Utilities

This folder contains common utilities used across the entire Atlas application.

## 📁 File Structure

```
shared/
├── utils.ts        # Formatting, date/time, styling utilities
├── constants.ts    # Application-wide constants
├── errors.ts       # Custom error classes and error handling
└── README.md       # This file
```

## 📄 File Descriptions

### `utils.ts`
**Purpose**: Common utility functions for formatting, styling, and data manipulation

**Categories**:
1. **Styling Utilities** - Tailwind CSS class merging
2. **Number Formatting** - Currency, percentages, compact numbers
3. **Date/Time Formatting** - Timestamps, relative time
4. **Color Utilities** - Badge colors, P&L colors
5. **Text Utilities** - Truncate, capitalize, title case
6. **Calculation Utilities** - Percentage change, initials
7. **Validation Utilities** - Symbol validation
8. **Trading Utilities** - Trading date, market hours

#### Styling Utilities

**`cn(...inputs)`** - Merge Tailwind CSS classes
```typescript
import { cn } from '@/lib/shared/utils';

const className = cn(
  'px-4 py-2 rounded',
  isActive && 'bg-blue-500',
  isDisabled && 'opacity-50'
);
// Result: "px-4 py-2 rounded bg-blue-500" (if active)
```

#### Number Formatting

**`formatCurrency(value, includeSign?)`** - Format as USD
```typescript
import { formatCurrency } from '@/lib/shared/utils';

formatCurrency(1234.56);          // "$1,234.56"
formatCurrency(1234.56, true);    // "+$1,234.56"
formatCurrency(-500, true);       // "-$500.00"
```

**`formatPercentage(value, includeSign?, decimals?)`** - Format as percentage
```typescript
import { formatPercentage } from '@/lib/shared/utils';

formatPercentage(0.0523);         // "5.23%"
formatPercentage(0.0523, true);   // "+5.23%"
formatPercentage(-0.0315, true);  // "-3.15%"
formatPercentage(0.12345, false, 3); // "12.345%"
```

**`formatCompactNumber(value)`** - Format large numbers with K/M/B
```typescript
import { formatCompactNumber } from '@/lib/shared/utils';

formatCompactNumber(1234);        // "1.2K"
formatCompactNumber(1234567);     // "1.2M"
formatCompactNumber(1234567890);  // "1.2B"
```

#### Date/Time Formatting

**`formatDateTime(timestamp, includeTime?)`** - Format timestamp
```typescript
import { formatDateTime } from '@/lib/shared/utils';

formatDateTime('2024-01-15T14:30:00Z');        // "Jan 15, 2024, 2:30 PM"
formatDateTime('2024-01-15T14:30:00Z', false); // "Jan 15, 2024"
```

**`formatRelativeTime(timestamp)`** - Format as relative time
```typescript
import { formatRelativeTime } from '@/lib/shared/utils';

formatRelativeTime(now - 30000);      // "just now"
formatRelativeTime(now - 300000);     // "5m ago"
formatRelativeTime(now - 3600000);    // "1h ago"
formatRelativeTime(now - 86400000);   // "1d ago"
```

#### Color Utilities

**`getEnvironmentBadgeColor(environment)`** - Get badge colors
```typescript
import { getEnvironmentBadgeColor } from '@/lib/shared/utils';

getEnvironmentBadgeColor('paper'); // "bg-green-100 text-green-800 border-green-200"
getEnvironmentBadgeColor('live');  // "bg-red-100 text-red-800 border-red-200"
```

**`getOrderStatusColor(status)`** - Get order status colors
```typescript
import { getOrderStatusColor } from '@/lib/shared/utils';

getOrderStatusColor('proposed');  // "bg-yellow-100 text-yellow-800 border-yellow-200"
getOrderStatusColor('filled');    // "bg-green-100 text-green-800 border-green-200"
getOrderStatusColor('rejected');  // "bg-red-100 text-red-800 border-red-200"
```

**`getRoleBadgeColor(role)`** - Get role badge colors
```typescript
import { getRoleBadgeColor } from '@/lib/shared/utils';

getRoleBadgeColor('trader');      // "bg-gray-100 text-gray-800 border-gray-200"
getRoleBadgeColor('admin');       // "bg-purple-100 text-purple-800 border-purple-200"
getRoleBadgeColor('superadmin');  // "bg-red-100 text-red-800 border-red-200"
```

**`getPnLColor(value)`** - Get P&L text color
```typescript
import { getPnLColor } from '@/lib/shared/utils';

getPnLColor(1500);   // "text-green-600" (profit)
getPnLColor(-500);   // "text-red-600" (loss)
getPnLColor(0);      // "text-gray-600" (neutral)
```

**`getPnLBgColor(value)`** - Get P&L background color
```typescript
import { getPnLBgColor } from '@/lib/shared/utils';

getPnLBgColor(1500);  // "bg-green-50"
getPnLBgColor(-500);  // "bg-red-50"
getPnLBgColor(0);     // "bg-gray-50"
```

#### Text Utilities

**`truncate(text, length)`** - Truncate text with ellipsis
```typescript
import { truncate } from '@/lib/shared/utils';

truncate("This is a long string", 10); // "This is a..."
```

**`capitalize(text)`** - Capitalize first letter
```typescript
import { capitalize } from '@/lib/shared/utils';

capitalize("hello");  // "Hello"
```

**`toTitleCase(text)`** - Convert to title case
```typescript
import { toTitleCase } from '@/lib/shared/utils';

toTitleCase("max_daily_orders");  // "Max Daily Orders"
```

**`getInitials(name)`** - Generate initials from name
```typescript
import { getInitials } from '@/lib/shared/utils';

getInitials("John Doe");     // "JD"
getInitials("Jane");         // "JA"
getInitials("");             // "?"
```

#### Calculation Utilities

**`calculatePercentageChange(oldValue, newValue)`** - Calculate % change
```typescript
import { calculatePercentageChange } from '@/lib/shared/utils';

calculatePercentageChange(100, 110);  // 0.10 (10%)
calculatePercentageChange(100, 95);   // -0.05 (-5%)
```

#### Autonomy Level Utilities

**`getAutonomyLevelLabel(level)`** - Get autonomy level label
```typescript
import { getAutonomyLevelLabel } from '@/lib/shared/utils';

getAutonomyLevelLabel(0);  // "Observer"
getAutonomyLevelLabel(1);  // "Copilot"
getAutonomyLevelLabel(2);  // "Guarded Auto"
getAutonomyLevelLabel(3);  // "Full Auto"
```

**`getAutonomyLevelDescription(level)`** - Get autonomy level description
```typescript
import { getAutonomyLevelDescription } from '@/lib/shared/utils';

getAutonomyLevelDescription(1);
// "Agent proposes trades, you approve each one"
```

#### Validation Utilities

**`isValidSymbol(symbol)`** - Validate stock symbol format
```typescript
import { isValidSymbol } from '@/lib/shared/utils';

isValidSymbol("AAPL");   // true
isValidSymbol("NVDA");   // true
isValidSymbol("aapl");   // false (must be uppercase)
isValidSymbol("ABCDEF"); // false (too long, max 5 chars)
```

#### Trading Utilities

**`getTradingDate()`** - Get current trading date
```typescript
import { getTradingDate } from '@/lib/shared/utils';

// If before 4 PM ET: returns today
// If after 4 PM ET: returns tomorrow
const tradingDate = getTradingDate();
```

**`isRegularTradingHours()`** - Check if market is open
```typescript
import { isRegularTradingHours } from '@/lib/shared/utils';

if (isRegularTradingHours()) {
  console.log("Market is open (9:30 AM - 4:00 PM ET)");
} else {
  console.log("Market is closed");
}
```

**`sleep(ms)`** - Async delay utility
```typescript
import { sleep } from '@/lib/shared/utils';

await sleep(1000); // Wait 1 second
console.log("1 second later...");
```

---

### `constants.ts`
**Purpose**: Application-wide constants

**Exports**:
- `AUTONOMY_LEVELS` - Autonomy level enum
- `CACHE_DURATION_MINUTES` - Market data cache duration
- `MAX_DAILY_ORDERS` - Default max daily orders
- `DEFAULT_MAX_POSITIONS` - Default max concurrent positions

**Usage**:
```typescript
import { AUTONOMY_LEVELS, CACHE_DURATION_MINUTES } from '@/lib/shared/constants';

const settings = {
  autonomy_level: AUTONOMY_LEVELS.COPILOT, // 1
  max_daily_orders: 20,
};

const cacheExpiresAt = new Date(Date.now() + CACHE_DURATION_MINUTES * 60 * 1000);
```

---

### `errors.ts`
**Purpose**: Custom error classes and error handling

**Exports**:
- `AgentError` - Agent-related errors
- `MarketDataError` - Market data fetch errors
- `DatabaseError` - Database operation errors
- `handleError(error)` - Generic error handler

**Custom Error Classes**:

```typescript
import { AgentError, MarketDataError, DatabaseError } from '@/lib/shared/errors';

// Agent Error
throw new AgentError('Failed to extract symbol from intent', 'SYMBOL_EXTRACTION_ERROR');

// Market Data Error
throw new MarketDataError('Symbol not found', 'SYMBOL_NOT_FOUND');

// Database Error
throw new DatabaseError('Connection timeout', 'DB_CONNECTION_TIMEOUT');
```

**Error Handler**:

```typescript
import { handleError } from '@/lib/shared/errors';

try {
  // ... some operation
} catch (error) {
  const { message, code } = handleError(error);
  console.error(`[${code}] ${message}`);
  
  return Response.json({ error: message, code }, { status: 500 });
}
```

---

## 🛠️ Common Patterns

### Formatting in React Components
```typescript
import { formatCurrency, formatPercentage, formatDateTime } from '@/lib/shared/utils';

export function OrderCard({ order }: { order: Order }) {
  return (
    <div>
      <p>Symbol: {order.symbol}</p>
      <p>Price: {formatCurrency(order.filled_price)}</p>
      <p>Change: {formatPercentage(order.change_percent, true)}</p>
      <p>Time: {formatDateTime(order.filled_at)}</p>
    </div>
  );
}
```

### Styling with cn()
```typescript
import { cn } from '@/lib/shared/utils';

export function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded font-medium',
        variant === 'primary' && 'bg-blue-600 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
      {...props}
    />
  );
}
```

### Dynamic Badge Colors
```typescript
import { getOrderStatusColor } from '@/lib/shared/utils';
import { Badge } from '@/components/ui/badge';

export function OrderStatus({ status }: { status: OrderStatus }) {
  return (
    <Badge className={getOrderStatusColor(status)}>
      {status.toUpperCase()}
    </Badge>
  );
}
```

### Error Handling in API Routes
```typescript
import { handleError, AgentError } from '@/lib/shared/errors';

export async function POST(request: Request) {
  try {
    // ... operation that might fail
    if (!symbol) {
      throw new AgentError('No symbol provided', 'MISSING_SYMBOL');
    }
    // ... rest of logic
  } catch (error) {
    const { message, code } = handleError(error);
    return Response.json({ error: message, code }, { status: 500 });
  }
}
```

---

## ⚠️ Important Notes

### DO:
- ✅ Use `cn()` for all conditional className logic
- ✅ Use formatting functions for consistency across the app
- ✅ Use custom error classes for better error categorization
- ✅ Use constants instead of magic numbers
- ✅ Use utility functions to avoid code duplication

### DON'T:
- ❌ Duplicate formatting logic across components
- ❌ Use inline date/number formatting (use utilities)
- ❌ Throw generic Error objects (use custom error classes)
- ❌ Hard-code colors (use color utility functions)
- ❌ Re-implement existing utilities

---

## 🧪 Testing

Example test patterns for utilities:

```typescript
import { formatCurrency, formatPercentage, isValidSymbol } from '@/lib/shared/utils';

describe('formatCurrency', () => {
  it('formats positive numbers', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });
  
  it('formats with sign', () => {
    expect(formatCurrency(1234.56, true)).toBe('+$1,234.56');
    expect(formatCurrency(-500, true)).toBe('-$500.00');
  });
});

describe('isValidSymbol', () => {
  it('validates correct symbols', () => {
    expect(isValidSymbol('AAPL')).toBe(true);
    expect(isValidSymbol('NVDA')).toBe(true);
  });
  
  it('rejects invalid symbols', () => {
    expect(isValidSymbol('aapl')).toBe(false);
    expect(isValidSymbol('ABCDEF')).toBe(false);
  });
});
```

---

## 📚 Related Documentation
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [clsx Documentation](https://github.com/lukeed/clsx)
- [Intl.NumberFormat (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
- [Intl.DateTimeFormat (MDN)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)

---

**Last Updated**: 2026-01-22
