#!/usr/bin/env tsx
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function listWebsites() {
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, website')
    .eq('source', 'scraped')
    .not('website', 'is', null)
    .order('name');
  
  console.log(`📊 Businesses with websites: ${businesses?.length || 0}\n`);
  
  businesses?.forEach((b, i) => {
    const url = b.website?.startsWith('http') ? b.website : `https://${b.website}`;
    console.log(`${i + 1}. ${b.name}`);
    console.log(`   ${url}\n`);
  });
  
  console.log('\n💡 Ready to scrape images from all these websites!');
}

listWebsites();
