#!/usr/bin/env tsx
/**
 * Intelligent RAK Children's Activities Scraper
 * 
 * Scrapes sports clubs, martial arts, dance studios, fitness centers for kids
 * Automatically saves to Supabase with complete details
 * 
 * Usage: npm run scrape:kids
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Categories to search for in RAK
const KIDS_ACTIVITY_SEARCHES = [
  // Sports & Fitness
  { query: 'football academy kids Ras Al Khaimah', category: 'sports' },
  { query: 'swimming lessons children RAK UAE', category: 'sports' },
  { query: 'basketball training kids Ras Al Khaimah', category: 'sports' },
  { query: 'tennis academy children RAK', category: 'sports' },
  { query: 'gymnastics kids Ras Al Khaimah', category: 'fitness' },
  
  // Martial Arts
  { query: 'karate classes kids Ras Al Khaimah', category: 'sports' },
  { query: 'taekwondo children RAK UAE', category: 'sports' },
  { query: 'judo kids Ras Al Khaimah', category: 'sports' },
  { query: 'kung fu children RAK', category: 'sports' },
  { query: 'martial arts kids Ras Al Khaimah', category: 'sports' },
  
  // Dance
  { query: 'dance studio kids Ras Al Khaimah', category: 'education' },
  { query: 'ballet classes children RAK', category: 'education' },
  { query: 'hip hop dance kids Ras Al Khaimah', category: 'education' },
  
  // Other Activities
  { query: 'music school kids Ras Al Khaimah', category: 'education' },
  { query: 'art classes children RAK', category: 'education' },
  { query: 'kids activities Ras Al Khaimah', category: 'kids' },
  { query: 'children sports club RAK UAE', category: 'sports' }
];

interface ScrapedBusiness {
  name: string;
  url: string;
  description?: string;
  category: string;
}

/**
 * Main scraping function
 */
async function scrapeKidsActivities() {
  console.log('🚀 Starting RAK Kids Activities Scraper\n');
  console.log('═══════════════════════════════════════\n');
  console.log(`📋 Searching ${KIDS_ACTIVITY_SEARCHES.length} categories...\n`);
  
  const allBusinesses: ScrapedBusiness[] = [];
  let searchCount = 0;
  
  for (const search of KIDS_ACTIVITY_SEARCHES) {
    searchCount++;
    console.log(`\n[${searchCount}/${KIDS_ACTIVITY_SEARCHES.length}] 🔍 Searching: "${search.query}"`);
    
    try {
      // Search using Firecrawl (will be called via MCP in production)
      // For now, this will be a manual process where you use Firecrawl search
      console.log(`   ℹ️  To search, use Firecrawl MCP with query: "${search.query}"`);
      console.log(`   ℹ️  Category: ${search.category}`);
      
      // Placeholder for businesses found
      // In production, you'll call Firecrawl MCP here
      
    } catch (error: any) {
      console.error(`   ❌ Search failed: ${error.message}`);
    }
    
    // Rate limiting
    await sleep(2000);
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Search phase complete!');
  console.log(`   Found ${allBusinesses.length} potential businesses`);
  console.log('\n📝 Next: Use the results to scrape each business');
}

/**
 * Scrape a single business website
 */
async function scrapeSingleBusiness(url: string, category: string) {
  console.log(`\n🌐 Scraping: ${url}`);
  
  try {
    // This will call Firecrawl MCP to scrape
    // For now, manual process
    
    const businessData = {
      name: 'Business Name',
      slug: generateSlug('Business Name'),
      business_type: category,
      website: url,
      description: '',
      address: '',
      phone: '',
      email: '',
      source: 'scraped',
      scraped_at: new Date().toISOString(),
      is_claimed: false,
      listing_type: 'basic'
    };
    
    // Save to Supabase
    const { data: business, error } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log(`   ✅ Saved! ID: ${business.id}`);
    return business;
    
  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`);
    return null;
  }
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run the scraper
scrapeKidsActivities()
  .then(() => {
    console.log('\n✅ Scraper complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Scraper failed:', error);
    process.exit(1);
  });
