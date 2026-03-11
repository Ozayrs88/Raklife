# 🎯 Next Steps - RAKlife Business Scraping

## ✅ What's Been Created

### 1. Database Schema (`ADD-SCRAPING-SCHEMA.sql`)
- ✅ Extended `businesses` table with all scraping fields
- ✅ `business_images` table for photos
- ✅ `services_scraped` table for services
- ✅ `team_members_scraped` table for staff
- ✅ `reviews_scraped` table for Google reviews
- ✅ `faqs_scraped` table for FAQs
- ✅ `scraping_jobs` table for tracking
- ✅ Functions for completeness & ranking scores
- ✅ RLS policies for security

### 2. Scraping System (`lib/scraper.ts`)
- ✅ Complete scraping orchestrator
- ✅ Multi-source scraping (Google Maps, websites, social)
- ✅ Data extraction logic
- ✅ Database save functions
- ✅ Rate limiting
- ✅ Error handling

### 3. Documentation
- ✅ Complete scraping strategy docs
- ✅ Directory-first model explanation
- ✅ Implementation guides

---

## 🚀 Immediate Next Steps

### Step 1: Run Database Migration (5 minutes)

```bash
# Open Supabase SQL Editor
# Run: ADD-SCRAPING-SCHEMA.sql

# This adds:
✓ All scraping fields to businesses
✓ New tables for images, services, team, reviews
✓ Ranking & completeness functions
✓ Indexes for performance
```

### Step 2: Set Up Firecrawl (10 minutes)

```bash
# You already have Firecrawl MCP installed
# Check it's working:

# In your MCP folder:
ls ~/.cursor/projects/Users-ozayrsoge-ZEA-RAKlife/mcps/user-firecrawl

# Verify API key is configured
```

### Step 3: Test Scraping on 1 Business (15 minutes)

```javascript
// Create: business-dashboard/scripts/test-scrape.js

// Test scraping a single business first
const testBusiness = {
  name: "Champions Football Academy",
  googleMapsUrl: "https://www.google.com/maps/place/...",
  website: "https://championsfc.ae"
};

await scrapeAndSaveCompleteBusiness(testBusiness);
```

### Step 4: Scrape 10 Test Businesses (30 minutes)

```bash
# Run the scraper on a small batch
npm run scrape:test

# This will:
- Search Google Maps for 2-3 queries
- Find 10 businesses
- Scrape complete data
- Save to database
- Generate report
```

### Step 5: Review & Verify (15 minutes)

```sql
-- Check what was scraped
SELECT 
  name,
  completeness_score,
  rank_score,
  (SELECT COUNT(*) FROM business_images WHERE business_id = businesses.id) as image_count,
  (SELECT COUNT(*) FROM services_scraped WHERE business_id = businesses.id) as service_count
FROM businesses
WHERE source = 'scraped'
ORDER BY completeness_score DESC;
```

### Step 6: Build Claim Page (1 hour)

Create the business claim flow:

```typescript
// app/claim/[token]/page.tsx

export default async function ClaimBusiness({ params }) {
  const business = await getBusinessByClaimToken(params.token);
  
  return (
    <ClaimBusinessForm 
      business={business}
      // Pre-filled with scraped data
    />
  );
}
```

### Step 7: Full Scrape (2-3 hours)

```bash
# Run full scraping
npm run scrape:all

# This will scrape 200-300 businesses
# Takes 2-3 hours with rate limiting
# Saves everything to database
```

### Step 8: Send Invitations (30 minutes)

```typescript
// Send claim emails to all businesses

const businesses = await getUnclaimedBusinesses();

for (const business of businesses) {
  await sendClaimInvitation({
    businessName: business.name,
    claimUrl: `https://raklife.ae/claim/${business.claim_token}`,
    email: business.email
  });
}
```

---

## 📋 Detailed Implementation Checklist

### Phase 1: Setup (Today - 1 hour)
- [ ] Run ADD-SCRAPING-SCHEMA.sql in Supabase
- [ ] Verify Firecrawl MCP is working
- [ ] Set up scraper.ts file
- [ ] Create test script

### Phase 2: Test Scraping (Today - 2 hours)
- [ ] Manually test 1 business
- [ ] Fix any issues
- [ ] Test batch of 10 businesses
- [ ] Verify data quality
- [ ] Check completeness scores

### Phase 3: Build Claim Flow (Tomorrow - 3 hours)
- [ ] Create `/claim/[token]` page
- [ ] Build ClaimBusinessForm component
- [ ] Add verification (SMS/email code)
- [ ] Create onboarding wizard
- [ ] Test complete claim flow

### Phase 4: Full Scrape (Tomorrow - 3 hours)
- [ ] Run full scraping (200-300 businesses)
- [ ] Monitor for errors
- [ ] Manual review of top 50
- [ ] Fix data quality issues
- [ ] Update completeness scores

### Phase 5: Launch (Day 3 - 2 hours)
- [ ] Build invitation email template
- [ ] Send invitations to all businesses
- [ ] Monitor claim rate
- [ ] Follow up with top 20 by phone
- [ ] Track conversions

---

## 🛠️ Quick Commands

### Run Database Migration
```bash
# In Supabase SQL Editor
Copy contents of: ADD-SCRAPING-SCHEMA.sql
Paste and run
```

### Install Dependencies
```bash
cd business-dashboard
npm install @supabase/supabase-js
```

### Test Scraper
```bash
cd business-dashboard
npx ts-node lib/scraper.ts
```

### Check Scraped Data
```sql
-- In Supabase SQL Editor
SELECT * FROM businesses WHERE source = 'scraped' LIMIT 10;
SELECT * FROM business_images LIMIT 20;
SELECT * FROM services_scraped LIMIT 20;
```

---

## 📊 Success Metrics

### After 1 Week:
- ✅ 200+ businesses scraped
- ✅ 70%+ avg completeness score
- ✅ 15+ images per business
- ✅ 5+ services per business

### After 2 Weeks:
- ✅ 50+ claim invitations sent
- ✅ 20%+ claim rate (10+ businesses)
- ✅ 5+ premium conversions

### After 1 Month:
- ✅ 300+ businesses in directory
- ✅ 50+ claimed businesses
- ✅ 20+ premium active businesses
- ✅ First bookings happening

---

## ⚠️ Important Notes

### Legal Considerations
✅ Scrape only public data (Google Maps, public websites)
✅ Add disclaimer: "Information aggregated from public sources"
✅ Allow businesses to claim and verify/update info
✅ Provide easy way to remove listing if requested
✅ Don't scrape personal customer data or reviews with names

### Data Quality
✅ Manual review of top 50 businesses
✅ Flag low completeness scores (<60) for review
✅ Deduplicate any duplicates found
✅ Verify phone numbers work
✅ Test website links aren't broken

### Rate Limiting
✅ 2-3 seconds between requests
✅ Don't overwhelm any single site
✅ Use polite scraping practices
✅ Respect robots.txt

---

## 🎯 Priority Actions (RIGHT NOW)

1. **Run the SQL migration** (5 min)
   → This sets up all the tables

2. **Test Firecrawl MCP** (10 min)
   → Make sure it's working

3. **Scrape 1 test business** (15 min)
   → Verify the system works

4. **Review and iterate** (30 min)
   → Fix any issues found

---

## 🚀 Ready to Start!

**Current Status:**
✅ Database schema ready
✅ Scraping code written  
✅ Strategy documented
✅ Next steps clear

**What to do NOW:**
1. Run ADD-SCRAPING-SCHEMA.sql in Supabase
2. Test scraping with Firecrawl MCP
3. Scrape first 10 businesses

**I'm ready to help with each step! Let's build this directory! 🔥**
