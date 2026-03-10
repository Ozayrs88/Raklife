#!/usr/bin/env tsx
/**
 * Fetch Google Maps data for all businesses using Google Places API
 * 
 * This script:
 * 1. Finds each business on Google Maps
 * 2. Gets rating, reviews, hours, coordinates
 * 3. Updates Supabase automatically
 * 
 * Usage: npm run enrich:google
 */

import { Client } from "@googlemaps/google-maps-services-js";
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const googleMaps = new Client({});
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface GooglePlaceData {
  google_rating?: number;
  google_review_count?: number;
  latitude?: number;
  longitude?: number;
  operating_hours?: any;
}

async function findPlaceOnGoogleMaps(businessName: string, address: string) {
  console.log(`\n🔍 Searching Google Maps for: ${businessName}`);
  
  try {
    // Step 1: Find the place
    const searchQuery = address 
      ? `${businessName} ${address}` 
      : `${businessName} Ras Al Khaimah UAE`;
    
    const findResponse = await googleMaps.findPlaceFromText({
      params: {
        input: searchQuery,
        inputtype: "textquery",
        fields: ["place_id", "name", "formatted_address"],
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    });
    
    if (!findResponse.data.candidates || findResponse.data.candidates.length === 0) {
      console.log(`   ⚠️  Not found on Google Maps`);
      return null;
    }
    
    const place = findResponse.data.candidates[0];
    console.log(`   ✓ Found: ${place.name}`);
    console.log(`   📍 ${place.formatted_address}`);
    
    // Step 2: Get detailed information
    const detailsResponse = await googleMaps.placeDetails({
      params: {
        place_id: place.place_id!,
        fields: [
          "rating",
          "user_ratings_total",
          "geometry",
          "opening_hours",
          "formatted_phone_number",
          "website"
        ],
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    });
    
    const details = detailsResponse.data.result;
    
    const data: GooglePlaceData = {};
    
    if (details.rating) {
      data.google_rating = details.rating;
      console.log(`   ⭐ Rating: ${details.rating}/5`);
    }
    
    if (details.user_ratings_total) {
      data.google_review_count = details.user_ratings_total;
      console.log(`   📊 Reviews: ${details.user_ratings_total}`);
    }
    
    if (details.geometry?.location) {
      data.latitude = details.geometry.location.lat;
      data.longitude = details.geometry.location.lng;
      console.log(`   📍 Coordinates: ${data.latitude}, ${data.longitude}`);
    }
    
    if (details.opening_hours?.periods) {
      // Convert Google's format to our format
      data.operating_hours = convertOpeningHours(details.opening_hours.periods);
      console.log(`   🕐 Hours: Added`);
    }
    
    return data;
    
  } catch (error: any) {
    if (error.response?.data?.error_message) {
      console.error(`   ❌ Google API Error: ${error.response.data.error_message}`);
    } else {
      console.error(`   ❌ Error: ${error.message}`);
    }
    return null;
  }
}

function convertOpeningHours(periods: any[]): any {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const hours: any = {};
  
  for (let i = 0; i < 7; i++) {
    const dayPeriods = periods.filter(p => p.open?.day === i);
    
    if (dayPeriods.length === 0) {
      hours[days[i]] = { open: 'closed', close: 'closed' };
    } else {
      const period = dayPeriods[0];
      hours[days[i]] = {
        open: period.open?.time ? formatTime(period.open.time) : 'closed',
        close: period.close?.time ? formatTime(period.close.time) : 'closed'
      };
    }
  }
  
  return hours;
}

function formatTime(time: string): string {
  // Convert from 0900 to 09:00
  if (time.length === 4) {
    return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
  }
  return time;
}

async function enrichAllBusinesses() {
  console.log('🗺️  Google Maps Data Enrichment Tool\n');
  console.log('═══════════════════════════════════════\n');
  
  // Get all businesses that need Google data
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, google_rating')
    .eq('source', 'scraped')
    .order('name');
  
  if (error) {
    console.error('❌ Failed to fetch businesses:', error.message);
    return;
  }
  
  console.log(`📋 Found ${businesses.length} businesses\n`);
  
  let updated = 0;
  let failed = 0;
  let skipped = 0;
  
  for (const business of businesses) {
    console.log(`\n[${updated + failed + skipped + 1}/${businesses.length}] ${business.name}`);
    
    // Skip if already has Google rating (unless you want to refresh)
    if (business.google_rating && business.google_rating > 0) {
      console.log(`   ⏭️  Already has Google data (${business.google_rating}⭐)`);
      skipped++;
      continue;
    }
    
    const googleData = await findPlaceOnGoogleMaps(business.name, business.address);
    
    if (googleData && Object.keys(googleData).length > 0) {
      const { error: updateError } = await supabase
        .from('businesses')
        .update(googleData)
        .eq('id', business.id);
      
      if (updateError) {
        console.error(`   ❌ Failed to update: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   ✅ Updated in database`);
        updated++;
      }
    } else {
      failed++;
    }
    
    // Rate limiting: Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Enrichment Complete!\n');
  console.log(`📊 Results:`);
  console.log(`   Updated: ${updated}`);
  console.log(`   Skipped (already has data): ${skipped}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total: ${businesses.length}\n`);
}

// Check for API key
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error('❌ ERROR: GOOGLE_MAPS_API_KEY not found in .env.local\n');
  console.log('Please add your Google Maps API key to .env.local:');
  console.log('GOOGLE_MAPS_API_KEY=your-api-key-here\n');
  console.log('Get your API key at: https://console.cloud.google.com/\n');
  process.exit(1);
}

enrichAllBusinesses()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
