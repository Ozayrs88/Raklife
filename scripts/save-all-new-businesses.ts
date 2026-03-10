#!/usr/bin/env tsx
/**
 * Save ALL new businesses scraped with Firecrawl
 * Comprehensive update with all categories
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// All new businesses scraped from Firecrawl Google Maps
const newBusinesses: Record<string, any> = {
  // SWIMMING
  'Apex Sports Academy RAK Branch': {
    category: 'sports',
    subcategory: 'Swimming',
    phone: '+971 50 194 1309',
    website: 'apexsports.ae',
    address: '5 Al Maarif St - Sheikh Khalifa City - Ras Al Khaimah',
    description: 'Sports club offering swimming classes for all ages'
  },
  "Leo's Community": {
    category: 'sports',
    subcategory: 'Sports Complex',
    rating: 4.3,
    phone: '+971 50 886 1728',
    address: 'Emirates Club Basketball Court - Ras Al-Khaimah',
    hours: { monday: '8 AM–11 PM' }
  },
  'AL JAZEERA DIVING & SWIMMING CENTER': {
    category: 'sports',
    subcategory: 'Swimming',
    rating: 4.4,
    phone: '+971 56 979 8783',
    website: 'aljazeeradivecenter.com',
    address: 'Behind Iceland - near Al Jazeera Port',
    hours: { monday: 'Closed until 8 PM' }
  },
  
  // MUSIC
  'Music Zone': {
    category: 'education',
    subcategory: 'Music School',
    rating: 4.9,
    phone: '+971 7 258 8869',
    website: 'music-zone.org',
    address: 'Musallah Al Eid Rd - Dafan Ras Al Khaimah',
    hours: { monday: '2–9 PM' },
    description: "RAK's largest music school - Piano, Violin, Guitar, Singing, Drums, Oud"
  },
  'Piano music dance studio': {
    category: 'education',
    subcategory: 'Music & Dance',
    rating: 5.0,
    phone: '+971 58 982 8266',
    address: 'Mina Al Arab',
    description: 'Dance and music center - ballet, hip-hop, piano, violin'
  },
  
  // TENNIS
  'European Tennis Service': {
    category: 'sports',
    subcategory: 'Tennis',
    rating: 5.0,
    phone: '+971 52 885 5045',
    website: 'eutennisrak.com',
    address: 'Al Bari St - Al Jazeera Al Hamra',
    hours: { monday: '6 AM–10 PM' },
    description: 'Group and individual tennis lessons for all ages'
  },
  
  // TRAMPOLINE & INDOOR PLAY
  'FLY ZONE Trampoline Park': {
    category: 'sports',
    subcategory: 'Trampoline Park',
    rating: 4.1,
    phone: '+971 50 660 6300',
    website: 'flyzoone.com',
    address: 'Jogging Trail - Khoor Ras Al Khaimah',
    hours: { monday: '4 PM–12 AM' },
    description: "RAK's first integrated trampoline park with ninja courses"
  },
  'Flipped Park Ras-al-Khaimah': {
    category: 'sports',
    subcategory: 'Indoor Adventure Park',
    rating: 4.9,
    phone: '+971 7 244 8272',
    website: 'flippedpark.com/flipped-ras-al-khaimah/',
    address: 'Al Manar Mall - Dafan Al Nakheel',
    hours: { monday: '10 AM–10 PM' },
    description: 'Indoor adventure park with trampolines, ball pit, and activities'
  },
  
  // ART & CREATIVE
  'Creative Hands Pottery Studio': {
    category: 'education',
    subcategory: 'Art Studio',
    rating: 5.0,
    phone: '+971 54 321 5426',
    website: 'creativehands.ae',
    address: 'Al Naeem Twin Tower - 108 Corniche Al Qawasim St',
    description: 'Pottery, ceramic painting, canvas workshops for kids'
  },
  
  // BASKETBALL
  'Eagle Basketball': {
    category: 'sports',
    subcategory: 'Basketball',
    rating: 4.9,
    phone: '+971 50 873 1434',
    address: 'beside rak hospital - Al Qussaidat',
    description: 'Basketball academy for kids and teens'
  },
  
  // PADEL
  'The Padel Club': {
    category: 'sports',
    subcategory: 'Padel',
    rating: 4.8,
    phone: '+971 54 799 6879',
    address: '6 70A St - Al Felyyah',
    hours: { monday: 'Open until 12 AM' },
    description: "RAK's indoor padel tennis courts"
  },
  
  // ROBOTICS & STEM
  'UCMAS Ras Al Khaimah - IDEAL WAY EDUCATION': {
    category: 'education',
    subcategory: 'STEM & Robotics',
    rating: 5.0,
    phone: '+971 7 226 3550',
    website: 'idealwayeducation.com',
    address: 'Office 103, Concord Building Near Dubai Islamic Bank',
    hours: { monday: '9:30 AM–7:30 PM' },
    description: 'Robotics training and STEAM electronics for kids'
  },
  
  // DANCE
  'Sky Arts Center': {
    category: 'education',
    subcategory: 'Dance',
    rating: 4.9,
    phone: '+971 50 479 1860',
    address: 'Al Hudeeba - Ras Al-Khaimah',
    description: 'Dance school - Bollywood, hip-hop, art classes'
  },
  
  // ADDITIONAL FOUND FROM SEARCH RESULTS
  'Legends Performing Arts Centre': {
    category: 'education',
    subcategory: 'Dance & Theater',
    rating: 4.9,
    phone: '+971 52 944 3505',
    website: 'legendsrak.com',
    address: 'Ras Al Khaimah',
    description: 'Dance and performing arts center'
  },
  'Mathra Arts Ras al Khaimah': {
    category: 'education',
    subcategory: 'Dance',
    rating: 4.9,
    phone: '+971 52 943 6212',
    website: 'mathraarts.com',
    address: 'Ras Al Khaimah',
    hours: { monday: 'Closes 9 PM' },
    description: 'Dance school'
  }
};

async function saveAllNewBusinesses() {
  console.log('🎉 Saving ALL new businesses to RAKlife!\n');
  console.log(`Found ${Object.keys(newBusinesses).length} new businesses to add\n`);
  
  let saved = 0;
  let skipped = 0;
  
  for (const [businessName, data] of Object.entries(newBusinesses)) {
    console.log(`\n📍 ${businessName}`);
    
    // Check if business already exists
    const { data: existing } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', businessName)
      .limit(1);
    
    if (existing && existing.length > 0) {
      console.log(`   ⚠️  Already exists - skipping`);
      skipped++;
      continue;
    }
    
    // Generate slug and email
    const slug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const email = `info@${slug}.ae`; // Generic email
    
    // Prepare business data
    const businessData: any = {
      name: businessName,
      slug: slug,
      email: email,
      business_type: data.category,
      description: data.description || `${data.subcategory} in Ras Al Khaimah`,
      address: data.address,
      phone: data.phone,
      website: data.website,
      google_rating: data.rating,
      operating_hours: data.hours,
      source: 'scraped',
      scraped_at: new Date().toISOString(),
      city: 'Ras Al Khaimah',
      country: 'United Arab Emirates'
    };
    
    // Insert business
    const { data: inserted, error } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single();
    
    if (error) {
      console.log(`   ❌ Error: ${error.message}`);
      continue;
    }
    
    console.log(`   ✅ Saved!`);
    if (data.rating) console.log(`      ⭐ ${data.rating}`);
    if (data.phone) console.log(`      📞 ${data.phone}`);
    if (data.subcategory) console.log(`      🏷️  ${data.subcategory}`);
    
    saved++;
  }
  
  console.log('\n\n═══════════════════════════════════════');
  console.log(`✅ Successfully saved: ${saved} businesses`);
  console.log(`⚠️  Skipped (already exist): ${skipped} businesses`);
  console.log(`📊 Total processed: ${Object.keys(newBusinesses).length} businesses`);
  console.log('═══════════════════════════════════════\n');
}

saveAllNewBusinesses();
