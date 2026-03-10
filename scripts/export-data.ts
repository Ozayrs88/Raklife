#!/usr/bin/env tsx
/**
 * Export complete RAK business data to JSON
 * Perfect for transferring to main RAK directory or backup
 * 
 * Usage: npm run export:data
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

interface ExportData {
  metadata: {
    exported_at: string;
    total_businesses: number;
    total_services: number;
    categories: string[];
    version: string;
  };
  businesses: any[];
  services: any[];
  images: any[];
  team_members: any[];
  faqs: any[];
}

async function exportAllData() {
  console.log('📦 Exporting complete RAK business directory...\n');
  
  try {
    // Fetch all businesses
    const { data: businesses, error: bizError } = await supabase
      .from('businesses')
      .select('*')
      .eq('source', 'scraped')
      .order('google_rating', { ascending: false });
    
    if (bizError) throw bizError;
    
    console.log(`✅ Exported ${businesses.length} businesses`);
    
    // Fetch all services
    const { data: services, error: svcError } = await supabase
      .from('services_scraped')
      .select('*');
    
    if (svcError) throw svcError;
    
    console.log(`✅ Exported ${services?.length || 0} services`);
    
    // Fetch all images
    const { data: images, error: imgError } = await supabase
      .from('business_images')
      .select('*');
    
    if (imgError) throw imgError;
    
    console.log(`✅ Exported ${images?.length || 0} images`);
    
    // Fetch all team members
    const { data: team, error: teamError } = await supabase
      .from('team_members_scraped')
      .select('*');
    
    if (teamError) throw teamError;
    
    console.log(`✅ Exported ${team?.length || 0} team members`);
    
    // Fetch all FAQs
    const { data: faqs, error: faqError } = await supabase
      .from('faqs_scraped')
      .select('*');
    
    if (faqError) throw faqError;
    
    console.log(`✅ Exported ${faqs?.length || 0} FAQs`);
    
    // Get unique categories
    const categories = [...new Set(businesses.map(b => b.business_type))];
    
    // Create export data structure
    const exportData: ExportData = {
      metadata: {
        exported_at: new Date().toISOString(),
        total_businesses: businesses.length,
        total_services: services?.length || 0,
        categories: categories,
        version: '1.0'
      },
      businesses: businesses,
      services: services || [],
      images: images || [],
      team_members: team || [],
      faqs: faqs || []
    };
    
    // Save to JSON file
    const filename = `rak-directory-export-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(__dirname, '..', 'exports', filename);
    
    // Create exports directory if it doesn't exist
    const exportsDir = path.join(__dirname, '..', 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }
    
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));
    
    console.log('\n═══════════════════════════════════════');
    console.log('✅ Export Complete!\n');
    console.log('📊 Summary:');
    console.log(`   Businesses: ${exportData.metadata.total_businesses}`);
    console.log(`   Services: ${exportData.metadata.total_services}`);
    console.log(`   Images: ${exportData.images.length}`);
    console.log(`   Team Members: ${exportData.team_members.length}`);
    console.log(`   FAQs: ${exportData.faqs.length}`);
    console.log(`   Categories: ${categories.join(', ')}`);
    console.log(`\n📁 Saved to: ${filepath}`);
    console.log(`   Size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB\n`);
    
    // Also create a CSV export for easy viewing
    await exportToCSV(businesses, exportsDir);
    
  } catch (error: any) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

async function exportToCSV(businesses: any[], exportsDir: string) {
  const filename = `rak-businesses-${new Date().toISOString().split('T')[0]}.csv`;
  const filepath = path.join(exportsDir, filename);
  
  // Create CSV header
  const headers = [
    'Name',
    'Category',
    'Rating',
    'Reviews',
    'Phone',
    'Email',
    'Website',
    'Address',
    'Instagram',
    'Facebook',
    'Claimed',
    'Type'
  ];
  
  // Create CSV rows
  const rows = businesses.map(b => [
    `"${b.name || ''}"`,
    b.business_type || '',
    b.google_rating || '',
    b.google_review_count || '',
    b.phone || '',
    b.email || '',
    b.website || '',
    `"${b.address || ''}"`,
    b.instagram_url || '',
    b.facebook_url || '',
    b.is_claimed ? 'Yes' : 'No',
    b.listing_type || 'basic'
  ]);
  
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  
  fs.writeFileSync(filepath, csv);
  console.log(`📊 CSV exported: ${filename}`);
}

exportAllData();
