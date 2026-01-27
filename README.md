# Atlas Frontend

**Modern Trading Platform UI with AI Agent Integration**

Next.js 14+ frontend with beautiful MooMoo Orange theme, Clerk authentication, and real-time AI agent interaction.

[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🌟 Features

### Role-Based Dashboard
- **Trader View**: Personal portfolio, AI agent copilot, trade approvals
- **Admin View**: Platform analytics, all orders, user management
- **SuperAdmin View**: Role management, system configuration, view toggle

### AI Agent Integration
- **Real-Time Streaming**: See agent thinking via Server-Sent Events (SSE)
- **Interactive Q&A**: Ask trading questions, get detailed analysis
- **Trade Approval**: Review AI proposals, approve/reject with reasoning
- **Complete Traces**: View full execution history in MongoDB

### Beautiful MooMoo Orange Theme
- **Custom Design System**: Orange (#FF8800) primary with glass morphism
- **Light/Dark Modes**: Seamless theme switching
- **Responsive**: Mobile-first, works on all devices
- **Accessible**: WCAG 2.1 AA compliant

### Production-Ready
- **Clerk Authentication**: Secure user management with JWT
- **Supabase Integration**: Real-time database with RLS
- **TypeScript**: Full type safety across the app
- **shadcn/ui**: Beautiful, accessible components

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Clerk account
- Supabase project

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd atlas-frontend

# Install dependencies
npm install

# Copy environment template
cp env.template .env.local

# Edit .env.local with your credentials
```

### Environment Variables

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx
CLERK_SECRET_KEY=sk_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx  # Server-side only

# Backend API (optional, for agent features)
NEXT_PUBLIC_API_URL=http://localhost:8000

# MongoDB (optional, for traces)
MONGODB_URI=mongodb+srv://xxx
```

### Database Setup

```bash
# Run unified migration
# See: ../atlas-database/migrations/supabase/001_unified_schema.sql

# Copy TypeScript types
cp ../atlas-database/schemas/typescript/supabase.types.ts \
   src/types/database/
```

### Run Development Server

```bash
npm run dev
# Runs on http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
atlas-frontend/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Auth layout
│   │   ├── sign-in/
│   │   └── sign-up/
│   │
│   ├── dashboard/               # Trader dashboard
│   │   ├── page.tsx            # Overview
│   │   ├── orders/             # Order management
│   │   ├── positions/          # Current positions
│   │   ├── settings/           # User settings
│   │   └── watchlist/          # Stock watchlist
│   │
│   ├── admin/                   # Admin panel
│   │   ├── analytics/          # Platform analytics
│   │   ├── orders/             # All orders
│   │   └── users/              # User management
│   │
│   ├── superadmin/             # SuperAdmin panel
│   │   └── page.tsx
│   │
│   ├── api/                     # API routes
│   │   ├── agent/              # Agent proxy
│   │   └── webhooks/           # Clerk webhooks
│   │
│   └── layout.tsx              # Root layout
│
├── src/
│   ├── components/              # React components
│   │   ├── shared/             # Shared components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── RoleToggle.tsx  # SuperAdmin toggle
│   │   │   └── ...
│   │   ├── trader/             # Trader-specific
│   │   │   ├── AgentChat.tsx
│   │   │   ├── PortfolioSummary.tsx
│   │   │   └── ...
│   │   ├── admin/              # Admin-specific
│   │   └── ui/                 # shadcn/ui components
│   │
│   └── lib/                     # Utilities
│       ├── clerk/              # Clerk utilities
│       ├── supabase/           # Supabase client
│       │   ├── client.ts       # Client-side
│       │   ├── admin.ts        # Server-side (service role)
│       │   └── queries.ts      # Database queries
│       ├── gemini/             # Gemini AI integration
│       ├── mongodb/            # MongoDB client (traces)
│       └── yahoofinance/       # Market data
│
├── knowledge/                   # Documentation
│   ├── 000_INDEX.md
│   ├── 003_DESIGN_SYSTEM.md    # MooMoo Orange theme
│   ├── 006_PROJECT_SUMMARY.md  # Project overview
│   └── ...
│
├── public/                      # Static assets
├── tailwind.config.ts          # Tailwind configuration
└── package.json
```

---

## 🎨 Design System

### MooMoo Orange Theme

**Primary Colors**:
- Orange: `#FF8800` (MooMoo signature)
- Dark: `#1a1a1a`
- Light: `#ffffff`

**Design Features**:
- Glass morphism effects
- Smooth animations
- Consistent spacing (4px grid)
- Orange accent throughout

**See**: `knowledge/003_DESIGN_SYSTEM.md` for complete guide

### Component Library

Using **shadcn/ui** components:
- Button, Card, Input, Select
- Badge, Alert, Modal, Toast
- Table, Tabs, Dialog
- All customized with MooMoo Orange theme

---

## 🔐 Authentication

### Clerk Integration

**Flow**:
1. User signs up/in with Clerk
2. JWT token included in requests
3. Profile auto-created in Supabase via webhook
4. RLS policies enforce data isolation

**Webhooks**:
```typescript
// app/api/webhooks/clerk/route.ts
POST /api/webhooks/clerk

// Handles:
// - user.created → Create profile in Supabase
// - user.updated → Update profile
// - user.deleted → Soft delete profile
```

### Role-Based Access

**Roles** (defined in Supabase):
- `trader` - Default role, personal dashboard
- `admin` - Access to analytics and all orders
- `superadmin` - Full access + role management + view toggle

**Permission Checks**:
```typescript
import { checkPermission } from '@/lib/clerk/permissions';

// In Server Component
const canViewOrders = await checkPermission('orders:read');

// In Client Component
const { user } = useUser();
const isAdmin = user?.publicMetadata.role === 'admin';
```

---

## 🤖 AI Agent Features

### Real-Time Streaming

```typescript
// Stream agent analysis
const eventSource = new EventSource('/api/agent/analyze');

eventSource.addEventListener('thinking', (e) => {
  // Display agent thinking in real-time
  console.log('Agent:', e.data);
});

eventSource.addEventListener('proposal', (e) => {
  // Show trade proposal
  const proposal = JSON.parse(e.data);
  // User can approve/reject
});
```

### Trade Approval Flow

1. **Agent proposes** trade (via backend)
2. **Order created** with status `PROPOSED`
3. **Frontend shows** proposal with reasoning
4. **User reviews** confidence, risk, reasoning
5. **User approves/rejects** via button
6. **Status updates** to `APPROVED` or `REJECTED`

### Trace Viewer

```typescript
// View complete agent execution
GET /api/traces/{run_id}

// Shows:
// - Tools called (Yahoo Finance, etc.)
// - Inter-agent communication
// - Reasoning and confidence
// - Final decision
```

---

## 📊 Dashboard Features

### Trader Dashboard

**Overview Page**:
- Portfolio summary (cash, equity, P&L)
- Recent orders with status
- Top positions
- Quick actions (add to watchlist, ask agent)

**Orders Page**:
- Order history with filters
- Approve/reject pending orders
- View agent reasoning
- Order details modal

**Positions Page**:
- Current holdings
- Real-time P&L
- Position analytics
- Close position action

**Watchlist Page**:
- Add/remove symbols
- Real-time prices
- Quick analyze with agent
- Create custom watchlists

**Settings Page**:
- Autonomy level (0-3)
- Risk parameters
- Position limits
- Trading hours

### Admin Dashboard

**Analytics Page**:
- Platform-wide metrics
- User activity
- Order volume
- System health

**Orders Page**:
- All orders across all users
- Filter by user, status, date
- View agent traces
- Manual intervention if needed

**Users Page**:
- User list with roles
- Activity tracking
- Role management (superadmin only)

---

## 🎨 Theming

### Dark/Light Mode

```typescript
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();

// Toggle
setTheme(theme === 'dark' ? 'light' : 'dark');
```

### Custom Theme

**Override** in `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#FF8800', // MooMoo Orange
      // ... other colors
    }
  }
}
```

---

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript check

# Database
npm run db:types         # Generate Supabase types
```

### Environment Modes

- **Development**: `npm run dev` (hot reload)
- **Production**: `npm run build && npm start`
- **Preview**: `npm run build && npm run preview`

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Import in Vercel
https://vercel.com/new

# 3. Add environment variables
# Copy from .env.local

# 4. Deploy
# Automatic on every push to main
```

### Docker

```bash
# Build image
docker build -t atlas-frontend .

# Run container
docker run -p 3000:3000 atlas-frontend
```

### Environment Variables

**Required** for production:
- All Clerk keys
- All Supabase keys
- `NEXT_PUBLIC_API_URL` (backend URL)

---

## 📚 Documentation

Complete documentation in `knowledge/` folder:

- **[000_INDEX.md](./knowledge/000_INDEX.md)** - Documentation index
- **[001_SETUP.md](./knowledge/001_SETUP.md)** - Setup guide
- **[003_DESIGN_SYSTEM.md](./knowledge/003_DESIGN_SYSTEM.md)** - MooMoo Orange theme ⭐
- **[006_PROJECT_SUMMARY.md](./knowledge/006_PROJECT_SUMMARY.md)** - Project overview
- **[012_PHASE2_COMPLETE.md](./knowledge/012_PHASE2_COMPLETE.md)** - Latest updates

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Follow design system guidelines
3. Add tests if applicable
4. Update documentation
5. Submit Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow configured rules
- **Prettier**: Auto-format on save
- **Naming**: 
  - Components: PascalCase
  - Files: kebab-case
  - Functions: camelCase

---

## 🐛 Troubleshooting

### Common Issues

**Clerk not working**:
```bash
# Check environment variables
echo $NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# Should start with pk_

# Check middleware
# Ensure middleware.ts has correct matcher
```

**Supabase connection fails**:
```bash
# Verify keys in .env.local
# Check network (Supabase IP whitelist)
# Test in Supabase dashboard first
```

**Types mismatch**:
```bash
# Regenerate Supabase types
npm run db:types

# Or copy from database repo
cp ../atlas-database/schemas/typescript/supabase.types.ts \
   src/types/database/
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🔗 Related Repositories

- **[atlas-backend](../atlas-backend)** - FastAPI backend with AI agents
- **[atlas-database](../atlas-database)** - Centralized database schemas

---

## 🎯 Roadmap

### Phase 3 (Planned)
- [ ] Real-time position updates via WebSocket
- [ ] Advanced charting with TradingView
- [ ] Mobile app (React Native)
- [ ] Portfolio analytics dashboard
- [ ] Social trading features

---

## 💬 Support

- **Documentation**: See `knowledge/` folder
- **Issues**: Open a GitHub issue
- **Discussions**: GitHub Discussions

---

**Beautiful UI meets intelligent trading 🎨🤖**
