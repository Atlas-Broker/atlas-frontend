/**
 * Clerk Helper Utilities
 */

import type { User } from '@clerk/nextjs/server';

/**
 * Get display name for a Clerk user
 * Priority: Full Name > First Name > Email > "User"
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'User';

  const firstName = user.firstName;
  const lastName = user.lastName;
  const fullName = `${firstName || ''} ${lastName || ''}`.trim();
  
  if (fullName) return fullName;
  if (firstName) return firstName;

  const email = user.emailAddresses[0]?.emailAddress;
  if (email) return email.split('@')[0];

  return 'User';
}

/**
 * Get initials from Clerk user
 */
export function getUserInitials(user: User | null): string {
  if (!user) return '?';

  const firstName = user.firstName;
  const lastName = user.lastName;

  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  }

  if (firstName) {
    return firstName.substring(0, 2).toUpperCase();
  }

  const email = user.emailAddresses[0]?.emailAddress;
  if (email) {
    return email.substring(0, 2).toUpperCase();
  }

  return '?';
}

/**
 * Get primary email from Clerk user
 */
export function getUserEmail(user: User | null): string | null {
  return user?.emailAddresses[0]?.emailAddress || null;
}

/**
 * Check if Clerk user has verified email
 */
export function hasVerifiedEmail(user: User | null): boolean {
  const primaryEmail = user?.emailAddresses[0];
  return primaryEmail?.verification?.status === 'verified';
}

