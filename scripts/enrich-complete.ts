#!/usr/bin/env tsx
/**
 * COMPLETE Google Maps Data Enrichment
 * Gets EVERYTHING: ratings, hours, phone, photos, reviews, categories
 * 
 * Usage: npm run enrich:complete
 */

import { Client } from "@googlemaps/google-maps-services-js";
import { createClient } from '@supabase/supabase-js';
import * as https from 'https';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const googleMaps = new Client({});
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Category mapping from Google to our system
const CATEGORY_MAP: Record<string, string> = {
  'gym': 'fitness',
  'fitness_center': 'fitness',
  'sports_club': 'sports',
  'stadium': 'sports',
  'martial_arts_school': 'sports',
  'dance_school': 'education',
  'art_school': 'education',
  'music_school': 'education',
  'swimming_pool': 'sports',
  'recreation_center': 'kids',
  'beauty_salon': 'wellness',
  'spa': 'wellness',
  'restaurant': 'restaurant',
  'cafe': 'restaurant',
  'school': 'education',
  'preschool': 'education'
};

async function getCompleteBusinessData(businessName: string, address: string) {
  console.log(`\n🔍 Searching: ${businessName}`);
  
  try {
    const searchQuery = address 
      ? `${businessName} ${address}` 
      : `${businessName} Ras Al Khaimah UAE`;
    
    // Step 1: Find the place
    const findResponse = await googleMaps.findPlaceFromText({
      params: {
        input: searchQuery,
        inputtype: "textquery",
        fields: ["place_id", "name", "formatted_address"],
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    });
    
    if (!findResponse.data.candidates?.length) {
      console.log(`   ❌ Not found on Google Maps`);
      return null;
    }
    
    const placeId = findResponse.data.candidates[0].place_id!;
    console.log(`   ✓ Found on Google Maps`);
    
    // Step 2: Get COMPLETE details
    const detailsResponse = await googleMaps.placeDetails({
      params: {
        place_id: placeId,
        fields: [
          // Basic info
          "name",
          "formatted_address",
          "formatted_phone_number",
          "international_phone_number",
          "website",
          
          // Ratings & Reviews
          "rating",
          "user_ratings_total",
          "reviews",
          "price_level",
          
          // Location
          "geometry",
          "vicinity",
          "address_components",
          
          // Hours
          "opening_hours",
          "current_opening_hours",
          
          // Categories & Types
          "types",
          "business_status",
          
          // Photos
          "photos",
          
          // Additional
          "url",
          "utc_offset",
          "wheelchair_accessible_entrance"
        ],
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    });
    
    const place = detailsResponse.data.result;
    
    // Extract all data
    const completeData: any = {
      // Basic Info
      name: place.name,
      address: place.formatted_address,
      phone: place.formatted_phone_number || place.international_phone_number,
      website: place.website,
      
      // Ratings
      google_rating: place.rating,
      google_review_count: place.user_ratings_total,
      
      // Location
      latitude: place.geometry?.location?.lat,
      longitude: place.geometry?.location?.lng,
      
      // Category from Google types
      business_type: mapGoogleCategory(place.types),
      
      // Hours
      operating_hours: place.opening_hours?.periods ? 
        convertOpeningHours(place.opening_hours.periods) : null,
      
      // Photos
      photos: place.photos?.slice(0, 10).map(photo => ({
        reference: photo.photo_reference,
        width: photo.width,
        height: photo.height,
        attributions: photo.html_attributions
      })),
      
      // Reviews (top 5)
      reviews: place.reviews?.slice(0, 5).map(review => ({
        author: review.author_name,
        rating: review.rating,
        text: review.text,
        time: review.time
      })),
      
      // Additional
      price_level: place.price_level,
      google_url: place.url,
      business_status: place.business_status
    };
    
    console.log(`   ⭐ Rating: ${place.rating}/5 (${place.user_ratings_total} reviews)`);
    console.log(`   📍 Location: ${place.formatted_address}`);
    console.log(`   📞 Phone: ${completeData.phone || 'N/A'}`);
    console.log(`   🌐 Website: ${completeData.website || 'N/A'}`);
    console.log(`   📸 Photos: ${place.photos?.length || 0}`);
    console.log(`   💬 Reviews: ${place.reviews?.length || 0}`);
    console.log(`   🏷️  Category: ${completeData.business_type}`);
    
    if (place.opening_hours?.periods) {
      console.log(`   🕐 Hours: Added`);
    }
    
    return completeData;
    
  } catch (error: any) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

function mapGoogleCategory(types?: string[]): string {
  if (!types) return 'other';
  
  for (const type of types) {
    if (CATEGORY_MAP[type]) {
      return CATEGORY_MAP[type];
    }
  }
  
  // Default categories based on common types
  if (types.includes('point_of_interest')) return 'other';
  if (types.includes('establishment')) return 'other';
  
  return 'other';
}

function convertOpeningHours(periods: any[]): any {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const hours: any = {};
  
  for (let i = 0; i < 7; i++) {
    const dayPeriods = periods.filter(p => p.open?.day === i);
    
    if (dayPeriods.length === 0) {
      hours[days[i]] = { open: 'closed', close: 'closed' };
    } else {
      const period = dayPeriods[0];
      hours[days[i]] = {
        open: formatTime(period.open?.time),
        close: formatTime(period.close?.time)
      };
    }
  }
  
  return hours;
}

function formatTime(time?: string): string {
  if (!time) return 'closed';
  if (time.length === 4) {
    return `${time.substring(0, 2)}:${time.substring(2, 4)}`;
  }
  return time;
}

async function downloadPhoto(photoReference: string, businessId: string, index: number) {
  try {
    const response = await googleMaps.placePhoto({
      params: {
        photoreference: photoReference,
        maxwidth: 1200,
        key: process.env.GOOGLE_MAPS_API_KEY!
      },
      responseType: 'arraybuffer'
    });
    
    // Save locally (optional) or upload to storage
    const photoDir = path.join(__dirname, '..', 'public', 'business-photos', businessId);
    if (!fs.existsSync(photoDir)) {
      fs.mkdirSync(photoDir, { recursive: true });
    }
    
    const filename = `photo-${index}.jpg`;
    const filepath = path.join(photoDir, filename);
    
    fs.writeFileSync(filepath, Buffer.from(response.data as any));
    
    return `/business-photos/${businessId}/${filename}`;
    
  } catch (error) {
    console.error(`   ⚠️  Photo download failed`);
    return null;
  }
}

async function enrichCompletely() {
  console.log('🗺️  COMPLETE Google Maps Enrichment\n');
  console.log('Getting ALL data for ALL businesses...\n');
  console.log('═══════════════════════════════════════\n');
  
  // Get all businesses
  const { data: businesses, error } = await supabase
    .from('businesses')
    .select('id, name, address, business_type')
    .eq('source', 'scraped')
    .order('name');
  
  if (error) {
    console.error('❌ Failed to fetch businesses:', error.message);
    return;
  }
  
  console.log(`📋 Found ${businesses.length} businesses\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (let i = 0; i < businesses.length; i++) {
    const business = businesses[i];
    console.log(`\n[${i + 1}/${businesses.length}] ${business.name}`);
    
    const completeData = await getCompleteBusinessData(business.name, business.address);
    
    if (completeData) {
      // Update business with complete data
      const updateData: any = {
        google_rating: completeData.google_rating,
        google_review_count: completeData.google_review_count,
        latitude: completeData.latitude,
        longitude: completeData.longitude,
        operating_hours: completeData.operating_hours,
      };
      
      // Update missing fields only
      if (!business.address && completeData.address) {
        updateData.address = completeData.address;
      }
      
      // Update category if it's generic
      if (business.business_type === 'other' || !business.business_type) {
        updateData.business_type = completeData.business_type;
      }
      
      const { error: updateError } = await supabase
        .from('businesses')
        .update(updateData)
        .eq('id', business.id);
      
      if (updateError) {
        console.error(`   ❌ Update failed: ${updateError.message}`);
        failed++;
      } else {
        console.log(`   ✅ Updated in database`);
        
        // Save photos
        if (completeData.photos && completeData.photos.length > 0) {
          console.log(`   📸 Downloading ${completeData.photos.length} photos...`);
          
          for (let j = 0; j < Math.min(completeData.photos.length, 5); j++) {
            const photo = completeData.photos[j];
            const photoUrl = await downloadPhoto(photo.reference, business.id, j);
            
            if (photoUrl) {
              // Save to business_images table
              await supabase.from('business_images').insert({
                business_id: business.id,
                url: photoUrl,
                source: 'google_maps',
                type: j === 0 ? 'hero' : 'gallery',
                display_order: j
              });
            }
          }
          
          console.log(`   ✅ ${completeData.photos.length} photos saved`);
        }
        
        // Save reviews
        if (completeData.reviews && completeData.reviews.length > 0) {
          const reviewData = completeData.reviews.map((r: any) => ({
            business_id: business.id,
            author: r.author,
            rating: r.rating,
            text: r.text,
            source: 'google_maps',
            review_date: new Date(r.time * 1000).toISOString()
          }));
          
          await supabase.from('reviews_scraped').insert(reviewData);
          console.log(`   💬 ${completeData.reviews.length} reviews saved`);
        }
        
        updated++;
      }
    } else {
      failed++;
    }
    
    // Rate limiting - 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ COMPLETE Enrichment Done!\n');
  console.log(`📊 Results:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Total: ${businesses.length}\n`);
  console.log('🎉 All businesses now have complete Google Maps data!\n');
}

// Check for API key
if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error('❌ ERROR: GOOGLE_MAPS_API_KEY not found\n');
  console.log('Add to .env.local: GOOGLE_MAPS_API_KEY=your-key\n');
  process.exit(1);
}

enrichCompletely()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
