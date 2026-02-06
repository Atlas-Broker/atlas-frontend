# Atlas Design System - MooMoo Orange Theme

## 🎨 Overview

Atlas features a professional trading platform design with **MooMoo's signature orange (#FF6B00)** as the primary brand color, creating a high-end fintech aesthetic inspired by Bloomberg Terminal and modern trading dashboards.

## 🏗️ Installation Complete

All shadcn/ui components are installed and configured with the custom orange theme:

```bash
✅ class-variance-authority
✅ lucide-react  
✅ @radix-ui/react-slot
✅ next-themes
✅ tailwindcss-animate
```

## 🎨 Color System

### Light Mode
- **Background**: Pure white (`#FFFFFF`)
- **Primary**: MooMoo Orange (`#FF6B00` - HSL: 22 100% 50%)
- **Accents**: Light orange variants for hover states
- **Text**: Dark gray for readability
- **Cards**: White with subtle orange borders on hover

### Dark Mode  
- **Background**: Deep charcoal (`HSL: 240 10% 3.9%`)
- **Primary**: Bright orange (`HSL: 22 100% 55%`) - glows in dark
- **Accents**: Vibrant orange for CTAs
- **Text**: Off-white for reduced eye strain
- **Cards**: Dark with orange glow effects

### Trading-Specific Colors
- **Profit**: Green (`HSL: 142 76% 36%`)
- **Loss**: Red (`HSL: 0 84.2% 60.2%`)
- **Chart Colors**: 5-shade orange palette for data visualization

## 🧩 Component Library

### 1. Button Component
Located: `src/components/ui/button.tsx`

**Variants:**
- `default` - Primary orange with shadow
- `destructive` - Red for dangerous actions
- `outline` - Border-only style
- `secondary` - Muted background
- `ghost` - Transparent, hover effect only
- `link` - Text link style
- **Trading-specific:**
  - `profit` - Green for buy/profit actions
  - `loss` - Red for sell/loss actions
  - `glow` - Orange with glow effect (perfect for CTAs)

**Sizes:** `sm`, `default`, `lg`, `icon`

**Usage:**
```tsx
import { Button } from "@/components/ui/button"

<Button variant="glow" size="lg">
  Place Trade
</Button>
```

### 2. Card Component
Located: `src/components/ui/card.tsx`

**Components:**
- `Card` - Container
- `CardHeader` - Top section
- `CardTitle` - Heading
- `CardDescription` - Subtitle
- `CardContent` - Main content
- `CardFooter` - Bottom actions
- `TradingCard` - Glass morphism variant with orange glow on hover

**Usage:**
```tsx
import { TradingCard, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<TradingCard>
  <CardHeader>
    <CardTitle>Portfolio Value</CardTitle>
  </CardHeader>
  <CardContent>
    $50,000
  </CardContent>
</TradingCard>
```

### 3. Badge Component
Located: `src/components/ui/badge.tsx`

**Variants:**
- `default` - Orange
- `secondary` - Gray
- `destructive` - Red
- `outline` - Bordered
- **Trading-specific:**
  - `profit` - Green background
  - `loss` - Red background
  - `pending` - Yellow (for pending orders)
  - `filled` - Green outline (filled orders)
  - `rejected` - Red outline
  - `paper` - Green for paper trading
  - `live` - Orange with glow for live trading

**Usage:**
```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="paper">Paper Trading</Badge>
<Badge variant="live">LIVE</Badge>
```

### 4. Alert Component
Located: `src/components/ui/alert.tsx`

**Variants:**
- `default` - Neutral
- `destructive` - Error/danger
- `warning` - Orange for warnings
- `profit` - Green for success
- `loss` - Red for errors
- `info` - Blue for information

**Usage:**
```tsx
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"

<Alert variant="warning">
  <AlertTitle>Order Proposed</AlertTitle>
  <AlertDescription>
    AI agent suggests buying 100 shares of AAPL
  </AlertDescription>
</Alert>
```

### 5. Theme Toggle
Located: `src/components/theme-toggle.tsx`

Animated sun/moon toggle with orange accent colors.

**Usage:**
```tsx
import { ThemeToggle } from "@/components/theme-toggle"

<ThemeToggle />
```

## 🎭 Theme Provider

Located: `src/components/theme-provider.tsx`

Wraps the entire app in `app/layout.tsx`:

```tsx
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>
```

## 💅 Custom Utilities

### Glow Effects
```tsx
<div className="glow-orange">Orange glow</div>
<div className="glow-orange-strong">Strong orange glow</div>
```

### Glass Morphism
```tsx
<div className="glass">Frosted glass effect</div>
<div className="glass-card">Glass card variant</div>
```

### Gradient Backgrounds
```tsx
<div className="gradient-orange">Orange gradient</div>
<div className="bg-orange-glow">Radial orange glow</div>
```

### Trading-Specific
```tsx
<span className="text-profit">+$1,234</span>
<span className="text-loss">-$567</span>
<div className="font-terminal">AAPL: $178.25</div>
```

### Price Animations
```tsx
<div className="price-up">Price increased</div>
<div className="price-down">Price decreased</div>
```

## 📊 Chart Colors

Use these CSS variables for consistent chart theming:

```tsx
const chartColors = {
  primary: 'hsl(var(--chart-1))',    // Main orange
  secondary: 'hsl(var(--chart-2))',  // Light orange
  tertiary: 'hsl(var(--chart-3))',   // Dark orange
  accent: 'hsl(var(--chart-4))',     // Bright orange
  muted: 'hsl(var(--chart-5))',      // Deep orange
}
```

## 🎯 Design Principles

### 1. Futuristic Terminal Aesthetic
- Glass morphism effects
- Subtle orange glows
- Monospace fonts for numbers
- Smooth transitions

### 2. Professional Trading Platform
- High contrast for readability
- Clear data hierarchy
- Semantic colors (green=profit, red=loss)
- Consistent spacing

### 3. MooMoo Orange Identity
- Orange as primary brand color
- Orange gradients for CTAs
- Orange accents throughout
- Orange glows in dark mode

### 4. Accessibility (WCAG AA)
- All color combinations tested for contrast
- Focus states clearly visible
- Keyboard navigation support
- Screen reader friendly

## 📱 Responsive Design

All components are mobile-first and fully responsive:

- **Mobile** (< 640px): Stack layouts, simplified navigation
- **Tablet** (640px - 1024px): Grid layouts, collapsible sidebar
- **Desktop** (> 1024px): Full feature set, multi-column layouts

## 🚀 Usage Examples

### Landing Page
See: `app/page.tsx` - Full implementation with:
- Hero section with orange CTAs
- Feature cards with glass effect
- Stats section
- Animated elements

### Dashboard
See: `app/dashboard/layout.tsx` - Trading dashboard with:
- Glass navigation bar
- Orange hover states
- Theme toggle
- Trading environment badge

### Component Showcase
```tsx
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert } from "@/components/ui/alert"
import { TradingCard } from "@/components/ui/card"

// High-priority trading action
<Button variant="glow" size="lg">Execute Trade</Button>

// Order status
<Badge variant="filled">Filled</Badge>
<Badge variant="pending">Pending</Badge>

// Trade alert
<Alert variant="profit">
  Trade executed successfully!
</Alert>

// Portfolio card
<TradingCard className="hover:glow-orange">
  <CardHeader>
    <CardTitle>Total P&L</CardTitle>
  </CardHeader>
  <CardContent>
    <span className="text-profit text-3xl font-bold">
      +$2,847.50
    </span>
  </CardContent>
</TradingCard>
```

## 🎨 Customization

To adjust the orange shade, edit `app/globals.css`:

```css
:root {
  --primary: 22 100% 50%; /* Change hue (0-360), saturation (0-100%), lightness (0-100%) */
}
```

To add new chart colors, extend the theme in `tailwind.config.ts`:

```ts
chart: {
  6: "hsl(var(--chart-6))",
}
```

## 📚 Resources

- **Tailwind CSS**: https://tailwindcss.com
- **shadcn/ui**: https://ui.shadcn.com
- **Lucide Icons**: https://lucide.dev
- **next-themes**: https://github.com/pacocoursey/next-themes
- **Class Variance Authority**: https://cva.style

---

**Built with attention to detail for a professional trading experience.** 🚀

