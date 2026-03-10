#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  // Test exact match for one business
  const testName = 'Chase Sports Academy';
  
  console.log(`Testing exact match for: "${testName}"\n`);
  
  const { data, error } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('name', testName);
  
  console.log('Result:', data);
  console.log('Error:', error);
  
  // Try case-insensitive
  const { data: data2 } = await supabase
    .from('businesses')
    .select('id, name')
    .ilike('name', testName);
  
  console.log('\nCase-insensitive result:', data2);
  
  // List all to compare
  const { data: all } = await supabase
    .from('businesses')
    .select('name')
    .eq('source', 'scraped')
    .order('name');
  
  console.log('\nAll business names:');
  all?.forEach(b => console.log(`- "${b.name}"`));
}

test();
