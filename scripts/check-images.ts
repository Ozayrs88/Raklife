#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkImages() {
  // Check businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, logo_url, cover_photo_url')
    .eq('source', 'scraped');
  
  // Check business_images table
  const { data: images } = await supabase
    .from('business_images')
    .select('business_id, url, type')
    .limit(100);
  
  console.log('📊 Image Status:\n');
  console.log(`Total businesses: ${businesses?.length || 0}`);
  console.log(`Businesses with logos: ${businesses?.filter(b => b.logo_url).length || 0}`);
  console.log(`Businesses with covers: ${businesses?.filter(b => b.cover_photo_url).length || 0}`);
  console.log(`\nImages in business_images table: ${images?.length || 0}\n`);
  
  // Group by business
  const imagesByBusiness = new Map<string, number>();
  images?.forEach(img => {
    const count = imagesByBusiness.get(img.business_id) || 0;
    imagesByBusiness.set(img.business_id, count + 1);
  });
  
  console.log(`Businesses with gallery images: ${imagesByBusiness.size}`);
  
  // Show businesses WITHOUT images
  const businessesWithoutImages = businesses?.filter(b => 
    !b.logo_url && !b.cover_photo_url && !imagesByBusiness.has(b.id)
  );
  
  console.log(`\n⚠️  Businesses WITHOUT any images: ${businessesWithoutImages?.length || 0}`);
  businessesWithoutImages?.slice(0, 10).forEach(b => {
    console.log(`   - ${b.name}`);
  });
}

checkImages();
