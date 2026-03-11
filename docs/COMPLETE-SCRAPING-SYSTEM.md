# 🔥 Complete Business Scraping System

## Goal: Scrape 100% of Available Data

Create the most complete business profiles possible so when they claim their listing, it's basically ready to go live.

---

## 📊 Complete Data Specification

### What We'll Scrape:

```javascript
Business Profile (100% Complete):
├─ Basic Info
│  ├─ Business name
│  ├─ Address (full)
│  ├─ Phone number(s)
│  ├─ Email address
│  ├─ Website URL
│  └─ Social media links
│
├─ Descriptions
│  ├─ Short tagline (1 sentence)
│  ├─ Full description (from website)
│  ├─ About/History
│  └─ Mission/Values
│
├─ Categories & Tags
│  ├─ Primary category
│  ├─ Subcategories
│  ├─ Keywords/tags
│  └─ Age groups served
│
├─ Media
│  ├─ Logo (high-res)
│  ├─ Cover photo
│  ├─ Gallery (15-20 photos)
│  ├─ Video URLs
│  └─ Virtual tour link
│
├─ Services
│  ├─ Service names
│  ├─ Service descriptions
│  ├─ Pricing (if available)
│  ├─ Duration
│  └─ Age/skill requirements
│
├─ Schedule/Hours
│  ├─ Operating hours
│  ├─ Class schedules (if available)
│  ├─ Seasonal info
│  └─ Holidays/closures
│
├─ Team
│  ├─ Coaches/instructors
│  ├─ Staff photos
│  ├─ Credentials
│  └─ Bios
│
├─ Facilities
│  ├─ Amenities list
│  ├─ Equipment
│  ├─ Parking info
│  └─ Accessibility
│
├─ Reviews & Social Proof
│  ├─ Google rating
│  ├─ Number of reviews
│  ├─ Recent reviews
│  ├─ Instagram followers
│  └─ Facebook likes
│
└─ Additional
   ├─ FAQ items
   ├─ Policies (cancellation, etc.)
   ├─ Payment methods accepted
   └─ Registration process
```

---

## 🎯 Multi-Source Scraping Strategy

### Source 1: Google Maps/Places API
```javascript
Primary data source - most reliable

Scrape:
✓ Name, address, phone
✓ Category
✓ Operating hours
✓ Rating (4.8)
✓ Review count (127)
✓ Recent reviews
✓ Website URL
✓ 3-5 photos from profile
✓ Location coordinates
✓ User-submitted photos (10-20)
```

### Source 2: Business Website
```javascript
Main content source - richest data

Scrape:
✓ Full description
✓ Services list with details
✓ Pricing tables
✓ Class schedules
✓ Team bios
✓ Photo gallery (10-30 photos)
✓ Logo (high-res)
✓ Contact forms
✓ Social media links
✓ FAQs
✓ Policies
✓ About page content
```

### Source 3: Social Media
```javascript
Instagram/Facebook - visual content

Scrape:
✓ Bio/description
✓ Follower count
✓ Recent posts (10-20 photos)
✓ Stories highlights
✓ Contact info
✓ Business hours
✓ Reviews/ratings
```

### Source 4: Review Sites
```javascript
TripAdvisor, Zomato, etc.

Scrape:
✓ Additional reviews
✓ Photos from customers
✓ Business responses
✓ Awards/badges
```

---

## 🚀 Implementation with Firecrawl MCP

### Setup Firecrawl Access

```javascript
// Check available Firecrawl tools
const firecrawlTools = await listMcpTools('user-firecrawl');

// Available tools:
// - scrape: Scrape a single URL
// - crawl: Crawl entire website
// - map: Get all URLs from a site
```

### Master Scraping Script

```javascript
// scrape-complete-business.js

async function scrapeCompleteBusiness(googleMapsUrl) {
  const business = {};
  
  // STEP 1: Google Maps Data
  console.log('📍 Scraping Google Maps...');
  const mapsData = await scrapeGoogleMaps(googleMapsUrl);
  Object.assign(business, mapsData);
  
  // STEP 2: Website Data
  if (business.website) {
    console.log('🌐 Scraping website...');
    const websiteData = await scrapeWebsite(business.website);
    Object.assign(business, websiteData);
  }
  
  // STEP 3: Social Media
  if (business.socialMedia) {
    console.log('📱 Scraping Instagram...');
    const instagramData = await scrapeInstagram(business.socialMedia.instagram);
    business.instagram = instagramData;
  }
  
  // STEP 4: Extract Services
  console.log('🎯 Extracting services...');
  business.services = extractServices(business);
  
  // STEP 5: Download & Store Images
  console.log('📸 Downloading images...');
  business.images = await downloadImages(business);
  
  return business;
}

// Scrape Google Maps listing
async function scrapeGoogleMaps(url) {
  const result = await callMcpTool('user-firecrawl', 'scrape', {
    url: url,
    formats: ['markdown', 'html'],
    onlyMainContent: false
  });
  
  return {
    name: extractBusinessName(result),
    address: extractAddress(result),
    phone: extractPhone(result),
    website: extractWebsite(result),
    category: extractCategory(result),
    rating: extractRating(result),
    reviewCount: extractReviewCount(result),
    hours: extractHours(result),
    coordinates: extractCoordinates(result),
    googlePhotos: extractPhotos(result)
  };
}

// Scrape complete website
async function scrapeWebsite(websiteUrl) {
  // First, map all pages
  const map = await callMcpTool('user-firecrawl', 'map', {
    url: websiteUrl
  });
  
  const pages = map.links.filter(link => 
    link.includes('/about') ||
    link.includes('/services') ||
    link.includes('/classes') ||
    link.includes('/pricing') ||
    link.includes('/contact') ||
    link.includes('/team') ||
    link.includes('/gallery')
  );
  
  // Scrape each relevant page
  const data = {};
  
  for (const pageUrl of pages) {
    console.log(`  Scraping ${pageUrl}...`);
    const result = await callMcpTool('user-firecrawl', 'scrape', {
      url: pageUrl,
      formats: ['markdown', 'html'],
      onlyMainContent: true
    });
    
    // Extract data based on page type
    if (pageUrl.includes('about')) {
      data.description = extractDescription(result);
      data.history = extractHistory(result);
      data.mission = extractMission(result);
    }
    
    if (pageUrl.includes('services') || pageUrl.includes('classes')) {
      data.services = extractServices(result);
      data.pricing = extractPricing(result);
    }
    
    if (pageUrl.includes('team')) {
      data.team = extractTeam(result);
    }
    
    if (pageUrl.includes('gallery')) {
      data.galleryPhotos = extractPhotos(result);
    }
    
    if (pageUrl.includes('contact')) {
      data.email = extractEmail(result);
      data.socialMedia = extractSocialLinks(result);
    }
  }
  
  // Also scrape homepage
  const homepage = await callMcpTool('user-firecrawl', 'scrape', {
    url: websiteUrl,
    formats: ['markdown', 'html']
  });
  
  data.tagline = extractTagline(homepage);
  data.logo = extractLogo(homepage);
  data.coverPhoto = extractCoverPhoto(homepage);
  
  return data;
}

// Extract services from scraped content
function extractServices(data) {
  const services = [];
  
  // Look for common patterns
  const servicePatterns = [
    /(?:classes?|programs?|courses?|training):?\s*(.+)/gi,
    /(\w+\s+(?:class|program|course|training))\s*[-–]\s*AED\s*(\d+)/gi,
  ];
  
  // Extract from markdown content
  const content = data.markdown || data.html;
  
  // Find pricing tables
  const priceRegex = /\|\s*(.+?)\s*\|\s*AED\s*(\d+)/g;
  let match;
  
  while ((match = priceRegex.exec(content)) !== null) {
    services.push({
      name: match[1].trim(),
      price: parseInt(match[2]),
      currency: 'AED'
    });
  }
  
  return services;
}

// Download images to storage
async function downloadImages(business) {
  const allImages = [
    ...business.googlePhotos || [],
    ...business.galleryPhotos || [],
    business.logo,
    business.coverPhoto
  ].filter(Boolean);
  
  const downloaded = [];
  
  for (const imageUrl of allImages) {
    try {
      // Download image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const filename = `${business.slug}/${Date.now()}-${Math.random()}.jpg`;
      const { data, error } = await supabase.storage
        .from('business-images')
        .upload(filename, blob);
      
      if (!error) {
        downloaded.push({
          url: data.path,
          source: imageUrl.includes('google') ? 'google' : 'website'
        });
      }
    } catch (err) {
      console.error('Failed to download:', imageUrl);
    }
  }
  
  return downloaded;
}
```

---

## 📦 Complete Database Schema

```sql
-- Main business table with ALL scraped data
CREATE TABLE businesses_scraped (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Basic Info
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  address TEXT,
  city TEXT DEFAULT 'Ras Al Khaimah',
  country TEXT DEFAULT 'UAE',
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Descriptions
  tagline TEXT,
  description TEXT,
  about TEXT,
  history TEXT,
  mission TEXT,
  
  -- Category
  category TEXT,
  subcategories TEXT[],
  tags TEXT[],
  age_groups TEXT[],
  
  -- Hours
  operating_hours JSONB,
  seasonal_info TEXT,
  
  -- Social Proof
  google_rating DECIMAL(2,1),
  google_review_count INTEGER,
  instagram_followers INTEGER,
  facebook_likes INTEGER,
  
  -- Media
  logo_url TEXT,
  cover_photo_url TEXT,
  video_urls TEXT[],
  virtual_tour_url TEXT,
  
  -- Facilities
  amenities TEXT[],
  equipment TEXT[],
  parking_info TEXT,
  accessibility_info TEXT,
  
  -- Payment & Policies
  payment_methods TEXT[],
  cancellation_policy TEXT,
  registration_process TEXT,
  
  -- Coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Social Media
  instagram_url TEXT,
  facebook_url TEXT,
  twitter_url TEXT,
  tiktok_url TEXT,
  youtube_url TEXT,
  
  -- Metadata
  source TEXT, -- 'google_maps', 'scraped', etc.
  scraped_at TIMESTAMP DEFAULT NOW(),
  last_updated TIMESTAMP DEFAULT NOW(),
  is_claimed BOOLEAN DEFAULT false,
  claim_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  
  -- For ranking
  listing_type TEXT DEFAULT 'basic',
  rank_score INTEGER DEFAULT 10,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scraped services
CREATE TABLE services_scraped (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses_scraped(id),
  name TEXT NOT NULL,
  description TEXT,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  currency TEXT DEFAULT 'AED',
  duration_minutes INTEGER,
  age_min INTEGER,
  age_max INTEGER,
  skill_level TEXT,
  schedule_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scraped images
CREATE TABLE images_scraped (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses_scraped(id),
  url TEXT NOT NULL,
  source TEXT, -- 'google', 'website', 'instagram'
  type TEXT, -- 'logo', 'cover', 'gallery', 'team'
  alt_text TEXT,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scraped team members
CREATE TABLE team_scraped (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses_scraped(id),
  name TEXT,
  role TEXT,
  bio TEXT,
  photo_url TEXT,
  credentials TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scraped reviews (from Google)
CREATE TABLE reviews_scraped (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses_scraped(id),
  author_name TEXT,
  rating INTEGER,
  text TEXT,
  date DATE,
  source TEXT DEFAULT 'google',
  created_at TIMESTAMP DEFAULT NOW()
);

-- FAQs
CREATE TABLE faqs_scraped (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses_scraped(id),
  question TEXT,
  answer TEXT,
  display_order INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 Complete Scraping Workflow

### Step 1: Prepare Target List

```javascript
// targets.json
const targets = [
  {
    category: 'Sports Academy',
    searches: [
      'football academy ras al khaimah',
      'swimming school rak',
      'gymnastics rak',
      'martial arts rak'
    ]
  },
  {
    category: 'Dance & Music',
    searches: [
      'dance studio rak',
      'music school rak',
      'piano lessons rak'
    ]
  },
  // ... more categories
];
```

### Step 2: Scrape Google Maps

```javascript
// Find businesses for each search
for (const category of targets) {
  for (const search of category.searches) {
    const results = await scrapeGoogleMapsSearch(search);
    
    for (const result of results) {
      // Extract Google Maps URL
      const mapsUrl = result.url;
      
      // Scrape complete business
      const business = await scrapeCompleteBusiness(mapsUrl);
      
      // Save to database
      await saveBusinessToDatabase(business);
      
      console.log(`✓ Scraped: ${business.name}`);
    }
  }
}
```

### Step 3: Process & Clean

```javascript
// Clean and enhance data
async function processScrapedData(businessId) {
  const business = await getScrapedBusiness(businessId);
  
  // Clean phone numbers
  business.phone = cleanPhoneNumber(business.phone);
  
  // Generate slug
  business.slug = generateSlug(business.name);
  
  // Categorize properly
  business.category = mapToStandardCategory(business.category);
  
  // Extract age groups from text
  business.age_groups = extractAgeGroups(business.description);
  
  // Deduplicate images
  business.images = deduplicateImages(business.images);
  
  // Update database
  await updateBusiness(businessId, business);
}
```

### Step 4: Quality Check

```javascript
// Score completeness
function calculateCompletenessScore(business) {
  let score = 0;
  
  if (business.name) score += 5;
  if (business.address) score += 5;
  if (business.phone) score += 5;
  if (business.website) score += 5;
  if (business.description && business.description.length > 100) score += 10;
  if (business.images && business.images.length >= 5) score += 15;
  if (business.services && business.services.length > 0) score += 15;
  if (business.operating_hours) score += 10;
  if (business.google_rating) score += 10;
  if (business.email) score += 5;
  if (business.social_media) score += 5;
  if (business.team && business.team.length > 0) score += 10;
  
  return score; // 0-100
}

// Flag for manual review if < 60
const needsReview = businesses.filter(b => 
  calculateCompletenessScore(b) < 60
);
```

---

## 📧 Invitation Email (With Screenshots)

```html
Subject: Champions FC - You're already on RAKlife! 🎉

Hi Champions Football Academy,

Great news! Your business is now featured on RAKlife, 
Ras Al Khaimah's fastest-growing lifestyle platform.

We've already done the work for you:

✅ Complete profile with description
✅ 12 photos from your website & Google
✅ All your services listed
✅ Your Google reviews (4.8★ from 127 reviews)
✅ Contact info & hours
✅ Team member profiles

[PREVIEW YOUR LISTING] 👀

Current Status: 
📊 327 profile views this month
🔍 Showing in search results
⚠️ But customers can't book you online yet!

UPGRADE TO INSTANT BOOKINGS:
✓ Accept bookings 24/7
✓ Rank #1 in searches
✓ Payment processing
✓ Customer dashboard
✓ FREE for 3 months

[CLAIM YOUR LISTING - 2 Minutes] →

P.S. Your competitors are already accepting online 
bookings. Don't get left behind!
```

---

## 🎯 Expected Results

### Per Business Scraped:
```
Basic Info: 100% complete
- Name ✓
- Address ✓  
- Phone ✓
- Email ✓ (80%)
- Website ✓ (90%)

Content: 80% complete
- Description ✓
- Services ✓ (70%)
- Prices ✓ (40%)
- Hours ✓

Media: 90% complete
- Logo ✓
- Cover photo ✓
- Gallery: 12-18 photos ✓

Social Proof: 100% complete
- Google rating ✓
- Review count ✓
- Recent reviews ✓

Team: 40% complete
- Staff names ✓ (sometimes)
- Bios ✓ (rare)

Additional: 30% complete
- FAQs ✓ (sometimes)
- Policies ✓ (sometimes)
```

### Overall Stats:
```
Target: 200-300 businesses
Scraping success rate: 90%+
Average completeness: 70-80%
Photos per business: 12-18
Services per business: 3-8
Time per business: 2-3 minutes

Total time: 10-15 hours automated
```

---

## 🚀 Ready to Start?

I can build:
1. ✅ Complete Firecrawl scraping system
2. ✅ Database schema for all data
3. ✅ Import/processing scripts
4. ✅ Quality checking system
5. ✅ Deduplication logic
6. ✅ Image downloading & storage
7. ✅ Business claim flow with pre-filled data

**Let's scrape it ALL! 🔥**
