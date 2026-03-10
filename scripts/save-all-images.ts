#!/usr/bin/env tsx
/**
 * Save scraped images from business websites to Supabase
 * Extracted via Firecrawl JSON format on 2026-03-09
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Real image URLs extracted from Firecrawl scrapes
const businessImages: Record<string, any> = {
  'Chase Sports Academy': {
    logo: 'https://csprak.com/images/Upload/logo/1829579117.png',
    photos: [
      'https://csprak.com/images/Upload/offer/1950744923.jpg',
      'https://csprak.com/images/Upload/offer/2104916936.jpg',
      'https://csprak.com/images/Upload/offer/2089455640.jpg',
    ]
  },
  'AL JAZEERA DIVING & SWIMMING CENTER': {
    logo: 'https://aljazeeradivecenter.com/wp-content/uploads/2021/02/IMG-20200707-WA0019-320x220.jpg',
    photos: [
      'https://aljazeeradivecenter.com/wp-content/uploads/2021/01/FB_IMG_1588068885936-e1676970208630.jpg',
      'https://aljazeeradivecenter.com/wp-content/uploads/2023/02/20200707_121326-scaled.jpg',
      'https://aljazeeradivecenter.com/wp-content/uploads/2019/06/IMG_1958.jpg',
    ]
  },
  'Al Jazeerah Equestrian Club': {
    logo: 'https://www.equestrianclubrak.ae/images/aljazeerah-equestrian-club-logo.webp',
    photos: [
      'https://www.equestrianclubrak.ae/images/aljazeerah-equestrian-club-featured-xs.webp',
      'https://www.equestrianclubrak.ae/images/al-jazeerah-equestrian-club-horse-jumping-training-xs.webp',
      'https://www.equestrianclubrak.ae/images/al-jazeerah-equestrian-club-stable-facilities-xs.webp',
    ]
  },
  'Al Moharb Martial Arts Club RAK': {
    logo: 'https://almoharbmartialartsclub.com/wp-content/uploads/2024/02/taekwondo.png',
    photos: [
      'https://almoharbmartialartsclub.com/wp-content/uploads/2024/02/taekwondo.png',
      'https://almoharbmartialartsclub.com/wp-content/uploads/2024/02/muay-thai.png',
      'https://almoharbmartialartsclub.com/wp-content/uploads/2024/02/sport.png',
    ]
  },
  'BASE Martial Arts Academy': {
    logo: 'https://baserakcom.wordpress.com/wp-content/uploads/2021/02/cropped-alt-logo-dark-green-1.png?w=50',
    photos: [
      'https://yt3.ggpht.com/iyyFu3wfe74gNXXrLGK0v1jtlmG764FLG7C70W0w0NX_x4FX1zQUmQbO7NBNbW2jco7vO84IqQ=s68-c-k-c0x00ffffff-no-rj',
    ]
  },
  'Creative Hands Pottery Studio': {
    logo: 'https://creativehands.ae/favicon.ico',
    photos: []
  },
  'European Tennis Service': {
    logo: 'https://eutennisrak.com/wp-content/uploads/2025/09/ETS-Logo-pdf-Round.jpg',
    photos: [
      'https://eutennisrak.com/wp-content/uploads/2025/09/Jazeera-Center.png',
      'https://eutennisrak.com/wp-content/uploads/2026/01/Intercontinetal.png',
      'https://eutennisrak.com/wp-content/uploads/2025/09/eaf582b5-d127-4351-bf77-d1df4a1bd606.webp',
    ]
  },
  'Flipped Park Ras-al-Khaimah': {
    logo: 'https://flippedpark.com/wp-content/uploads/2024/03/Flipped-logo-08-1.png',
    photos: [
      'https://flippedpark.com/wp-content/uploads/2024/11/Jumpverse-1-1024x1024.jpg',
      'https://flippedpark.com/wp-content/uploads/2024/11/Ballpit-1-1024x1024.jpg',
      'https://flippedpark.com/wp-content/uploads/2024/11/Rampage-Room-1-1024x726.png',
    ]
  },
  'FLY ZONE Trampoline Park': {
    logo: 'https://flyzoone.com/wp-content/uploads/2021/08/logo_w.png',
    photos: [
      'https://flyzoone.com/wp-content/uploads/2026/03/image-1.jpg',
      'https://flyzoone.com/wp-content/uploads/2026/03/Image-2.jpg',
      'https://flyzoone.com/wp-content/uploads/2026/03/kids-zone.jpg',
    ]
  },
  'KiDojo KARATE SCHOOL & SPORTS CLUB': {
    logo: 'https://static.wixstatic.com/media/23fd2a2be53141ed810f4d3dcdcd01fa.png',
    photos: [
      'https://static.wixstatic.com/media/86cb94_d6a3174d00bf45a5898012c0e4f58027~mv2_d_6784_4523_s_4_2.jpg',
      'https://static.wixstatic.com/media/86cb94_15b7b72af5bd45d79b5e8f266c3aee10~mv2_d_4000_2697_s_4_2.jpeg',
      'https://static.wixstatic.com/media/6eed79_8b9880efd77c49f3a75bde2598f66532~mv2.jpg',
    ]
  },
  'Legends Performing Arts Centre': {
    logo: 'https://legendsrak.com/images/logo.png',
    photos: [
      'https://legendsrak.com/images/show-8-2021.png',
      'https://legendsrak.com/images/show-7-2021.png',
      'https://legendsrak.com/images/show-6.png',
    ]
  },
  'Music Zone': {
    logo: 'https://static.wixstatic.com/media/bd48ec_fbef25ba53b24f1190e0b7fabb78ba4b~mv2.jpg',
    photos: [
      'https://static.wixstatic.com/media/bd48ec_9b66001eba554eef9d6c931f26d71470~mv2.jpg',
      'https://static.wixstatic.com/media/bd48ec_a48f3278ec1f47fb997b409e7af517c5~mv2.jpg',
      'https://static.wixstatic.com/media/bd48ec_fbef25ba53b24f1190e0b7fabb78ba4b~mv2.jpg',
    ]
  },
  'Show Squad': {
    logo: 'https://showsquad.club/wp-content/uploads/2023/09/privacy-logo-300x200.png',
    photos: [
      'https://showsquad.club/wp-content/uploads/2023/09/jess-zoerb-mnqQtaC8daI-unsplash-1536x1026.jpg',
      'https://showsquad.club/wp-content/uploads/2023/08/Siobhan-Autograph-1024x186.png',
    ]
  },
  'SK Academy': {
    logo: 'https://skfootballacademy.com/wp-content/uploads/2022/08/logo.svg',
    photos: [
      'https://skfootballacademy.com/wp-content/themes/soccerkidsdubai/dist/image/png/welecome-min.png',
      'https://skfootballacademy.com/wp-content/uploads/2024/07/sk-home-page-image-middle-section-welcome.jpg',
      'https://skfootballacademy.com/wp-content/uploads/2024/07/football_coc.jpg',
    ]
  },
  'UCMAS Ras Al Khaimah - IDEAL WAY EDUCATION': {
    logo: 'http://nebula.wsimg.com/1b34e9993c7fc1f16c574aed788ae548?AccessKeyId=C1B52743CE1B10C1F360&disposition=0&alloworigin=1',
    photos: [
      'https://scontent-lax3-2.xx.fbcdn.net/v/t39.30808-1/450167988_939044334899148_7342850070541213251_n.jpg?stp=cp0_dst-jpg_s50x50_tt6&_nc_cat=103&ccb=1-7&_nc_sid=f907e8&_nc_ohc=1Oszs5ECvdkQ7kNvwHwMirS&_nc_oc=AdlPo-5uGByPJgZMXBloyBEUuKbwAH3Ab566mHKIf0-dfEUjyYvDH17DUI5Ev8APOvY&_nc_zt=24&_nc_ht=scontent-lax3-2.xx&edm=AJEgZhcEAAAA&_nc_gid=YdB6tU2_feOWQ7vdFMHAsg&oh=00_AfwYRUhMToDEHv7MoKCEY2m9QmQwtIMTKEGBQBqtAY0zHw&oe=69B4A2FD',
    ]
  },
};

async function saveBusinessImages() {
  console.log('🖼️  Saving images for businesses\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const [businessName, images] of Object.entries(businessImages)) {
    // Find business
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id')
      .eq('name', businessName)
      .limit(1);
    
    if (!businesses || businesses.length === 0) {
      console.log(`⚠️  ${businessName} - not found in database`);
      errorCount++;
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
    
    if (photoCount > 0 || images.logo) {
      console.log(`   ✅ ${photoCount} photos saved\n`);
      successCount++;
    } else {
      console.log(`   ⚠️  No images to save\n`);
      errorCount++;
    }
  }
  
  console.log(`\n✅ Complete!`);
  console.log(`   ${successCount} businesses updated with images`);
  console.log(`   ${errorCount} businesses had issues`);
}

saveBusinessImages();
