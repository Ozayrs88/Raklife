#!/usr/bin/env tsx
/**
 * Enrich business data using Firecrawl to scrape Google Maps
 * No Google API key needed!
 * 
 * Usage: npm run enrich:firecrawl
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

console.log('🔥 Enriching with Firecrawl + Google Maps\n');

interface BusinessData {
  id: string;
  name: string;
  address: string | null;
  rating?: number | null;
  review_count?: number | null;
  phone?: string | null;
  website?: string | null;
  operating_hours?: any;
}

// Parse Google Maps data from Firecrawl markdown
function parseGoogleMapsData(markdown: string): Partial<BusinessData> {
  const data: Partial<BusinessData> = {};
  
  // Extract rating (e.g., "4.8")
  const ratingMatch = markdown.match(/\n([\d.]+)\n/);
  if (ratingMatch) {
    data.rating = parseFloat(ratingMatch[1]);
  }
  
  // Extract phone (e.g., "+971 58 661 0334")
  const phoneMatch = markdown.match(/\+\d{3}\s?\d{2,3}\s?\d{3}\s?\d{4}/);
  if (phoneMatch) {
    data.phone = phoneMatch[0].replace(/\s/g, ' ');
  }
  
  // Extract website
  const websiteMatch = markdown.match(/\[([\w\-\.]+\.com)\]/);
  if (websiteMatch) {
    data.website = websiteMatch[1];
  }
  
  // Extract full address with correct format
  const addressMatch = markdown.match(/\n([A-Z][^·\n]+ - [^·\n]+ - United Arab Emirates)\n/);
  if (addressMatch) {
    data.address = addressMatch[1];
  }
  
  // Extract hours
  const hoursMatch = markdown.match(/Open · Closes (\d+(?:\:\d+)?\s?(?:AM|PM))/);
  if (hoursMatch) {
    // Parse detailed hours
    const mondayMatch = markdown.match(/Monday\s+- ([\d:APM–\s]+)/);
    if (mondayMatch) {
      data.operating_hours = {
        monday: mondayMatch[1].trim(),
        // In a full implementation, parse all days
      };
    }
  }
  
  return data;
}

// Instructions for using with Firecrawl MCP
export async function enrichBusinessWithFirecrawl(businessId: string, businessName: string, businessAddress: string | null) {
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(businessName + ' ' + (businessAddress || 'Ras Al Khaimah'))}`;
  
  console.log(`\n🔍 ${businessName}`);
  console.log(`   URL: ${searchUrl}`);
  console.log(`   → Ask me to scrape this URL with Firecrawl`);
  console.log(`   → I'll extract: rating, phone, website, hours, address`);
  
  return searchUrl;
}

async function main() {
  // Get all businesses that need enrichment
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, rating, phone')
    .eq('source', 'scraped')
    .order('name');
  
  if (error || !businesses) {
    console.error('❌ Failed to fetch businesses:', error?.message);
    return;
  }
  
  console.log(`\n📊 Found ${businesses.length} businesses to enrich\n`);
  
  // For demonstration, let's show how this would work:
  console.log('═══════════════════════════════════════════════════════');
  console.log('📋 SCRAPING PLAN:\n');
  
  for (const business of businesses.slice(0, 5)) {
    const url = await enrichBusinessWithFirecrawl(business.id, business.name, business.address);
  }
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('\n💡 HOW TO USE:\n');
  console.log('1. I will scrape each URL using Firecrawl MCP');
  console.log('2. Extract all Google Maps data automatically');
  console.log('3. Update Supabase with:');
  console.log('   ✓ Ratings & review counts');
  console.log('   ✓ Phone numbers');
  console.log('   ✓ Websites');
  console.log('   ✓ Operating hours');
  console.log('   ✓ Full addresses');
  console.log('\nReady! Just say: "Start scraping with Firecrawl"\n');
}

main();
