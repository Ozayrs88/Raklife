/**
 * RAKlife Business Scraper
 * 
 * Complete scraping system using Firecrawl MCP to build business directory
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key for admin access
);

// Categories to scrape
const SCRAPING_TARGETS = [
  {
    category: 'sports',
    searches: [
      'football academy ras al khaimah',
      'swimming school ras al khaimah',
      'gymnastics rak',
      'martial arts rak',
      'tennis academy rak',
      'basketball training rak'
    ]
  },
  {
    category: 'fitness',
    searches: [
      'gym ras al khaimah',
      'fitness studio rak',
      'yoga studio rak',
      'crossfit rak',
      'pilates rak'
    ]
  },
  {
    category: 'education',
    searches: [
      'tutoring center rak',
      'language school rak',
      'music school rak',
      'art classes rak'
    ]
  },
  {
    category: 'wellness',
    searches: [
      'spa ras al khaimah',
      'massage center rak',
      'salon rak',
      'beauty center rak'
    ]
  },
  {
    category: 'kids',
    searches: [
      'kids activities rak',
      'dance studio kids rak',
      'play center rak',
      'nursery rak'
    ]
  }
];

/**
 * Main scraping orchestrator
 */
export async function scrapeAllBusinesses() {
  console.log('🚀 Starting complete business scraping...\n');
  
  let totalScraped = 0;
  
  for (const target of SCRAPING_TARGETS) {
    console.log(`\n📂 Category: ${target.category}`);
    console.log(`   Searches: ${target.searches.length}\n`);
    
    for (const search of target.searches) {
      console.log(`\n🔍 Searching: "${search}"`);
      
      try {
        const businesses = await scrapeGoogleMapsSearch(search, target.category);
        console.log(`   Found ${businesses.length} businesses`);
        
        for (const business of businesses) {
          try {
            await scrapeAndSaveCompleteBusiness(business);
            totalScraped++;
            console.log(`   ✓ Scraped: ${business.name}`);
          } catch (error) {
            console.error(`   ✗ Failed: ${business.name}`, error);
          }
          
          // Rate limiting - wait 2 seconds between businesses
          await sleep(2000);
        }
      } catch (error) {
        console.error(`   ✗ Search failed: ${search}`, error);
      }
    }
  }
  
  console.log(`\n\n✅ Scraping complete! Total businesses: ${totalScraped}`);
  
  return { totalScraped };
}

/**
 * Scrape Google Maps search results
 */
async function scrapeGoogleMapsSearch(query: string, category: string) {
  // In real implementation, use Firecrawl MCP to scrape Google Maps
  // For now, return mock structure
  
  const searchUrl = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
  
  // TODO: Use Firecrawl MCP tool to scrape
  // const result = await callMcpTool('user-firecrawl', 'scrape', {
  //   url: searchUrl,
  //   formats: ['markdown', 'html']
  // });
  
  // Extract business listings from results
  // Parse HTML to find business cards
  
  // Mock response for now
  return [
    {
      name: 'Example Business',
      googleMapsUrl: 'https://maps.google.com/...',
      category: category
    }
  ];
}

/**
 * Scrape complete business data from all sources
 */
async function scrapeAndSaveCompleteBusiness(basicInfo: any) {
  const business: any = {
    source: 'scraped',
    scraped_at: new Date().toISOString(),
    ...basicInfo
  };
  
  // Step 1: Scrape Google Maps profile
  const mapsData = await scrapeGoogleMapsProfile(business.googleMapsUrl);
  Object.assign(business, mapsData);
  
  // Step 2: Scrape business website
  if (business.website) {
    const websiteData = await scrapeBusinessWebsite(business.website);
    Object.assign(business, websiteData);
  }
  
  // Step 3: Scrape social media
  if (business.instagram_url) {
    const instaData = await scrapeInstagram(business.instagram_url);
    business.instagram_followers = instaData.followers;
    // Add Instagram photos to gallery
  }
  
  // Step 4: Generate slug
  business.slug = generateSlug(business.name);
  
  // Step 5: Save to database
  await saveBusiness(business);
  
  return business;
}

/**
 * Scrape Google Maps business profile
 */
async function scrapeGoogleMapsProfile(url: string) {
  // TODO: Use Firecrawl MCP
  
  return {
    name: 'Business Name',
    address: 'Full Address, RAK',
    phone: '+971 7 xxx xxxx',
    website: 'https://...',
    google_rating: 4.8,
    google_review_count: 127,
    latitude: 25.7889,
    longitude: 55.9758,
    operating_hours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '09:00', close: '14:00' },
      sunday: { open: 'closed', close: 'closed' }
    },
    images: [
      // Array of image URLs from Google Maps
    ]
  };
}

/**
 * Scrape complete business website
 */
async function scrapeBusinessWebsite(websiteUrl: string) {
  // TODO: First, map all pages using Firecrawl
  // const map = await callMcpTool('user-firecrawl', 'map', { url: websiteUrl });
  
  // Then scrape relevant pages
  const pages = [
    websiteUrl, // Homepage
    `${websiteUrl}/about`,
    `${websiteUrl}/services`,
    `${websiteUrl}/classes`,
    `${websiteUrl}/pricing`,
    `${websiteUrl}/contact`,
    `${websiteUrl}/team`,
    `${websiteUrl}/gallery`
  ];
  
  const data: any = {
    description: '',
    services: [],
    team: [],
    images: [],
    faqs: []
  };
  
  for (const pageUrl of pages) {
    try {
      // TODO: Scrape each page
      // const result = await callMcpTool('user-firecrawl', 'scrape', {
      //   url: pageUrl,
      //   formats: ['markdown', 'html']
      // });
      
      // Extract relevant data based on page
    } catch (error) {
      // Page doesn't exist, skip
    }
  }
  
  return data;
}

/**
 * Scrape Instagram profile
 */
async function scrapeInstagram(instagramUrl: string) {
  // TODO: Use Firecrawl to scrape Instagram
  
  return {
    followers: 1234,
    posts: [
      // Array of recent posts
    ]
  };
}

/**
 * Save business to database
 */
async function saveBusiness(business: any) {
  // Check if business already exists
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('name', business.name)
    .eq('address', business.address)
    .single();
  
  if (existing) {
    console.log(`   ⚠️  Business already exists, skipping`);
    return existing.id;
  }
  
  // Insert business
  const { data: newBusiness, error: bizError } = await supabase
    .from('businesses')
    .insert({
      slug: business.slug,
      name: business.name,
      business_type: business.category,
      description: business.description,
      address: business.address,
      phone: business.phone,
      email: business.email,
      website: business.website,
      source: 'scraped',
      scraped_at: new Date().toISOString(),
      google_rating: business.google_rating,
      google_review_count: business.google_review_count,
      latitude: business.latitude,
      longitude: business.longitude,
      operating_hours: business.operating_hours,
      instagram_url: business.instagram_url,
      facebook_url: business.facebook_url,
      instagram_followers: business.instagram_followers,
      tagline: business.tagline,
      about: business.about,
      amenities: business.amenities,
      listing_type: 'basic',
      is_claimed: false
    })
    .select()
    .single();
  
  if (bizError) {
    throw new Error(`Failed to insert business: ${bizError.message}`);
  }
  
  const businessId = newBusiness.id;
  
  // Save images
  if (business.images && business.images.length > 0) {
    const imageData = business.images.map((img: any, index: number) => ({
      business_id: businessId,
      url: img.url,
      source: img.source || 'website',
      type: img.type || 'gallery',
      display_order: index
    }));
    
    await supabase.from('business_images').insert(imageData);
  }
  
  // Save services
  if (business.services && business.services.length > 0) {
    const serviceData = business.services.map((service: any) => ({
      business_id: businessId,
      name: service.name,
      description: service.description,
      price_from: service.price_from,
      duration_text: service.duration,
      source: 'website'
    }));
    
    await supabase.from('services_scraped').insert(serviceData);
  }
  
  // Save team members
  if (business.team && business.team.length > 0) {
    const teamData = business.team.map((member: any, index: number) => ({
      business_id: businessId,
      name: member.name,
      role: member.role,
      bio: member.bio,
      photo_url: member.photo,
      display_order: index
    }));
    
    await supabase.from('team_members_scraped').insert(teamData);
  }
  
  // Save FAQs
  if (business.faqs && business.faqs.length > 0) {
    const faqData = business.faqs.map((faq: any, index: number) => ({
      business_id: businessId,
      question: faq.question,
      answer: faq.answer,
      display_order: index
    }));
    
    await supabase.from('faqs_scraped').insert(faqData);
  }
  
  return businessId;
}

/**
 * Generate URL-friendly slug
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    + '-' + Math.random().toString(36).substring(2, 8);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Run if called directly
if (require.main === module) {
  scrapeAllBusinesses()
    .then(result => {
      console.log('\n✅ Done!', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Error:', error);
      process.exit(1);
    });
}
