#!/usr/bin/env tsx
/**
 * Import RAK business data from JSON export
 * Can be used to transfer data to main RAK directory
 * 
 * Usage: npm run import:data <filename>
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function importData(filename: string) {
  console.log('📥 Importing RAK business directory...\n');
  
  try {
    // Read the export file
    const filepath = path.join(__dirname, '..', 'exports', filename);
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`File not found: ${filepath}`);
    }
    
    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    
    console.log('📊 Import file loaded:');
    console.log(`   Exported: ${data.metadata.exported_at}`);
    console.log(`   Businesses: ${data.metadata.total_businesses}`);
    console.log(`   Services: ${data.metadata.total_services}`);
    console.log(`   Version: ${data.metadata.version}\n`);
    
    let imported = 0;
    let skipped = 0;
    let failed = 0;
    
    // Import businesses
    for (const business of data.businesses) {
      // Check if already exists
      const { data: existing } = await supabase
        .from('businesses')
        .select('id')
        .eq('name', business.name)
        .single();
      
      if (existing) {
        console.log(`⏭️  ${business.name} - already exists`);
        skipped++;
        continue;
      }
      
      // Remove id and timestamps for fresh insert
      const { id, created_at, updated_at, ...businessData } = business;
      
      // Insert business
      const { data: newBusiness, error: bizError } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single();
      
      if (bizError) {
        console.error(`❌ ${business.name} - ${bizError.message}`);
        failed++;
        continue;
      }
      
      console.log(`✅ ${business.name} - imported`);
      imported++;
      
      // Import related data
      const oldId = business.id;
      const newId = newBusiness.id;
      
      // Import services
      const relatedServices = data.services.filter((s: any) => s.business_id === oldId);
      if (relatedServices.length > 0) {
        const serviceData = relatedServices.map((s: any) => {
          const { id, created_at, business_id, ...rest } = s;
          return { ...rest, business_id: newId };
        });
        await supabase.from('services_scraped').insert(serviceData);
        console.log(`   📋 ${serviceData.length} services imported`);
      }
      
      // Import images
      const relatedImages = data.images.filter((i: any) => i.business_id === oldId);
      if (relatedImages.length > 0) {
        const imageData = relatedImages.map((i: any) => {
          const { id, created_at, business_id, ...rest } = i;
          return { ...rest, business_id: newId };
        });
        await supabase.from('business_images').insert(imageData);
        console.log(`   📸 ${imageData.length} images imported`);
      }
      
      // Import team members
      const relatedTeam = data.team_members.filter((t: any) => t.business_id === oldId);
      if (relatedTeam.length > 0) {
        const teamData = relatedTeam.map((t: any) => {
          const { id, created_at, business_id, ...rest } = t;
          return { ...rest, business_id: newId };
        });
        await supabase.from('team_members_scraped').insert(teamData);
        console.log(`   👥 ${teamData.length} team members imported`);
      }
      
      // Import FAQs
      const relatedFaqs = data.faqs.filter((f: any) => f.business_id === oldId);
      if (relatedFaqs.length > 0) {
        const faqData = relatedFaqs.map((f: any) => {
          const { id, created_at, business_id, ...rest } = f;
          return { ...rest, business_id: newId };
        });
        await supabase.from('faqs_scraped').insert(faqData);
        console.log(`   ❓ ${faqData.length} FAQs imported`);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ Import Complete!\n');
    console.log('📊 Results:');
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   Total: ${data.businesses.length}\n`);
    
  } catch (error: any) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Get filename from command line
const filename = process.argv[2];

if (!filename) {
  console.error('❌ Please provide a filename');
  console.log('\nUsage: npm run import:data <filename>');
  console.log('Example: npm run import:data rak-directory-export-2026-03-09.json\n');
  process.exit(1);
}

importData(filename);
