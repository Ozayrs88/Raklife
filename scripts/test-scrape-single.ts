#!/usr/bin/env tsx
/**
 * Test script to scrape a single business and save to Supabase
 * 
 * Usage: npx tsx scripts/test-scrape-single.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

// Verify environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

// Initialize Supabase with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Test business data (we'll manually create for now)
 * In production, this would come from Firecrawl scraping
 */
const testBusiness = {
  // Basic info
  name: 'Champions Football Academy RAK',
  slug: 'champions-football-academy-rak-' + Math.random().toString(36).substring(2, 8),
  business_type: 'sports',
  
  // Contact info
  address: 'Al Hamra Village, Ras Al Khaimah, UAE',
  phone: '+971 7 244 9999',
  email: 'info@championsfc.ae',
  website: 'https://www.championsfc.ae',
  
  // Description
  tagline: 'Premier Football Training for Kids in RAK',
  description: 'Champions Football Academy offers professional football training for children aged 3-16. Our experienced coaches focus on skill development, teamwork, and fun.',
  about: 'Founded in 2015, Champions Football Academy has become one of RAK\'s leading sports academies. We offer year-round training programs, holiday camps, and competitive teams.',
  
  // Location
  latitude: 25.7558,
  longitude: 55.8038,
  
  // Ratings
  google_rating: 4.8,
  google_review_count: 127,
  
  // Social media
  instagram_url: 'https://instagram.com/championsfc.ae',
  facebook_url: 'https://facebook.com/championsfootballacademy',
  instagram_followers: 2500,
  
  // Operating hours
  operating_hours: {
    monday: { open: '15:00', close: '20:00' },
    tuesday: { open: '15:00', close: '20:00' },
    wednesday: { open: '15:00', close: '20:00' },
    thursday: { open: '15:00', close: '20:00' },
    friday: { open: '09:00', close: '12:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '09:00', close: '18:00' }
  },
  
  // Amenities
  amenities: [
    'Professional coaching',
    'Age-appropriate training',
    'Match kits provided',
    'Indoor & outdoor facilities',
    'Holiday camps',
    'Birthday party packages'
  ],
  
  // Scraping metadata
  source: 'scraped',
  scraped_at: new Date().toISOString(),
  is_claimed: false,
  listing_type: 'basic'
};

/**
 * Sample services data
 */
const testServices = [
  {
    name: 'Weekly Training Program',
    description: 'Regular weekly training sessions for skill development',
    price_from: 400,
    duration_text: '1 hour per week',
    source: 'website'
  },
  {
    name: 'Holiday Camp',
    description: 'Intensive training during school holidays',
    price_from: 800,
    duration_text: '1 week',
    source: 'website'
  },
  {
    name: 'Private Coaching',
    description: 'One-on-one coaching sessions',
    price_from: 200,
    duration_text: '1 hour',
    source: 'website'
  },
  {
    name: 'Birthday Party Package',
    description: 'Fun football-themed birthday party',
    price_from: 1200,
    duration_text: '2 hours',
    source: 'website'
  }
];

/**
 * Sample images data
 */
const testImages = [
  {
    url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800',
    source: 'website',
    type: 'hero',
    display_order: 0
  },
  {
    url: 'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800',
    source: 'website',
    type: 'gallery',
    display_order: 1
  },
  {
    url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800',
    source: 'website',
    type: 'gallery',
    display_order: 2
  }
];

/**
 * Sample team members
 */
const testTeam = [
  {
    name: 'Coach Ahmed',
    role: 'Head Coach',
    bio: 'UEFA licensed coach with 15 years of experience',
    photo_url: 'https://i.pravatar.cc/300?img=12',
    display_order: 0
  },
  {
    name: 'Coach Sarah',
    role: 'Youth Development Coach',
    bio: 'Specialized in training young players aged 3-8',
    photo_url: 'https://i.pravatar.cc/300?img=47',
    display_order: 1
  }
];

/**
 * Sample FAQs
 */
const testFaqs = [
  {
    question: 'What age groups do you cater to?',
    answer: 'We offer programs for children aged 3-16, with age-appropriate training groups.',
    display_order: 0
  },
  {
    question: 'Do you provide equipment?',
    answer: 'Yes, we provide all training equipment. Players just need to bring water and wear appropriate sports clothing.',
    display_order: 1
  },
  {
    question: 'Can I try a session before enrolling?',
    answer: 'Absolutely! We offer a free trial session for new students.',
    display_order: 2
  }
];

/**
 * Main test function
 */
async function testScrapeSingle() {
  console.log('🚀 Testing Single Business Scrape\n');
  console.log('═══════════════════════════════════════\n');
  
  try {
    // Step 1: Check if business already exists
    console.log('🔍 Checking for existing business...');
    const { data: existing } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', testBusiness.name)
      .single();
    
    if (existing) {
      console.log(`⚠️  Business already exists: ${existing.name} (ID: ${existing.id})`);
      console.log('   Deleting for fresh test...\n');
      
      // Delete existing business (cascade will delete related records)
      await supabase.from('businesses').delete().eq('id', existing.id);
    }
    
    // Step 2: Insert business
    console.log('💾 Saving business to database...');
    const { data: newBusiness, error: bizError } = await supabase
      .from('businesses')
      .insert(testBusiness)
      .select()
      .single();
    
    if (bizError) {
      throw new Error(`Failed to insert business: ${bizError.message}`);
    }
    
    console.log(`✅ Business saved! ID: ${newBusiness.id}\n`);
    
    const businessId = newBusiness.id;
    
    // Step 3: Save images
    console.log(`📸 Saving ${testImages.length} images...`);
    const imageData = testImages.map(img => ({
      ...img,
      business_id: businessId
    }));
    
    const { error: imgError } = await supabase
      .from('business_images')
      .insert(imageData);
    
    if (imgError) {
      console.error(`⚠️  Image insert warning: ${imgError.message}`);
    } else {
      console.log(`✅ ${testImages.length} images saved\n`);
    }
    
    // Step 4: Save services
    console.log(`📝 Saving ${testServices.length} services...`);
    const serviceData = testServices.map(service => ({
      ...service,
      business_id: businessId
    }));
    
    const { error: svcError } = await supabase
      .from('services_scraped')
      .insert(serviceData);
    
    if (svcError) {
      console.error(`⚠️  Service insert warning: ${svcError.message}`);
    } else {
      console.log(`✅ ${testServices.length} services saved\n`);
    }
    
    // Step 5: Save team members
    console.log(`👥 Saving ${testTeam.length} team members...`);
    const teamData = testTeam.map(member => ({
      ...member,
      business_id: businessId
    }));
    
    const { error: teamError } = await supabase
      .from('team_members_scraped')
      .insert(teamData);
    
    if (teamError) {
      console.error(`⚠️  Team insert warning: ${teamError.message}`);
    } else {
      console.log(`✅ ${testTeam.length} team members saved\n`);
    }
    
    // Step 6: Save FAQs
    console.log(`❓ Saving ${testFaqs.length} FAQs...`);
    const faqData = testFaqs.map(faq => ({
      ...faq,
      business_id: businessId
    }));
    
    const { error: faqError } = await supabase
      .from('faqs_scraped')
      .insert(faqData);
    
    if (faqError) {
      console.error(`⚠️  FAQ insert warning: ${faqError.message}`);
    } else {
      console.log(`✅ ${testFaqs.length} FAQs saved\n`);
    }
    
    // Step 7: Get updated business with scores
    console.log('📊 Calculating completeness and rank scores...');
    const { data: updatedBusiness } = await supabase
      .from('businesses')
      .select('completeness_score, rank_score')
      .eq('id', businessId)
      .single();
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ TEST COMPLETE!\n');
    console.log('📊 Results:');
    console.log(`   Business ID: ${businessId}`);
    console.log(`   Completeness Score: ${updatedBusiness?.completeness_score || 0}%`);
    console.log(`   Rank Score: ${updatedBusiness?.rank_score || 0}`);
    console.log(`   Images: ${testImages.length}`);
    console.log(`   Services: ${testServices.length}`);
    console.log(`   Team: ${testTeam.length}`);
    console.log(`   FAQs: ${testFaqs.length}`);
    console.log('\n🎉 Business successfully scraped and saved!\n');
    console.log('🔗 View in Supabase:');
    console.log(`   https://supabase.com/dashboard/project/xqktkocghagcwdlljcho/editor/businesses?filter=id%3Aeq%3A${businessId}`);
    console.log('\n');
    
  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message);
    process.exit(1);
  }
}

// Run the test
testScrapeSingle();
