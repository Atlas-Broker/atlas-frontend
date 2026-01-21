import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { supabaseAdmin, createAuditLog } from '@/lib/supabase';

/**
 * Clerk Webhook Handler
 * 
 * This endpoint receives events from Clerk when users are created, updated, or deleted.
 * It syncs user data to our Supabase database.
 * 
 * Setup Instructions:
 * 1. Go to Clerk Dashboard > Webhooks
 * 2. Create new endpoint: https://yourdomain.com/api/webhooks/clerk
 * 3. Subscribe to events: user.created, user.updated, user.deleted
 * 4. Copy the signing secret to CLERK_WEBHOOK_SECRET in .env.local
 */

export async function POST(req: Request) {
  // Get the Svix headers for verification
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent;

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error: Verification failed', {
      status: 400,
    });
  }

  // Handle the webhook event
  const eventType = evt.type;
  console.log(`Webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt);
        break;
      case 'user.updated':
        await handleUserUpdated(evt);
        break;
      case 'user.deleted':
        await handleUserDeleted(evt);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return new Response('Webhook processed successfully', { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
}

/**
 * Handle user.created event
 * Creates profile, default settings, and default watchlist
 */
async function handleUserCreated(evt: WebhookEvent) {
  if (evt.type !== 'user.created') return;

  const { id, email_addresses, first_name, last_name } = evt.data;
  const email = email_addresses[0]?.email_address || '';
  const fullName = [first_name, last_name].filter(Boolean).join(' ') || null;

  console.log(`Creating profile for user: ${email} (${id})`);

  // 1. Create profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      clerk_id: id,
      email: email,
      full_name: fullName,
      role: 'trader', // Default role
      is_active: true,
    })
    .select()
    .single();

  if (profileError) {
    console.error('Error creating profile:', profileError);
    throw new Error('Failed to create profile');
  }

  console.log(`Profile created: ${profile.id}`);

  // 2. Create default trader settings
  const { error: settingsError } = await supabaseAdmin
    .from('trader_settings')
    .insert({
      user_id: profile.id,
      autonomy_level: 1, // Default: Copilot mode
      max_concurrent_positions: 5,
      max_daily_orders: 20,
      max_position_size_usd: 10000.00,
      allow_shorting: false,
      allow_margin: false,
      trading_hours: 'regular',
    });

  if (settingsError) {
    console.error('Error creating trader settings:', settingsError);
    throw new Error('Failed to create trader settings');
  }

  console.log(`Trader settings created for user: ${profile.id}`);

  // 3. Create default watchlist
  const { error: watchlistError } = await supabaseAdmin
    .from('watchlists')
    .insert({
      user_id: profile.id,
      name: 'My Watchlist',
      symbols: [], // Empty by default
      is_active: true,
    });

  if (watchlistError) {
    console.error('Error creating default watchlist:', watchlistError);
    throw new Error('Failed to create default watchlist');
  }

  console.log(`Default watchlist created for user: ${profile.id}`);

  // 4. Create audit log
  await createAuditLog({
    user_id: profile.id,
    actor_id: null,
    action: 'user.created',
    resource_type: 'profile',
    resource_id: profile.id,
    metadata: {
      email: email,
      clerk_id: id,
      source: 'clerk_webhook',
    },
    ip_address: null,
    user_agent: null,
  });

  console.log(`User setup completed for: ${email}`);
}

/**
 * Handle user.updated event
 * Updates email and full name in profile
 */
async function handleUserUpdated(evt: WebhookEvent) {
  if (evt.type !== 'user.updated') return;

  const { id, email_addresses, first_name, last_name } = evt.data;
  const email = email_addresses[0]?.email_address || '';
  const fullName = [first_name, last_name].filter(Boolean).join(' ') || null;

  console.log(`Updating profile for user: ${id}`);

  // Update profile
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .update({
      email: email,
      full_name: fullName,
    })
    .eq('clerk_id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error('Failed to update profile');
  }

  console.log(`Profile updated: ${profile.id}`);

  // Create audit log
  await createAuditLog({
    user_id: profile.id,
    actor_id: profile.id,
    action: 'user.updated',
    resource_type: 'profile',
    resource_id: profile.id,
    metadata: {
      email: email,
      clerk_id: id,
      source: 'clerk_webhook',
    },
    ip_address: null,
    user_agent: null,
  });
}

/**
 * Handle user.deleted event
 * Deletes profile (cascade will handle related records)
 */
async function handleUserDeleted(evt: WebhookEvent) {
  if (evt.type !== 'user.deleted') return;

  const { id } = evt.data;

  console.log(`Deleting profile for user: ${id}`);

  // Get profile first for audit log
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, email')
    .eq('clerk_id', id)
    .single();

  if (!profile) {
    console.log(`Profile not found for Clerk ID: ${id}`);
    return;
  }

  // Create audit log before deletion
  await createAuditLog({
    user_id: profile.id,
    actor_id: null,
    action: 'user.deleted',
    resource_type: 'profile',
    resource_id: profile.id,
    metadata: {
      email: profile.email,
      clerk_id: id,
      source: 'clerk_webhook',
    },
    ip_address: null,
    user_agent: null,
  });

  // Delete profile (CASCADE will delete related records)
  const { error } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('clerk_id', id);

  if (error) {
    console.error('Error deleting profile:', error);
    throw new Error('Failed to delete profile');
  }

  console.log(`Profile deleted: ${profile.id}`);
}

