# Atlas - AI-Powered Trading Platform

[![Phase 1](https://img.shields.io/badge/Phase-1-blue)](https://github.com) [![Paper Trading](https://img.shields.io/badge/Trading-Paper%20Only-green)](https://github.com) [![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

Atlas is an AI-powered swing trading platform for US equities. This is the **Phase 1** implementation focusing on paper trading with a hard deadline of April 12, 2025.

## 🎯 Project Status

**Phase 1 - Paper Trading Prototype** ✅ In Development

- ✅ Authentication system (Clerk with Google OAuth)
- ✅ User profile management with role-based access
- ✅ Trader dashboard with watchlists, orders, positions
- ✅ Admin panel for user and order management
- ✅ SuperAdmin controls for system-wide management
- ✅ Database schema with Row Level Security
- 🔄 AI agent integration (coming next)
- 🔄 MooMoo broker connection (Phase 2)

## 🏗️ Tech Stack

- **Frontend**: Next.js 14+ (App Router, TypeScript, Tailwind CSS)
- **Authentication**: Clerk (Google OAuth only)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (recommended)

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [Database Setup](#-database-setup)
- [Development](#-development)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Features](#-features)
- [Troubleshooting](#-troubleshooting)
- [Deployment](#-deployment)

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd atlas

# Install dependencies
npm install

# Copy environment template
cp env.template .env.local
# Edit .env.local with your actual keys

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📦 Prerequisites

- **Node.js** 18+ and npm
- **Clerk Account** (free tier works)
- **Supabase Account** (free tier works)
- **Git** for version control

## 💻 Installation

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd atlas
npm install
```

### 2. Set Up Clerk Authentication

1. Go to [https://dashboard.clerk.com/](https://dashboard.clerk.com/)
2. Create a new application
3. **Enable Google OAuth**:
   - Navigate to **User & Authentication** > **Social Connections**
   - Enable **Google**
   - Configure OAuth consent screen in Google Cloud Console
4. Get your API keys from **API Keys** section
5. Set up webhook (see [Configuration](#️-configuration))

### 3. Set Up Supabase Database

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Wait for database to be ready (~2 minutes)
4. Go to **Settings** > **API** and copy:
   - Project URL
   - `anon/public` key
   - `service_role` key ⚠️ Keep this secret!
5. Run the migration (see [Database Setup](#-database-setup))

## ⚙️ Configuration

### Environment Variables

Copy `env.template` to `.env.local` and fill in your keys:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk Routes (use as is for local dev)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

### Clerk Webhook Setup

The webhook syncs users from Clerk to Supabase automatically.

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. **Endpoint URL**: `https://yourdomain.com/api/webhooks/clerk`
   - For local dev: Use ngrok or similar: `https://abc123.ngrok.io/api/webhooks/clerk`
4. **Subscribe to events**:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy the **Signing Secret** to `CLERK_WEBHOOK_SECRET` in `.env.local`

## 🗄️ Database Setup

### Run the Migration

1. Open your Supabase Dashboard
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
5. Paste and click **Run** (or Cmd/Ctrl + Enter)
6. Verify success message

This creates:
- ✅ All tables (profiles, orders, positions, etc.)
- ✅ Row Level Security policies
- ✅ Indexes for performance
- ✅ Enums and types
- ✅ Triggers for auto-updates

See `supabase/README.md` for detailed database documentation.

## 🛠️ Development

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
atlas/
├── app/                          # Next.js App Router pages
│   ├── api/
│   │   └── webhooks/
│   │       └── clerk/           # Clerk webhook handler
│   ├── dashboard/               # Trader pages (protected)
│   │   ├── watchlist/
│   │   ├── orders/
│   │   ├── positions/
│   │   └── settings/
│   ├── admin/                   # Admin pages (admin+ only)
│   │   ├── users/
│   │   ├── orders/
│   │   └── analytics/
│   ├── superadmin/              # SuperAdmin pages (superadmin only)
│   ├── layout.tsx               # Root layout with ClerkProvider
│   └── page.tsx                 # Public landing page
├── src/
│   ├── components/
│   │   ├── ui/                  # Reusable UI primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── toast.tsx
│   │   └── shared/              # Domain-specific components
│   │       ├── Navbar.tsx
│   │       ├── Sidebar.tsx
│   │       ├── StatsCard.tsx
│   │       ├── OrderCard.tsx
│   │       ├── PositionCard.tsx
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── EnvironmentBadge.tsx
│   │       └── RoleBadge.tsx
│   └── lib/                     # Core utilities
│       ├── supabase.ts          # Database client & helpers
│       ├── permissions.ts       # Role checking utilities
│       └── utils.ts             # Formatting & styling helpers
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql
│   └── README.md                # Database documentation
├── env.template                 # Environment variables template
└── README.md                    # This file
```

## 👥 User Roles

Atlas has three role levels with increasing permissions:

### 🔵 Trader (Default)
- Default role assigned to all new users
- Access to personal dashboard
- Manage watchlists, view orders, adjust settings
- Cannot access admin functions

### 🟣 Admin
- All trader permissions
- View all users and their data
- Platform-wide analytics
- Monitor system health

### 🔴 SuperAdmin
- All admin permissions
- Promote/demote users
- Can switch between Trader/Admin/SuperAdmin views
- System-wide configuration (Phase 2+)

### How to Promote Users

Run these SQL commands in Supabase SQL Editor:

```sql
-- Promote to Admin
UPDATE profiles SET role = 'admin' WHERE clerk_id = 'user_xxxxx';

-- Promote to SuperAdmin
UPDATE profiles SET role = 'superadmin' WHERE clerk_id = 'user_xxxxx';

-- Demote to Trader
UPDATE profiles SET role = 'trader' WHERE clerk_id = 'user_xxxxx';
```

Get the `clerk_id` from:
- Admin Users page (visible in table)
- Clerk Dashboard > Users > click user > copy User ID

## ✨ Features

### Phase 1 (Current)

#### For Traders
- 📊 **Dashboard**: Portfolio overview, P&L tracking, quick stats
- 👀 **Watchlists**: Create and manage stock watchlists
- 📋 **Orders**: View order history with filters and status tracking
- 💼 **Positions**: Track current holdings and unrealized P&L
- ⚙️ **Settings**: Configure autonomy levels and risk parameters
  - Observer (Level 0): Watch only
  - Copilot (Level 1): Approve each trade
  - Guarded Auto (Level 2): Auto-trade with limits
  - Full Auto (Level 3): Fully autonomous

#### For Admins
- 👥 **User Management**: View all users, roles, and activity
- 📊 **Analytics**: Platform-wide metrics and insights
- 📈 **Order Monitoring**: See all orders across users
- 🎯 **Top Symbols**: Track most traded stocks

#### For SuperAdmins
- 🔄 **View Toggle**: Switch between Trader/Admin/SuperAdmin views
- 👑 **Admin Management**: Promote/demote users
- 🛠️ **System Config**: Global settings (Phase 2+)

### Coming in Phase 2-6
- 🤖 AI agent integration with real reasoning
- 📱 MooMoo broker connection (live trading)
- 📧 Email/SMS notifications
- 📊 Advanced charts and technical indicators
- 🔔 Real-time market data
- 📱 Mobile responsive improvements

## 🐛 Troubleshooting

### "Permission Denied" Errors

**Problem**: Can't access data in Supabase

**Solutions**:
1. Check that the migration ran successfully
2. Verify RLS policies are enabled
3. Make sure you're using the correct Supabase client:
   - Browser/Client Components: Use `supabase` (anon key)
   - Server Components/API Routes: Use `supabaseAdmin` for admin operations

### Clerk Webhook Not Working

**Problem**: Users not created in Supabase after sign-up

**Solutions**:
1. Check webhook URL is correct (must be publicly accessible)
2. Verify `CLERK_WEBHOOK_SECRET` in `.env.local`
3. Check Clerk Dashboard > Webhooks > your endpoint for error logs
4. For local dev, use ngrok or similar to expose localhost

### "Cannot find module '@/...'"

**Problem**: TypeScript can't resolve imports

**Solutions**:
1. Restart your Next.js dev server
2. Check `tsconfig.json` has correct paths configuration
3. Clear `.next` folder: `rm -rf .next && npm run dev`

### Middleware Redirect Loops

**Problem**: Infinite redirects when accessing protected routes

**Solutions**:
1. Clear cookies and try again
2. Verify middleware.ts has correct public routes
3. Check Clerk environment variables are set
4. Sign out completely and sign back in

### Database Connection Issues

**Problem**: "Invalid API key" or connection errors

**Solutions**:
1. Verify all three Supabase keys are correct in `.env.local`
2. Check project URL doesn't have trailing slash
3. Restart dev server after changing `.env.local`
4. Verify Supabase project is not paused (free tier auto-pauses after 7 days)

## 🚢 Deployment

### Recommended: Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add all environment variables from `.env.local`
5. Deploy!

### Update Clerk Webhook

After deployment, update the webhook URL:
1. Go to Clerk Dashboard > Webhooks
2. Update endpoint URL to: `https://yourdomain.vercel.app/api/webhooks/clerk`
3. Verify events are still subscribed

### Environment Variables Checklist

Make sure these are set in Vercel:
- ✅ All Clerk keys (NEXT_PUBLIC_CLERK_*, CLERK_*)
- ✅ All Supabase keys (NEXT_PUBLIC_SUPABASE_*, SUPABASE_*)
- ✅ Clerk redirect URLs updated to your domain

## 📝 Important Notes

### Phase 1 Limitations

- **Paper Trading Only**: No real money, all trades simulated
- **No Broker Connection**: MooMoo integration coming in Phase 2
- **Mock Market Data**: Prices are placeholders
- **No AI Reasoning**: Agent reasoning structures ready but not connected

### Security Notes

- ⚠️ **Never commit `.env.local`** to version control
- ⚠️ **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the client
- ⚠️ All admin operations use service role key (bypasses RLS)
- ⚠️ Production: Enable Supabase's point-in-time recovery

### Performance Notes

- All pages use React Server Components by default
- Client Components marked with `'use client'` directive
- Database queries optimized with proper indexes
- RLS policies ensure users only see their own data

## 🤝 Contributing

This is a thesis project with a hard deadline. External contributions are not accepted at this time.

## 📄 License

Proprietary - All rights reserved for thesis purposes.

## 🙋 Support

For issues or questions:
1. Check this README and `supabase/README.md`
2. Review error logs in Clerk Dashboard and Supabase
3. Verify all environment variables are set correctly

---

**Built with ❤️ for the April 12, 2025 deadline**
