/**
 * MongoDB Setup Script
 * 
 * Run this once to initialize MongoDB collections and indexes
 * Usage: npx tsx scripts/setup-mongodb.ts
 */

import { initializeMongoCollections } from './client';

async function setup() {
  console.log('🚀 Initializing MongoDB collections...\n');

  try {
    await initializeMongoCollections();
    
    console.log('\n✅ MongoDB setup complete!');
    console.log('\nCollections created:');
    console.log('  - agent_runs (with indexes on run_id, user_id, timestamp)');
    console.log('  - market_data_cache (with TTL index for 15-minute expiration)');
    console.log('\n🎉 You\'re ready to run the agent!');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ MongoDB setup failed:', error);
    console.error('\nPlease check:');
    console.error('  1. MONGODB_URI is set in .env.local');
    console.error('  2. MONGODB_DB_NAME is set in .env.local');
    console.error('  3. Your MongoDB cluster is accessible');
    console.error('  4. Your IP address is whitelisted in MongoDB Atlas');
    
    process.exit(1);
  }
}

setup();

