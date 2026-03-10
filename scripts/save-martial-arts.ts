#!/usr/bin/env tsx
/**
 * Save Martial Arts Clubs to Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const martialArtsClubs = [
  {
    businessName: "KiDojo KARATE SCHOOL & SPORTS CLUB",
    tagline: "Book your free trial today!",
    description: "KiDojo offers traditional martial arts programs aimed at developing character, respect, and self-discipline among students. Our training helps in cultivating great human character and preventing violent confrontations through self-control and humility.",
    address: "Al Hamra Village, Ras al Kheimah, UAE",
    phone: "+971 50 5032381",
    email: "richard@kidojo.me",
    website: "https://www.kidojo.me/",
    facebook: "http://www.facebook.com/kidojokarateschool",
    instagram: "https://instagram.com/kidojokarateschool",
    programs: [
      { name: "Kids Karate Classes", description: "Martial training specifically designed for children, focusing on discipline and skill development." },
      { name: "Adult Karate Classes", description: "Karate classes for adults focusing on self-defense and fitness." }
    ]
  },
  {
    businessName: "Al Moharb Martial Arts Club RAK",
    tagline: "Transform Your Life With Martial Arts",
    description: "We train all students, regardless of age (from 5 to 60 years old), adopting an athletic approach, particularly inspired by MMA Fighters, to maximize their physical capabilities.",
    address: "Al Mamourah, Ras al Khaimah, UAE",
    phone: "+971 505820064",
    website: "https://almoharbmartialartsclub.com/",
    facebook: "https://web.facebook.com/AlMoharbMartialArtsClub",
    instagram: "https://www.instagram.com/almoharbmartialartsclub/",
    programs: [
      { name: "Taekwondo", description: "Master the Way of the Foot and Fist: Unleash Your Potential with Taekwondo. Develop agility, explosiveness, and endurance." },
      { name: "Muay Thai", description: "Embrace the 'Art of Eight Limbs' and unleash your inner warrior through powerful punches, fast kicks, elbows and knees." },
      { name: "Kickboxing", description: "Combine the power of punches and kicks, this high-energy workout sculpts your body, challenges your mind, and unleashes your inner warrior." },
      { name: "Boxing", description: "Uncage your inner fighter and experience the raw power and exhilaration of boxing. You'll build confidence, strength and focus." },
      { name: "Mixed Martial Arts", description: "A symphony of combat disciplines merging wrestling, striking, and submission grappling into a great workout and transformative experience." }
    ]
  },
  {
    businessName: "BASE Martial Arts Academy",
    description: "BASE is the first Martial Arts Academy in Ras Al Khaimah, United Arab Emirates! Specialized in karate, kick boxing, and BJJ our mission is to aspire our every student to become a true champion! Increase your self confidence, discipline, focus, strength and a healthy life style by becoming part of BASE family.",
    address: "Ras Al Khaimah, United Arab Emirates",
    website: "https://baserakcom.wordpress.com/",
    instagram: "https://www.instagram.com/base.rak/",
    programs: [
      { name: "Karate", description: "Traditional karate training for all ages" },
      { name: "Kick Boxing", description: "High-energy kickboxing classes" },
      { name: "BJJ (Brazilian Jiu-Jitsu)", description: "Ground fighting and submission techniques" },
      { name: "Judo", description: "Japanese martial art focusing on throws and grappling" },
      { name: "Aikido", description: "Japanese martial art focused on harmony and non-violence" }
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
  console.log('💾 Saving Martial Arts Clubs to Supabase...\n');
  
  for (const club of martialArtsClubs) {
    await saveBusiness(club, 'sports');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n✅ All martial arts clubs saved!\n');
}

saveAll();
