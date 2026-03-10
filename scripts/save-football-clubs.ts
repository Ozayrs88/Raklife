#!/usr/bin/env tsx
/**
 * Save SK Football Academy to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const skData = {
  businessName: "SK Academy",
  tagline: "We pride ourselves in offering the best value football coaching in the UAE.",
  description: "Established in 2002, SK Academy is one of the largest football coaching academies in the UAE. We strive to bring together all races, ages, abilities, and genders to enjoy football.",
  website: "https://skfootballacademy.com/",
  phone: "+971 55 207 3168",
  amenities: [
    "1 on 1 private football lessons",
    "Birthday parties",
    "Adult football fitness classes"
  ],
  programs: [
    {
      name: "1 on 1 private football lesson",
      description: "1 on 1 football session",
      price: "200.00 AED",
      ageGroup: "All ages"
    },
    {
      name: "SK Football Academy Birthday Party",
      description: "Birthday parties",
      price: "1,000.00 AED",
      ageGroup: "All ages"
    },
    {
      name: "Adult Football Fitness",
      description: "Fitness training through football",
      price: "60.00 AED",
      ageGroup: "Adults"
    },
    {
      name: "Football Coaching",
      description: "Football coaching classes",
      ageGroup: "3 - 16 years"
    }
  ]
};

const chaseData = {
  businessName: "Chase Sports Academy",
  description: "The Chase Sports Academy is a community where people of all ages are welcome to take part in their favourite sports, be a part of a team and meet others with the same ambitions and energy.",
  website: "https://csprak.com/",
  phone: "+971 58 6610334",
  email: "info@csprak.com",
  address: "Al Harma Industrial Zone, Ras Al Khaimah, UAE",
  instagram: "https://www.instagram.com/chase.rak/",
  facebook: "https://www.facebook.com/ChaseSports.RAK/",
  programs: [
    {
      name: "Kids Basketball",
      description: "Basketball training for kids"
    },
    {
      name: "Kids Volleyball",
      description: "Volleyball training for kids"
    },
    {
      name: "Kids Gymnastics",
      description: "Gymnastics training for kids"
    },
    {
      name: "Kids Kickboxing",
      description: "Kickboxing training for kids"
    },
    {
      name: "Kids Taekwondo",
      description: "Taekwondo training for kids"
    },
    {
      name: "CrossFit for Kids",
      description: "CrossFit training adapted for children"
    },
    {
      name: "Jiu-jitsu for Kids",
      description: "Brazilian Jiu-jitsu for children"
    }
  ]
};

async function saveBusiness(data: any, category: string) {
  try {
    const { data: existing } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', data.businessName)
      .single();
    
    if (existing) {
      console.log(`⚠️  ${data.businessName} already exists (ID: ${existing.id})`);
      return existing.id;
    }
    
    const { data: business, error: bizError } = await supabase
      .from('businesses')
      .insert({
        slug: data.businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8),
        name: data.businessName,
        business_type: category,
        description: data.description,
        tagline: data.tagline,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        instagram_url: data.instagram,
        facebook_url: data.facebook,
        amenities: data.amenities,
        source: 'scraped',
        scraped_at: new Date().toISOString(),
        is_claimed: false,
        listing_type: 'basic'
      })
      .select()
      .single();
    
    if (bizError) throw bizError;
    
    console.log(`✅ ${data.businessName} saved! ID: ${business.id}`);
    
    if (data.programs && data.programs.length > 0) {
      const serviceData = data.programs.map((p: any) => ({
        business_id: business.id,
        name: p.name,
        description: p.description,
        price_from: p.price ? parseFloat(p.price.replace(/[^0-9.]/g, '')) : null,
        source: 'website'
      }));
      
      await supabase.from('services_scraped').insert(serviceData);
      console.log(`   📋 ${data.programs.length} programs saved`);
    }
    
    return business.id;
  } catch (error: any) {
    console.error(`❌ ${data.businessName} failed: ${error.message}`);
    return null;
  }
}

async function saveAll() {
  console.log('💾 Saving football/sports clubs to Supabase...\n');
  
  await saveBusiness(skData, 'sports');
  await saveBusiness(chaseData, 'sports');
  
  console.log('\n✅ All saved!\n');
}

saveAll();
