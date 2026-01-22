/**
 * Clerk TypeScript Type Definitions
 */

import type { User } from '@clerk/nextjs/server';

// Re-export Clerk's User type
export type { User as ClerkUser } from '@clerk/nextjs/server';

/**
 * Simplified user info extracted from Clerk
 */
export interface UserInfo {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  fullName: string | null;
  imageUrl: string;
}

/**
 * Extract simplified user info from Clerk User object
 */
export function extractUserInfo(user: User | null): UserInfo | null {
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress || '';
  const firstName = user.firstName || null;
  const lastName = user.lastName || null;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || null;

  return {
    userId: user.id,
    email,
    firstName,
    lastName,
    fullName,
    imageUrl: user.imageUrl,
  };
}

