#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkBusinessTypes() {
  const { data } = await supabase
    .from('businesses')
    .select('business_type')
    .limit(5);
  
  console.log('Existing business_type values:');
  data?.forEach(b => console.log(`- ${b.business_type}`));
}

checkBusinessTypes();
