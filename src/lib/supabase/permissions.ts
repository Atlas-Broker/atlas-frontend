/**
 * User Profile Management and Permission Checks
 * 
 * Handles profile creation/updates and role-based access control
 */

import { currentUser } from '@clerk/nextjs/server';
import { supabaseAdmin } from './admin';
import { getProfileByClerkId } from './queries';
import type { Profile, UserRole } from './models';

/**
 * Get the current user's profile from Supabase
 * Auto-creates profile if it doesn't exist, updates if data is missing
 */
export async function getUserProfile(): Promise<Profile | null> {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const userId = clerkUser.id;
  const email = clerkUser.emailAddresses[0]?.emailAddress || '';
  const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null;

  // Try to get existing profile (using admin client to bypass RLS)
  let profile = await getProfileByClerkId(userId);

  if (profile) {
    // Profile exists - check if we need to update it
    const needsUpdate = !profile.email || profile.email === 'EMPTY' || !profile.full_name || profile.full_name === 'EMPTY';

    if (needsUpdate) {
      console.log('🔄 Updating profile with missing data:', userId);
      const { data: updatedProfile } = await supabaseAdmin
        .from('profiles')
        .update({
          email: email || profile.email,
          full_name: fullName || profile.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', userId)
        .select()
        .single();

      profile = updatedProfile || profile;
      console.log('✅ Profile updated:', userId);
    }

    return profile;
  }

  // Profile doesn't exist - create it
  try {
    console.log('🆕 Creating new profile for:', userId, email);

    // Create profile
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        clerk_id: userId,
        email: email,
        full_name: fullName,
        role: 'trader',
        is_active: true,
      })
      .select()
      .single();

    if (profileError) {
      // If duplicate key error, fetch and update existing profile
      if (profileError.code === '23505') {
        console.log('⚠️ Profile already exists (race condition), updating it...');
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .update({
            email: email,
            full_name: fullName,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_id', userId)
          .select()
          .single();

        if (existingProfile) {
          // Make sure settings and watchlist exist
          await ensureUserSettings(existingProfile.id);
          return existingProfile;
        }
      }
      throw profileError;
    }

    // Create default trader settings
    await supabaseAdmin.from('trader_settings').insert({
      user_id: newProfile.id,
      autonomy_level: 1,
      max_concurrent_positions: 5,
      max_daily_orders: 20,
      max_position_size_usd: 10000.0,
      allow_shorting: false,
      allow_margin: false,
      trading_hours: 'regular',
    });

    // Create default watchlist
    await supabaseAdmin.from('watchlists').insert({
      user_id: newProfile.id,
      name: 'My Watchlist',
      symbols: [],
      is_active: true,
    });

    console.log('✅ Profile created successfully:', userId, email);
    return newProfile;
  } catch (error) {
    console.error('❌ Error with profile:', error);

    // Last resort: try to fetch and update existing profile
    try {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .update({
          email: email,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', userId)
        .select()
        .single();

      if (existingProfile) {
        console.log('✅ Recovered and updated existing profile:', userId);
        await ensureUserSettings(existingProfile.id);
        return existingProfile;
      }
    } catch (fetchError) {
      console.error('❌ Could not recover profile:', fetchError);
    }

    return null;
  }
}

/**
 * Ensure user has settings and watchlist (helper for recovery)
 */
async function ensureUserSettings(userId: string): Promise<void> {
  try {
    // Check if settings exist
    const { data: settings } = await supabaseAdmin.from('trader_settings').select('id').eq('user_id', userId).maybeSingle();

    if (!settings) {
      await supabaseAdmin.from('trader_settings').insert({
        user_id: userId,
        autonomy_level: 1,
        max_concurrent_positions: 5,
        max_daily_orders: 20,
        max_position_size_usd: 10000.0,
        allow_shorting: false,
        allow_margin: false,
        trading_hours: 'regular',
      });
      console.log('✅ Created missing trader settings');
    }

    // Check if watchlist exists
    const { data: watchlist } = await supabaseAdmin.from('watchlists').select('id').eq('user_id', userId).maybeSingle();

    if (!watchlist) {
      await supabaseAdmin.from('watchlists').insert({
        user_id: userId,
        name: 'My Watchlist',
        symbols: [],
        is_active: true,
      });
      console.log('✅ Created missing watchlist');
    }
  } catch (error) {
    console.error('⚠️ Error ensuring user settings:', error);
  }
}

// ============================================
// PERMISSION CHECKS
// ============================================

/**
 * Check if the current user is an admin or superadmin
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getUserProfile();

  if (!profile) {
    return false;
  }

  return profile.role === 'admin' || profile.role === 'superadmin';
}

/**
 * Check if the current user is a superadmin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const profile = await getUserProfile();

  if (!profile) {
    return false;
  }

  return profile.role === 'superadmin';
}

/**
 * Check if the current user is a trader (regular user)
 */
export async function isTrader(): Promise<boolean> {
  const profile = await getUserProfile();

  if (!profile) {
    return false;
  }

  return profile.role === 'trader';
}

/**
 * Get the current user's role
 * Returns null if user is not authenticated
 */
export async function getUserRole(): Promise<UserRole | null> {
  const profile = await getUserProfile();
  return profile?.role || null;
}

/**
 * Require authentication - throws error if not authenticated
 * Use this at the top of protected pages
 */
export async function requireAuth(): Promise<Profile> {
  const profile = await getUserProfile();

  if (!profile) {
    throw new Error('Unauthorized - please sign in');
  }

  return profile;
}

/**
 * Require admin role - throws error if user is not admin or superadmin
 */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireAuth();

  if (profile.role !== 'admin' && profile.role !== 'superadmin') {
    throw new Error('Forbidden - admin access required');
  }

  return profile;
}

/**
 * Require superadmin role - throws error if user is not superadmin
 */
export async function requireSuperAdmin(): Promise<Profile> {
  const profile = await requireAuth();

  if (profile.role !== 'superadmin') {
    throw new Error('Forbidden - superadmin access required');
  }

  return profile;
}

/**
 * Check if user has permission to access a specific resource
 * @param resourceUserId - The user ID that owns the resource
 * @param allowAdminAccess - Whether admins can access this resource (default: true)
 */
export async function canAccessResource(resourceUserId: string, allowAdminAccess: boolean = true): Promise<boolean> {
  const profile = await getUserProfile();

  if (!profile) {
    return false;
  }

  // User can access their own resources
  if (profile.id === resourceUserId) {
    return true;
  }

  // Admins can access all resources if allowed
  if (allowAdminAccess && (profile.role === 'admin' || profile.role === 'superadmin')) {
    return true;
  }

  return false;
}

