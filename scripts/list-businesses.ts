#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('source', 'scraped')
    .order('name');

  data?.forEach((b, i) => console.log(`${i+1}. ${b.name} (ID: ${b.id})`));
}

main();
