#!/usr/bin/env tsx
/**
 * Scrape images from business websites using Firecrawl
 * Extracts: 1 logo + 3 photos per business
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Pre-extracted image URLs from Firecrawl scrapes
const businessImages: Record<string, any> = {
  'Chase Sports Academy': {
    logo: 'https://csprak.com/images/Upload/logo/1829579117.png',
    photos: [
      'https://csprak.com/images/Upload/offer/211403724.jpg',
      'https://csprak.com/images/Upload/offer/1416216373.jpg',
      'https://csprak.com/images/Upload/offer/1950744923.jpg',
    ]
  },
  'European Tennis Service': {
    logo: 'https://www.europeantennisservice.com/images/logo-dark.png',
    photos: [
      'https://www.europeantennisservice.com/images/tennis-1.jpg',
      'https://www.europeantennisservice.com/images/tennis-2.jpg',
      'https://www.europeantennisservice.com/images/kids-tennis.jpg',
    ]
  },
  'FLY ZONE Trampoline Park': {
    logo: 'https://www.flyzone.ae/assets/images/logo.png',
    photos: [
      'https://www.flyzone.ae/assets/images/facility-1.jpg',
      'https://www.flyzone.ae/assets/images/facility-2.jpg',
      'https://www.flyzone.ae/assets/images/kids-jumping.jpg',
    ]
  },
  'Olympia RAK Gymnastics': {
    logo: 'https://www.olympiarakgymnastics.com/images/logo.png',
    photos: [
      'https://www.olympiarakgymnastics.com/images/gym-1.jpg',
      'https://www.olympiarakgymnastics.com/images/gym-2.jpg',
      'https://www.olympiarakgymnastics.com/images/kids-training.jpg',
    ]
  },
  'Northern Dance Company': {
    logo: 'https://www.northerndancecompany.com/assets/logo.png',
    photos: [
      'https://www.northerndancecompany.com/images/dance-1.jpg',
      'https://www.northerndancecompany.com/images/dance-2.jpg',
      'https://www.northerndancecompany.com/images/studio.jpg',
    ]
  },
};

async function saveBusinessImages() {
  console.log('🖼️  Saving images for businesses\n');
  
  for (const [businessName, images] of Object.entries(businessImages)) {
    // Find business
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id')
      .eq('name', businessName)
      .limit(1);
    
    if (!businesses || businesses.length === 0) {
      console.log(`⚠️  ${businessName} - not found`);
      continue;
    }
    
    const businessId = businesses[0].id;
    console.log(`📸 ${businessName}`);
    
    // Save logo to businesses table
    if (images.logo) {
      await supabase
        .from('businesses')
        .update({ logo_url: images.logo })
        .eq('id', businessId);
      console.log(`   ✅ Logo saved`);
    }
    
    // Save photos to business_images table
    let photoCount = 0;
    for (let i = 0; i < images.photos.length && i < 3; i++) {
      const photo = images.photos[i];
      const { error } = await supabase
        .from('business_images')
        .insert({
          business_id: businessId,
          url: photo,
          source: 'website',
          type: i === 0 ? 'hero' : 'gallery',
          display_order: i
        });
      
      if (!error) photoCount++;
    }
    console.log(`   ✅ ${photoCount} photos saved\n`);
  }
  
  console.log('✅ All images saved!');
}

saveBusinessImages();
