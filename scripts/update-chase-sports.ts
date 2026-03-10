#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function updateChase() {
  console.log('🔄 Updating Chase Sports Academy with complete details...\n');
  
  const { data: business, error } = await supabase
    .from('businesses')
    .update({
      address: 'Al Hamra Industrial Area Wearhouse WIZ 1/014, Ras Al Khaimah, UAE',
      phone: '+971 58 6610334',
      email: 'info@csprak.com',
      facebook_url: 'https://www.facebook.com/ChaseSports.RAK/',
      instagram_url: 'https://www.instagram.com/chase.rak/',
      description: 'The Chase Sports Academy is a community where people of all ages are welcome to take part in their favourite sports, be a part of a team and meet others with the same ambitions and energy. We offer Basketball, Volleyball, Gymnastics, Kickboxing, Taekwondo, CrossFit for Kids, Jiu-jitsu, Thai-Boxing, ChaseFit, and more.'
    })
    .eq('name', 'Chase Sports Academy')
    .select();
  
  if (error) {
    console.error('❌ Error:', error.message);
    return;
  }
  
  console.log('✅ Chase Sports Academy updated!');
  console.log('📋 Details:');
  console.log('   Address: Al Hamra Industrial Area, RAK');
  console.log('   Phone: +971 58 6610334');
  console.log('   Email: info@csprak.com');
  console.log('   WhatsApp: +971 58 6610334');
  console.log('   Instagram: @chase.rak');
  console.log('   Facebook: ChaseSports.RAK\n');
}

updateChase();
