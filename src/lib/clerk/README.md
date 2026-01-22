# Clerk Authentication Service

This folder contains all Clerk-related authentication utilities for the Atlas platform.

## 📁 File Structure

```
clerk/
├── client.ts      # Client-side auth hooks (useAuth, useUser)
├── server.ts      # Server-side auth functions (auth, currentUser)
├── types.ts       # Clerk user type definitions
├── utils.ts       # User formatting and display helpers
└── README.md      # This file
```

## 📄 File Descriptions

### `client.ts`
**Purpose**: Re-exports Clerk's client-side hooks for use in React components

**Exports**:
- `useAuth()` - Hook for authentication state and methods
- `useUser()` - Hook for current user data

**Usage**:
```typescript
'use client';
import { useAuth, useUser } from '@/lib/clerk/client';

export function MyComponent() {
  const { userId, isSignedIn } = useAuth();
  const { user } = useUser();
  
  if (!isSignedIn) return <div>Please sign in</div>;
  return <div>Welcome, {user?.firstName}</div>;
}
```

**When to Use**: Client components that need authentication state

---

### `server.ts`
**Purpose**: Server-side authentication utilities for API routes and server components

**Exports**:
- `auth()` - Get current auth state (userId, sessionId, etc.)
- `currentUser()` - Get full user object with profile data
- `getCurrentUserId()` - Helper to get just the user ID
- `requireAuth()` - Throws error if not authenticated

**Usage**:
```typescript
// In API routes or server components
import { auth, currentUser, requireAuth } from '@/lib/clerk/server';

export async function GET() {
  // Method 1: Basic auth check
  const { userId } = auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Method 2: Get full user
  const user = await currentUser();
  console.log(user.emailAddresses[0]);

  // Method 3: Require auth (throws if not signed in)
  const userId = await requireAuth();
  // ... proceed with authenticated logic
}
```

**When to Use**: Server components, API routes, server actions

---

### `types.ts`
**Purpose**: TypeScript type definitions for Clerk users

**Exports**:
- `ClerkUser` - Full Clerk user type (re-exported from @clerk/nextjs)
- `AtlasClerkUser` - Simplified user type with essential fields

**AtlasClerkUser Interface**:
```typescript
{
  id: string;              // Clerk user ID
  email: string;           // Primary email address
  fullName: string | null; // "First Last" or null
  firstName: string | null;
  lastName: string | null;
  imageUrl: string;        // Profile image URL
}
```

**When to Use**: Type annotations for user data

---

### `utils.ts`
**Purpose**: Helper functions for formatting and displaying user data

**Exports**:
- `formatClerkUser(clerkUser)` - Converts ClerkUser to AtlasClerkUser
- `getUserDisplayName(user)` - Returns "firstName" or "email" as fallback

**Usage**:
```typescript
import { formatClerkUser, getUserDisplayName } from '@/lib/clerk/utils';
import { currentUser } from '@/lib/clerk/server';

const clerkUser = await currentUser();
if (clerkUser) {
  const user = formatClerkUser(clerkUser);
  const displayName = getUserDisplayName(user); // "John" or "john@example.com"
}
```

**When to Use**: Displaying user names in UI, formatting user data

---

## 🔐 Authentication Flow

### 1. **Sign In**
- User clicks "Sign In" → Redirects to `/sign-in`
- Clerk handles OAuth (Google) or email/password
- On success, Clerk creates a session
- User is redirected to `/dashboard`

### 2. **Session Management**
- Clerk automatically manages sessions via cookies
- JWT tokens are issued and refreshed automatically
- `auth()` and `useAuth()` check for valid session

### 3. **Integration with Supabase**
- Clerk JWT is passed to Supabase via JWT template
- Supabase RLS policies use `clerk_user_id()` function to extract user ID
- This enables row-level security based on Clerk authentication

---

## 🛠️ Common Patterns

### Protected Client Component
```typescript
'use client';
import { useAuth } from '@/lib/clerk/client';
import { redirect } from 'next/navigation';

export function ProtectedComponent() {
  const { isSignedIn, isLoaded } = useAuth();
  
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) redirect('/sign-in');
  
  return <div>Protected content</div>;
}
```

### Protected Server Component
```typescript
import { getUserProfile } from '@/lib/supabase/permissions';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const profile = await getUserProfile(); // Uses Clerk under the hood
  if (!profile) redirect('/sign-in');
  
  return <div>Welcome, {profile.full_name}</div>;
}
```

### Protected API Route
```typescript
import { requireAuth } from '@/lib/clerk/server';

export async function POST(request: Request) {
  const userId = await requireAuth(); // Throws if not authenticated
  
  // ... process request
  return Response.json({ success: true });
}
```

---

## 🔧 Configuration

### Clerk Dashboard Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Enable **Google OAuth** provider
3. Configure redirect URLs:
   - Sign-in: `/sign-in`
   - Sign-up: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-out: `/`

### JWT Template for Supabase
1. In Clerk Dashboard → **JWT Templates**
2. Create a new template named `supabase`
3. Use the default Supabase template (includes `sub` claim)
4. This JWT is automatically passed to Supabase in requests

---

## ⚠️ Important Notes

### DO:
- ✅ Use `useAuth` and `useUser` only in client components
- ✅ Use `auth()` and `currentUser()` only in server components/API routes
- ✅ Always check `isLoaded` before accessing `isSignedIn` in client components
- ✅ Use `requireAuth()` in API routes for automatic error handling

### DON'T:
- ❌ Call `currentUser()` in client components (will fail)
- ❌ Use `useAuth()` in server components (not available)
- ❌ Expose `CLERK_SECRET_KEY` to the frontend
- ❌ Skip authentication checks in protected routes

---

## 🐛 Troubleshooting

### Issue: "Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()"
**Solution**: Ensure `proxy.ts` exists in the root directory (not `middleware.ts`)

### Issue: "Cannot read properties of null (reading 'userId')"
**Solution**: User is not authenticated. Add proper auth checks before accessing user data.

### Issue: "Invalid JWT token"
**Solution**: Ensure the Supabase JWT template is correctly configured in Clerk Dashboard.

---

## 📚 Related Documentation
- [Clerk Next.js Docs](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk + Supabase Integration](https://clerk.com/docs/integrations/databases/supabase)
- Atlas Setup Guide: `/Knowledge/001_SETUP.md`

---

**Last Updated**: 2026-01-22
