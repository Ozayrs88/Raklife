# 🔥 Firecrawl + Supabase Setup Guide for RAKlife

## Overview
This guide will help you set up Firecrawl MCP to automatically scrape business data and save it directly to your Supabase database.

---

## 📋 Prerequisites

- ✅ Supabase project set up (you have this)
- ✅ Database schema ready (you have this)
- ⚠️ Firecrawl API key (we'll get this)
- ⚠️ Firecrawl MCP configured (we'll do this)

---

## Step 1: Get Firecrawl API Key (5 minutes)

### 1.1 Sign Up for Firecrawl

1. Go to: **https://www.firecrawl.dev/**
2. Click "Get Started" or "Sign Up"
3. Create an account (use your email)
4. Choose a plan:
   - **Free Tier**: 500 credits/month (good for testing ~100 businesses)
   - **Hobby**: $20/month - 3,000 credits (good for ~600 businesses)
   - **Standard**: $80/month - 20,000 credits (for full production)

### 1.2 Get Your API Key

1. After signing up, go to **Dashboard**
2. Click on **API Keys** in the sidebar
3. Copy your API key (starts with `fc-...`)
4. Save it somewhere safe (we'll use it next)

**Your API key looks like:** `fc-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## Step 2: Configure Firecrawl MCP (10 minutes)

### 2.1 Open Cursor Settings

1. In Cursor, open **Settings** (Cmd+, on Mac)
2. Search for **"MCP"** in the search bar
3. Click on **"MCP"** section

### 2.2 Configure Firecrawl Server

You should see a list of MCP servers. Find **"user-firecrawl"** and:

1. Click on it to edit
2. Add your API key in the configuration
3. The configuration should look like this:

```json
{
  "mcpServers": {
    "user-firecrawl": {
      "command": "npx",
      "args": [
        "-y",
        "@firecrawl/mcp-server-firecrawl"
      ],
      "env": {
        "FIRECRAWL_API_KEY": "fc-your-actual-api-key-here"
      }
    }
  }
}
```

4. Replace `fc-your-actual-api-key-here` with your actual API key
5. Save the settings
6. **Restart Cursor** (or reload the window)

### 2.3 Verify Firecrawl is Working

After restarting, the Firecrawl MCP should show as **"Running"** in the MCP settings.

---

## Step 3: Test Firecrawl Connection (5 minutes)

Let's test that Firecrawl can scrape a website.

### Test in Cursor Chat:

Ask me to run this test:

```
"Test Firecrawl by scraping this URL: https://www.championsfc.ae"
```

I'll use the Firecrawl MCP tools to scrape it and show you the results.

**Expected Result:** You should see the webpage content, images, and structured data.

---

## Step 4: Set Up Supabase Connection (5 minutes)

### 4.1 Get Supabase Credentials

You need two things from Supabase:

1. **Supabase URL** (looks like: `https://xxxxx.supabase.co`)
2. **Service Role Key** (starts with `eyJ...` - this is SECRET!)

#### How to Get Them:

1. Go to your Supabase project: **https://supabase.com/dashboard**
2. Select your RAKlife project
3. Click **Settings** (gear icon in sidebar)
4. Click **API**
5. You'll see:
   - **Project URL** → This is your Supabase URL
   - **anon public** key (don't use this one)
   - **service_role** key → Click "Reveal" and copy this ⚠️

### 4.2 Add to Environment Variables

In your `business-dashboard` folder, create/edit `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...your-service-role-key-here...

# Firecrawl (optional, if you want to call it from Next.js directly)
FIRECRAWL_API_KEY=fc-your-api-key-here
```

**⚠️ Important:** Never commit `.env.local` to git! Add it to `.gitignore`.

---

## Step 5: Create Scraping Script (Already Done! ✅)

Good news - I've already created the scraping script for you:

**File:** `/business-dashboard/lib/scraper.ts`

This script:
- ✅ Uses Firecrawl to scrape Google Maps, websites, and social media
- ✅ Extracts all business data (name, address, phone, hours, images, services, team, reviews)
- ✅ Saves everything to Supabase automatically
- ✅ Calculates completeness and rank scores
- ✅ Handles rate limiting and errors

---

## Step 6: Test Scraping a Single Business (15 minutes)

Let's test the complete flow with one real business.

### 6.1 Create Test Script

I'll create a simple test script that scrapes one business and saves to Supabase.

**Tell me:**
"Create a test script to scrape Champions Football Academy and save to Supabase"

### 6.2 Run the Test

```bash
cd business-dashboard
npx tsx scripts/test-scrape-single.ts
```

**Expected Output:**
```
🚀 Testing single business scrape...

🔍 Scraping: Champions Football Academy
   📍 Google Maps: ✓
   🌐 Website: ✓
   📸 Images: 12 found
   📝 Services: 5 found
   ✅ Saved to Supabase!
   
📊 Completeness Score: 85%
📈 Rank Score: 42.5

✅ Test complete!
```

### 6.3 Verify in Supabase

Go to your Supabase dashboard:

1. Click **Table Editor**
2. Open **businesses** table
3. You should see the new business with all data filled in!
4. Check **business_images**, **services_scraped** tables too

---

## Step 7: Scrape 10 Test Businesses (30 minutes)

Once the single test works, let's scrape a small batch.

**Tell me:**
"Run a test scrape of 10 RAK businesses across different categories"

This will:
- Search Google Maps for different activity types in RAK
- Find 10 businesses
- Scrape complete data for each
- Save everything to Supabase
- Generate a report

---

## Step 8: Full Production Scrape (2-3 hours)

When you're ready for the full directory:

**Tell me:**
"Run the full scraping system for all 200+ businesses"

This will:
- Scrape 25+ search queries across all categories
- Find 200-300 businesses in RAK
- Get complete data for each
- Auto-update Supabase
- Take 2-3 hours (rate limited to be polite)

---

## 📊 Understanding Firecrawl Credits

Each Firecrawl action costs credits:

- **Scrape a page**: 1-5 credits (depending on size)
- **Map a website**: 1 credit per page found
- **Full business scrape**: ~15-25 credits
  - Google Maps profile: 5 credits
  - Website (5-10 pages): 5-15 credits
  - Social media: 3-5 credits

**For 200 businesses:**
- Total credits needed: ~3,000-5,000
- Cost: ~$20-40 (Hobby plan should cover it)

---

## 🎯 Quick Start Commands

Once everything is set up, use these:

```bash
# Test single business
npm run scrape:test-one

# Test batch of 10
npm run scrape:test-batch

# Full scrape (production)
npm run scrape:all

# Re-scrape specific business
npm run scrape:update -- "business-name"
```

---

## 🐛 Troubleshooting

### Firecrawl MCP Shows "Errored"

1. Check API key is correct in MCP settings
2. Make sure you have credits remaining
3. Restart Cursor completely
4. Try reinstalling: `npx -y @firecrawl/mcp-server-firecrawl`

### "Failed to connect to Supabase"

1. Check `.env.local` has correct URL and key
2. Make sure you're using **service_role** key, not anon key
3. Verify RLS policies allow service role to insert

### Scraping Returns Empty Data

1. Check Firecrawl dashboard - did the scrape work?
2. Try the URL manually to ensure it's accessible
3. Some sites block scrapers - try a different business

### Database Insert Fails

1. Check all required columns exist (run `ADD-SCRAPING-SCHEMA.sql` again)
2. Check data types match (e.g., `operating_hours` should be JSONB)
3. Look at Supabase logs for specific error

---

## 📞 Need Help?

If you get stuck at any step, just tell me:

- "Firecrawl MCP won't start" 
- "Test scrape failed with error: [error message]"
- "Can't find my Supabase service key"
- "Scraping works but database insert fails"

I'll help you debug and fix it!

---

## ✅ Setup Checklist

- [ ] Created Firecrawl account
- [ ] Got API key from Firecrawl dashboard
- [ ] Configured Firecrawl MCP in Cursor settings
- [ ] Restarted Cursor
- [ ] Verified Firecrawl MCP shows "Running"
- [ ] Got Supabase URL and service_role key
- [ ] Created `.env.local` with credentials
- [ ] Tested scraping a single page
- [ ] Tested scraping a single business
- [ ] Verified data saved to Supabase
- [ ] Ready for batch scraping!

---

## 🚀 Next Steps After Setup

Once everything is working:

1. **Scrape 200+ businesses** (2-3 hours automated)
2. **Build claim page** so businesses can verify and upgrade
3. **Send invitations** to all businesses
4. **Track conversions** to premium plans

---

**Ready to start? Tell me where you are in the setup process and I'll guide you through each step!**
