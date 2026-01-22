/**
 * Clerk Client-Side Utilities
 * 
 * Use these in Client Components for browser-side authentication
 */

// Re-export commonly used Clerk hooks and components for client use
export {
  useUser,
  useAuth,
  useSignIn,
  useSignUp,
  useOrganization,
  SignInButton,
  SignUpButton,
  SignOutButton,
  UserButton,
  OrganizationSwitcher,
} from '@clerk/nextjs';

export { ClerkProvider } from '@clerk/nextjs';

