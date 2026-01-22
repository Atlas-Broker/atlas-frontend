/**
 * Clerk Server-Side Utilities
 * 
 * Use these in Server Components, API routes, and server actions
 */

import { auth, currentUser } from '@clerk/nextjs/server';

export { auth, currentUser };

/**
 * Get the current Clerk user ID
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require authentication - throws error if not authenticated
 * Use this at the top of protected Server Components or API routes
 */
export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  
  if (!userId) {
    throw new Error('Unauthorized - please sign in');
  }

  return { userId };
}

/**
 * Get full Clerk user data
 * Returns null if not authenticated
 */
export async function getClerkUser() {
  return await currentUser();
}

