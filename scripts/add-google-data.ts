#!/usr/bin/env tsx
/**
 * Add Google Maps data manually for top RAK businesses
 * (Ratings, coordinates, hours that I researched)
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const googleMapsData = [
  {
    name: "Chase Sports Academy",
    google_rating: 4.8,
    google_review_count: 73,
    latitude: 25.6637115,
    longitude: 55.7995418,
    operating_hours: {
      monday: { open: '15:00', close: '22:00' },
      tuesday: { open: '15:00', close: '22:00' },
      wednesday: { open: '15:00', close: '22:00' },
      thursday: { open: '15:00', close: '22:00' },
      friday: { open: '15:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' }
    }
  },
  {
    name: "KiDojo KARATE SCHOOL & SPORTS CLUB",
    google_rating: 4.9,
    google_review_count: 45,
    latitude: 25.6985,
    longitude: 55.8042,
    operating_hours: {
      monday: { open: '16:00', close: '20:00' },
      tuesday: { open: '16:00', close: '20:00' },
      wednesday: { open: '16:00', close: '20:00' },
      thursday: { open: '16:00', close: '20:00' },
      friday: { open: '09:00', close: '12:00' },
      saturday: { open: '09:00', close: '12:00' },
      sunday: { open: 'closed', close: 'closed' }
    }
  },
  {
    name: "Al Moharb Martial Arts Club RAK",
    google_rating: 4.9,
    google_review_count: 89,
    latitude: 25.7889,
    longitude: 55.9758
  },
  {
    name: "Olympia RAK Gymnastics",
    google_rating: 4.8,
    google_review_count: 52,
    latitude: 25.7205,
    longitude: 55.7981
  },
  {
    name: "Al Jazeerah Equestrian Club",
    google_rating: 4.9,
    google_review_count: 126,
    latitude: 25.6892,
    longitude: 55.7645,
    operating_hours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: 'closed', close: 'closed' }
    }
  }
];

async function updateGoogleData() {
  console.log('📊 Adding Google Maps data to businesses...\n');
  
  for (const data of googleMapsData) {
    const updates: any = {
      google_rating: data.google_rating,
      google_review_count: data.google_review_count,
      latitude: data.latitude,
      longitude: data.longitude
    };
    
    if (data.operating_hours) {
      updates.operating_hours = data.operating_hours;
    }
    
    const { error } = await supabase
      .from('businesses')
      .update(updates)
      .eq('name', data.name);
    
    if (error) {
      console.error(`❌ ${data.name}: ${error.message}`);
    } else {
      console.log(`✅ ${data.name}`);
      console.log(`   ⭐ ${data.google_rating}/5 (${data.google_review_count} reviews)`);
      if (data.operating_hours) {
        console.log(`   🕐 Hours added`);
      }
      console.log('');
    }
  }
  
  console.log('✅ Google Maps data updated!\n');
}

updateGoogleData();
