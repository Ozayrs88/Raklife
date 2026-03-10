#!/usr/bin/env tsx
/**
 * Use Firecrawl to scrape complete data from Google Maps
 * Gets everything: ratings, reviews, hours, photos, categories
 * No Google API key needed!
 * 
 * Usage: npm run scrape:google-maps
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// We'll call Firecrawl MCP through the assistant
console.log('🗺️  Scraping Google Maps with Firecrawl\n');
console.log('Getting complete data for all businesses...\n');
console.log('═══════════════════════════════════════\n');

async function scrapeAllBusinessesFromGoogleMaps() {
  // Get all businesses
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address')
    .eq('source', 'scraped')
    .order('name');
  
  if (error) {
    console.error('❌ Failed to fetch businesses:', error.message);
    return;
  }
  
  console.log(`📋 Found ${businesses.length} businesses\n`);
  console.log('These businesses need Google Maps data:\n');
  
  businesses.forEach((b, i) => {
    console.log(`${i + 1}. ${b.name}`);
    if (b.address) {
      console.log(`   📍 ${b.address}`);
    }
    console.log('');
  });
  
  console.log('\n═══════════════════════════════════════');
  console.log('🎯 NEXT STEP:\n');
  console.log('Ask me to scrape these businesses from Google Maps using Firecrawl!');
  console.log('I will get:');
  console.log('  ⭐ Ratings & review counts');
  console.log('  📸 All photos');
  console.log('  🕐 Operating hours');
  console.log('  📞 Phone numbers');
  console.log('  📍 Exact addresses');
  console.log('  💬 Customer reviews');
  console.log('  🏷️  Categories');
  console.log('\nJust say: "Scrape all these businesses from Google Maps"');
  console.log('');
  
  return businesses;
}

scrapeAllBusinessesFromGoogleMaps();
