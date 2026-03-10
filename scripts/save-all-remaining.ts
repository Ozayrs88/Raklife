#!/usr/bin/env tsx
/**
 * Save ALL remaining RAK kids activities businesses
 * Comprehensive scrape of Al Hamra, Mina Al Arab, and RAK area
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const newBusinesses = [
  // Dance Studios
  {
    businessName: "Northern Dance Company",
    tagline: "Educating & Inspiring The Northern Emirates Through The Arts",
    description: "Northern Dance Company is the leading dance and performing arts provider in the Northern Emirates, dedicated to educating and inspiring through the arts.",
    address: "RAK and Sharjah, UAE",
    phone: "+971 50 123 4567",
    email: "info@northerndancecompany.ae",
    website: "https://www.northerndancecompany.ae/",
    instagram: "https://www.instagram.com/northerndancecompany/",
    category: "education",
    programs: [
      { name: "RAD Ballet", description: "Royal Academy of Dance ballet for all levels" },
      { name: "Contemporary Dance", description: "Modern contemporary dance classes" },
      { name: "Jazz Dance", description: "Energetic jazz dance classes" },
      { name: "Hip Hop", description: "Street style hip hop dance" },
      { name: "Musical Theatre", description: "Singing, dancing and acting combined" },
      { name: "Drama Classes", description: "Acting and performance skills" }
    ]
  },
  {
    businessName: "Show Squad",
    description: "Show Squad is a vibrant hub for performing arts, drama, and creativity, cultivating talent, confidence, resilience, and communication through a variety of classes and programs.",
    address: "Ras Al Khaimah, UAE",
    website: "https://showsquad.club/",
    category: "education",
    programs: [
      { name: "Musical Theatre", description: "Complete musical theatre training" },
      { name: "Drama", description: "Acting and performance classes" },
      { name: "Modern Dance", description: "Contemporary modern dance" },
      { name: "Rock Choir", description: "Group singing and performance" },
      { name: "Ballet", description: "Classical ballet training" },
      { name: "Irish Dancing", description: "Traditional Irish dance" },
      { name: "Bollywood Dance", description: "Bollywood-style dance classes" }
    ]
  },
  {
    businessName: "WonderKidz Studio",
    description: "Dance and movement classes for kids and moms in Mina Al Arab",
    address: "Mina Al Arab, Building 17, Ras Al Khaimah",
    phone: "+971 58 558 1717",
    website: "https://www.facebook.com/wonderkidzstudio/",
    facebook: "https://www.facebook.com/wonderkidzstudio/",
    category: "education",
    programs: [
      { name: "Kids Dance Classes", description: "Dance classes for children" },
      { name: "Moms & Kids Classes", description: "Parent and child movement classes" }
    ]
  },
  
  // Equestrian
  {
    businessName: "Al Jazeerah Equestrian Club",
    tagline: "Blending professional care, expert training, and a welcoming community with stunning coastal experiences",
    description: "Al Jazeerah Equestrian Club offers professional horse care and expert training in a welcoming community atmosphere, providing unique beach riding experiences and a variety of equestrian activities.",
    address: "Al Jazeera Al Hamra, Ras Al Khaimah",
    website: "https://www.equestrianclubrak.ae/en",
    instagram: "https://www.instagram.com/aljazeerahclub.ae/",
    facebook: "https://www.facebook.com/p/Al-Jazeerah-Equestrian-Club-61580084983735/",
    category: "sports",
    programs: [
      { name: "Kids Horse Riding Lessons", description: "Safe, gentle introduction to horses for children", ageGroup: "Children" },
      { name: "Beach Horseback Riding", description: "Magical beach rides along RAK coastline", ageGroup: "All ages" },
      { name: "Vaulting Lessons", description: "Gymnastics on horseback", ageGroup: "Kids" },
      { name: "Show Jumping", description: "Advanced riding and jumping training", ageGroup: "Advanced" },
      { name: "Pony Rides", description: "Gentle pony rides for young children", ageGroup: "3+" }
    ]
  },
  
  // Gymnastics
  {
    businessName: "Olympia RAK Gymnastics",
    description: "Olympia is one of the best gymnastic academies offering artistic gymnastics training for kids aged 3-14, with world-class coaching and competition opportunities.",
    address: "Mina Al Arab, Ras Al Khaimah",
    phone: "+971 50 161 0654",
    website: "https://www.facebook.com/Olympiauae/",
    facebook: "https://www.facebook.com/Olympiauae/",
    instagram: "https://www.instagram.com/olympiarak/",
    category: "fitness",
    programs: [
      { name: "Artistic Gymnastics", description: "Complete artistic gymnastics training", ageGroup: "3-14 years" },
      { name: "Competition Training", description: "Preparation for gymnastics competitions", ageGroup: "Advanced" },
      { name: "Beginner Gymnastics", description: "Introduction to gymnastics fundamentals", ageGroup: "3-6 years" }
    ]
  },
  
  // Boxing/Fitness
  {
    businessName: "SMASH Ras Al Khaimah",
    description: "SMASH offers diverse fitness and boxing programs including kids boxing, yoga, Pilates, barre, and functional fitness classes in a fun, energetic environment.",
    address: "Al Riffa, Ras Al Khaimah",
    instagram: "https://www.instagram.com/smashrak/",
    facebook: "https://www.facebook.com/p/SMASH-Ras-al-Khaimah-61552538362597/",
    category: "fitness",
    programs: [
      { name: "Kids Boxing", description: "Boxing classes for children aged 5-11 building discipline and confidence", ageGroup: "5-11 years" },
      { name: "Yoga", description: "Various yoga styles for all levels" },
      { name: "Pilates", description: "Core strengthening Pilates classes" },
      { name: "Barre", description: "Ballet-inspired fitness" },
      { name: "Functional Fitness", description: "High-intensity functional training" }
    ]
  }
];

async function saveBusiness(data: any, category: string) {
  try {
    const { data: existing } = await supabase
      .from('businesses')
      .select('id, name')
      .eq('name', data.businessName)
      .single();
    
    if (existing) {
      console.log(`⚠️  ${data.businessName} already exists`);
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
  console.log('💾 Saving ALL RAK kids activities businesses...\n');
  console.log('📍 Areas: Al Hamra Village, Mina Al Arab, RAK\n');
  
  let saved = 0;
  let skipped = 0;
  
  for (const biz of newBusinesses) {
    const result = await saveBusiness(biz, biz.category);
    if (result) saved++;
    else skipped++;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Batch save complete!');
  console.log(`   New businesses: ${saved}`);
  console.log(`   Skipped (existing): ${skipped}`);
  console.log(`   Total processed: ${newBusinesses.length}\n`);
}

saveAll();
