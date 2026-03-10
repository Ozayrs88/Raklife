#!/usr/bin/env tsx
/**
 * Save all Google Maps data scraped with Firecrawl
 * Updates businesses with: ratings, phones, hours, full addresses
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Data scraped from Google Maps via Firecrawl
const firecrawlData: Record<string, any> = {
  'Chase Sports Academy': {
    rating: 4.8,
    phone: '+971 58 661 0334',
    website: 'chase-rak.com',
    address: 'Al Hamra Industrial Area Wearhouse WIZ 1/014 - Ras Al Khaimah - United Arab Emirates',
    hours: { monday: '8:30 AM–11 PM' }
  },
  'Juventus Academy RAK': {
    rating: null,
    phone: null,
    website: null,
    address: 'Marjan Island Resort & Spa - Marjan Island Blvd - Ras al Khaimah - UAE'
  },
  'KiDojo KARATE SCHOOL & SPORTS CLUB': {
    rating: null,
    phone: null,
    website: null,
    address: 'Al Hamra Village, Ras al Kheimah, UAE'
  },
  'Al Jazeerah Equestrian Club': {
    rating: 4.5,
    phone: '+971 50 377 0370',
    website: 'instagram.com/aljazeerahclub.ae',
    address: '5 21C St - Al Jazeera Al Hamra - Ras Al Khaimah',
    hours: { monday: '24 hours' }
  },
  'Al Moharb Martial Arts Club RAK': {
    rating: 4.7,
    phone: '+971 58 670 7898',
    website: 'almoharbclub.wordpress.com',
    address: 'e11 Sheikh Mohamed Bin Salem Rd - Al Riffa - Ras Al Khaimah - United Arab Emirates',
    hours: { monday: '8:01 AM–10 PM' }
  },
  'BASE Martial Arts Academy': {
    rating: 4.4,
    phone: '+971 55 836 4872',
    website: 'baserak.com',
    address: 'Al Nahdah St - Dahan - Ras Al Khaimah - United Arab Emirates',
    hours: { monday: '12 AM–12 PM, 4–9 PM' }
  },
  'Northern Dance Company': {
    rating: null,
    phone: null,
    website: null,
    address: 'RAK and Sharjah, UAE'
  },
  'Olympia RAK Gymnastics': {
    rating: null,
    phone: null,
    website: null,
    address: 'Mina Al Arab, Ras Al Khaimah'
  },
  'Show Squad': {
    rating: null,
    phone: null,
    website: null,
    address: 'Ras Al Khaimah, UAE'
  },
  'SK Academy': {
    rating: null,
    phone: null,
    website: null,
    address: null
  },
  'SMASH Ras Al Khaimah': {
    rating: null,
    phone: null,
    website: null,
    address: 'Al Riffa, Ras Al Khaimah'
  },
  'WonderKidz Studio': {
    rating: null,
    phone: null,
    website: null,
    address: 'Mina Al Arab, Building 17, Ras Al Khaimah'
  },
  'Champions Football Academy RAK': {
    rating: null,
    phone: null,
    website: null,
    address: 'Al Hamra Village, Ras Al Khaimah, UAE'
  }
};

async function updateBusinessesWithFirecrawlData() {
  console.log('🔥 Updating businesses with Firecrawl Google Maps data\n');
  
  for (const businessName in firecrawlData) {
    const data = firecrawlData[businessName];
    
    console.log(`\n🔍 Looking for: "${businessName}"`);
    
    // Find the business by exact name match
    const { data: businesses, error: queryError } = await supabase
      .from('businesses')
      .select('id, name, google_rating, website, source')
      .eq('name', businessName)
      .eq('source', 'scraped')
      .limit(1);
    
    if (queryError) {
      console.log(`  ❌ Query error: ${queryError.message}`);
      continue;
    }
    
    if (!businesses || businesses.length === 0) {
      console.log(`  ⚠️  Not found in database`);
      continue;
    }
    
    const business = businesses[0];
    console.log(`  ✓ Found: ${business.name} (ID: ${business.id.substring(0, 8)}...)`);
    
    // Prepare update data (only non-null values)
    const updates: any = {};
    if (data.rating !== null) updates.google_rating = data.rating;
    if (data.phone !== null) updates.phone = data.phone;
    if (data.website !== null && !business.website) updates.website = data.website;
    if (data.address !== null) updates.address = data.address;
    if (data.hours !== null) updates.operating_hours = data.hours;
    
    // Skip if no updates
    if (Object.keys(updates).length === 0) {
      console.log(`  → No new data to update`);
      continue;
    }
    
    console.log(`  → Updating: ${Object.keys(updates).join(', ')}`);
    
    // Update
    const { error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('id', business.id);
    
    if (error) {
      console.error(`  ❌ Error:`, error.message);
    } else {
      console.log(`  ✅ Updated successfully!`);
      if (data.rating) console.log(`     ⭐ Rating: ${data.rating}`);
      if (data.phone) console.log(`     📞 Phone: ${data.phone}`);
      if (data.website) console.log(`     🌐 Website: ${data.website}`);
    }
  }
  
  console.log('\n\n═══════════════════════════════════════');
  console.log('✅ All businesses updated with Firecrawl data!');
  console.log('🎉 No Google API key needed - Firecrawl did it all!');
  console.log('═══════════════════════════════════════\n');
}

updateBusinessesWithFirecrawlData();
