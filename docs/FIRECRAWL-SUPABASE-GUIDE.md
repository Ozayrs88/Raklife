# 🎯 Firecrawl + Supabase Integration - Complete Guide

## ✅ What's Working Now

### 1. Setup Complete
- ✅ Firecrawl MCP configured and running
- ✅ Supabase connection working
- ✅ Database schema ready for scraping
- ✅ Test business successfully saved
- ✅ Real business scraped (Juventus Academy RAK)

### 2. The Complete Flow

```
🔍 Firecrawl Search
    ↓
📄 Find RAK Businesses
    ↓
🌐 Firecrawl Scrape (detailed data)
    ↓
💾 Save to Supabase
    ↓
🤖 Auto-calculate scores (trigger)
    ↓
✅ Business in directory!
```

---

## 🚀 How to Use It

### Quick Commands

```bash
# Test the connection
npm run scrape:demo

# Search and list kids activities
npm run scrape:kids

# Full automated scraping (when ready)
npm run scrape:kids-auto
```

---

## 📝 Manual Scraping Process (For Now)

Since you're using Cursor AI with Firecrawl MCP, here's the workflow:

### Step 1: Search for Businesses

Ask me in chat:
```
"Search Firecrawl for karate classes kids in Ras Al Khaimah"
```

I'll call Firecrawl and show you the results with URLs.

### Step 2: Scrape a Business

Pick a URL and ask:
```
"Scrape this URL with Firecrawl: https://business-website.com"
```

I'll extract all the business details (name, contact, services, etc.)

### Step 3: Save to Supabase

Then say:
```
"Save that business to Supabase"
```

I'll insert it into your database, and the trigger will auto-calculate scores!

---

## 🤖 Semi-Automated Process

You can also batch process:

```
"Search and scrape the top 5 karate academies in RAK, then save them all to Supabase"
```

I'll:
1. Search Firecrawl
2. Scrape each result
3. Save all to Supabase
4. Show you a summary

---

## 🎯 Target Categories

### Current Focus: Kids Activities

- ⚽ Football academies
- 🥋 Martial arts (karate, taekwondo, judo, kung fu)
- 🏊 Swimming lessons
- 🏀 Basketball training
- 🎾 Tennis academies
- 💃 Dance studios (ballet, hip hop)
- 🤸 Gymnastics
- 🎨 Art classes
- 🎵 Music schools

### Search Queries We Use

```javascript
const searches = [
  'football academy kids Ras Al Khaimah UAE',
  'karate classes children RAK UAE',
  'swimming lessons kids Ras Al Khaimah',
  'dance studio children RAK',
  'gymnastics kids Ras Al Khaimah',
  'taekwondo children RAK UAE',
  'basketball training kids Ras Al Khaimah',
  'martial arts kids RAK',
  'tennis academy children Ras Al Khaimah'
];
```

---

## 💾 What Gets Saved to Supabase

### Main Business Record
- Name, slug, description, tagline
- Contact: phone, email, address, website
- Social media: Instagram, Facebook
- Category, amenities
- Source: 'scraped', timestamp
- Status: is_claimed = false, listing_type = 'basic'

### Related Tables
- **business_images**: Photos scraped from website
- **services_scraped**: Programs/classes offered
- **team_members_scraped**: Coaches/staff
- **faqs_scraped**: Common questions

### Auto-Calculated Fields
- **completeness_score**: 0-100% (how complete the profile is)
- **rank_score**: 0-100 (search ranking, premium gets +50)

---

## 📊 Example: Juventus Academy RAK

We successfully scraped and saved:

```javascript
{
  name: "Juventus Academy RAK",
  address: "Marjan Island Resort & Spa, RAK",
  phone: "050 117 0236",
  email: "rak@juventusacademy.ae",
  website: "https://academy.juventus.com/en/year-round-training-rak/",
  instagram: "https://www.instagram.com/jacademyrak/",
  facebook: "https://bit.ly/3pSAIoK",
  amenities: [
    "Hotel Local Partnership with Hilton Garden Inn",
    "Qualified and experienced coaches",
    "COVID-19 safety measures"
  ],
  programs: [
    {
      name: "Juventus Training Programs",
      description: "Technical training including goalkeeper programs..."
    }
  ]
}
```

**Result:**
- ✅ Saved to Supabase
- ✅ ID: 280a0a16-3d24-4582-89f3-a9bdb9f37a81
- ✅ Ready for claim invitation!

---

## 🎯 Next Steps

### 1. Scrape More Businesses (Today)

Let's scrape 20-30 kids activities:

```
"Search and scrape 5 football academies in RAK"
"Search and scrape 5 karate/martial arts centers in RAK"
"Search and scrape 5 dance studios in RAK"
"Search and scrape 5 swimming schools in RAK"
```

Each batch takes ~5-10 minutes.

### 2. Review Data Quality (Today)

Check Supabase to see:
- Which businesses have complete info
- Which need manual cleanup
- Completeness scores

### 3. Build Claim Page (Tomorrow)

Create the page where businesses can:
- See their pre-filled profile
- Verify/update information
- Upgrade to premium

### 4. Send Invitations (Day 3)

Email all scraped businesses:
- "We've listed your business on RAKlife!"
- "Claim your profile to enable instant bookings"
- Include claim link with token

### 5. Track Conversions

Monitor:
- How many claim their profile
- How many upgrade to premium
- First bookings!

---

## 🔧 Technical Details

### Firecrawl Credits Used

- **Search**: ~1 credit per search
- **Scrape**: ~5 credits per business website
- **Full business**: ~10-15 credits total

**For 30 businesses**: ~300-450 credits (~$2-3)

### Rate Limiting

- Wait 2 seconds between requests
- Polite scraping to avoid blocks
- Respect robots.txt

### Data Quality

Each business gets a completeness score:
- Basic info (name, address, phone): 20%
- Description & tagline: 15%
- Website & social media: 15%
- Images (5+): 15%
- Services (3+): 15%
- Team members: 10%
- FAQs: 10%

**Target**: 70%+ average completeness

---

## 📞 Quick Reference

### View Data in Supabase
```
https://supabase.com/dashboard/project/xqktkocghagcwdlljcho/editor/businesses
```

### Run Scripts
```bash
npm run scrape:demo      # Demo save (Juventus)
npm run scrape:test      # Test single business
npm run scrape:kids      # Search kids activities
npm run scrape:kids-auto # Full automated scrape
```

### Ask Me in Chat
- "Search for [activity] in RAK"
- "Scrape [URL]"
- "Save to Supabase"
- "Show me all scraped businesses"
- "Scrape the top 10 [category] in RAK"

---

## ✅ Summary

**What's Automatic:**
1. ✅ Firecrawl extracts business data
2. ✅ Script saves to Supabase
3. ✅ Trigger calculates scores
4. ✅ Business appears in directory

**What You Control:**
- When to scrape
- What to scrape
- How many businesses

**Ready to scrape more RAK kids activities? Just ask!** 🚀
