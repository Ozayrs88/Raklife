#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

console.log('ENV check:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...');
console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'MISSING');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function test() {
  const { data, error, count } = await supabase
    .from('businesses')
    .select('id, name', { count: 'exact' })
    .eq('name', 'Chase Sports Academy');
  
  console.log('\nQuery result:');
  console.log('Count:', count);
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
