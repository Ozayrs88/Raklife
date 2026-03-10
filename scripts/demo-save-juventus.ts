#!/usr/bin/env tsx
/**
 * Demo: Save Juventus Academy RAK to Supabase
 * Shows the complete Firecrawl → Supabase flow
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Data scraped from Firecrawl
const scrapedData = {
  businessName: "Juventus Academy RAK",
  description: "Juventus Academy RAK aims at helping young footballers take their first steps into football through the Juventus method, which is known worldwide and is followed in over 100 projects. The Academy offers a professional training environment with a focus on technical, tactical, mental, and emotional development of players.",
  tagline: "Join the #JUAE family and be part of the Juventus Academy experience!",
  address: "Marjan Island Resort & Spa - Marjan Island Blvd - Ras al Khaimah - UAE",
  phone: "050 117 0236",
  email: "rak@juventusacademy.ae",
  website: "https://academy.juventus.com/en/year-round-training-rak/",
  instagram: "https://www.instagram.com/jacademyrak/",
  facebook: "https://bit.ly/3pSAIoK",
  amenities: [
    "Hotel Local Partnership with Hilton Garden Inn",
    "Qualified and experienced coaches",
    "COVID-19 safety measures"
  ],
  programs: [
    {
      name: "Juventus Training Programs",
      description: "Technical training programs including goalkeeper programs, participation in internal leagues and tournaments, elite teams, and international exposure through Juventus academy events.",
      ageGroup: "Young footballers"
    }
  ]
};

async function saveToSupabase() {
  console.log('💾 Saving Juventus Academy RAK to Supabase...\n');
  
  try {
    // 1. Prepare business data
    const businessData = {
      slug: 'juventus-academy-rak-' + Math.random().toString(36).substring(2, 8),
      name: scrapedData.businessName,
      business_type: 'sports',
      description: scrapedData.description,
      tagline: scrapedData.tagline,
      address: scrapedData.address,
      phone: scrapedData.phone,
      email: scrapedData.email,
      website: scrapedData.website,
      instagram_url: scrapedData.instagram,
      facebook_url: scrapedData.facebook,
      amenities: scrapedData.amenities,
      about: scrapedData.description,
      source: 'scraped',
      scraped_at: new Date().toISOString(),
      is_claimed: false,
      listing_type: 'basic'
    };
    
    // 2. Check if already exists
    const { data: existing } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', businessData.name)
      .single();
    
    if (existing) {
      console.log(`⚠️  Business already exists: ${existing.name}`);
      console.log(`   ID: ${existing.id}\n`);
      return;
    }
    
    // 3. Insert business
    console.log('📝 Inserting business record...');
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert(businessData)
      .select()
      .single();
    
    if (bizError) throw bizError;
    
    console.log(`✅ Business saved! ID: ${business.id}\n`);
    
    // 4. Save programs as services
    if (scrapedData.programs.length > 0) {
      console.log(`📋 Saving ${scrapedData.programs.length} programs...`);
      
      const serviceData = scrapedData.programs.map(program => ({
        business_id: business.id,
        name: program.name,
        description: program.description,
        source: 'website'
      }));
      
      const { error: svcError } = await supabase
        .from('services_scraped')
        .insert(serviceData);
      
      if (svcError) throw svcError;
      
      console.log(`✅ ${scrapedData.programs.length} programs saved\n`);
    }
    
    // 5. Get updated scores
    console.log('📊 Fetching calculated scores...');
    const { data: updated } = await supabase
      .from('businesses')
      .select('completeness_score, rank_score')
      .eq('id', business.id)
      .single();
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ SUCCESS!\n');
    console.log('📊 Results:');
    console.log(`   Name: ${scrapedData.businessName}`);
    console.log(`   ID: ${business.id}`);
    console.log(`   Completeness: ${updated?.completeness_score || 0}%`);
    console.log(`   Rank Score: ${updated?.rank_score || 0}`);
    console.log(`   Programs: ${scrapedData.programs.length}`);
    console.log(`   Amenities: ${scrapedData.amenities.length}`);
    console.log('\n🔗 View in Supabase:');
    console.log(`   https://supabase.com/dashboard/project/xqktkocghagcwdlljcho/editor/businesses\n`);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

saveToSupabase();
