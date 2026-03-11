# 🗺️ Google Maps API Setup - Step by Step

## ✅ What We're Setting Up

Automatic fetching of:
- ⭐ Google ratings (4.8/5)
- 📊 Review counts (127 reviews)
- 📍 Exact coordinates (latitude/longitude)
- 🕐 Operating hours (complete schedule)

---

## 📋 Step-by-Step Setup (15 minutes)

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console:**
   https://console.cloud.google.com/

2. **Create a New Project:**
   - Click "Select a project" at the top
   - Click "New Project"
   - Name: "RAKlife"
   - Click "Create"

3. **Enable Places API:**
   - In the search bar, type "Places API"
   - Click "Places API"
   - Click "Enable"

4. **Create API Key:**
   - Go to "Credentials" (left sidebar)
   - Click "+ CREATE CREDENTIALS"
   - Select "API key"
   - Copy the API key (starts with `AIza...`)

5. **Restrict the API Key (Important!):**
   - Click "Edit API key"
   - Under "API restrictions":
     - Select "Restrict key"
     - Check "Places API"
   - Under "Application restrictions" (optional but recommended):
     - Select "IP addresses"
     - Add your server IP
   - Click "Save"

---

### Step 2: Add API Key to Project

1. **Open `.env.local`** in `business-dashboard/`

2. **Replace the placeholder:**
   ```env
   GOOGLE_MAPS_API_KEY=AIza...your-actual-key-here
   ```

3. **Save the file**

---

### Step 3: Run the Enrichment Script

```bash
cd business-dashboard
npm run enrich:google
```

**What it does:**
- Searches Google Maps for each business
- Fetches rating, reviews, hours, coordinates
- Automatically updates Supabase
- Shows progress for all 14 businesses

**Expected output:**
```
🗺️  Google Maps Data Enrichment Tool
═══════════════════════════════════════

📋 Found 14 businesses

[1/14] Juventus Academy RAK
   ⏭️  Already has Google data (4.8⭐)

[2/14] SK Academy
🔍 Searching Google Maps for: SK Academy
   ✓ Found: SK Academy
   📍 Al Hamra, Ras Al Khaimah
   ⭐ Rating: 4.7/5
   📊 Reviews: 156
   📍 Coordinates: 25.6985, 55.8042
   🕐 Hours: Added
   ✅ Updated in database

...

═══════════════════════════════════════
✅ Enrichment Complete!

📊 Results:
   Updated: 9
   Skipped (already has data): 5
   Failed: 0
   Total: 14
```

---

## 💰 Cost & Limits

### Free Tier:
- **$200 credit** per month (Google Cloud free trial)
- **100 requests/day** free after trial
- **For RAKlife:** 14 businesses = 28 API calls (Find + Details)
- **Cost:** $0.00 (well within free tier!)

### Ongoing Costs:
- Monthly refresh (14 businesses): **FREE**
- Adding 100 new businesses: **FREE** (within daily limit)
- Adding 1000 businesses: ~$17 (one-time)

**For your use case: Completely FREE!** ✅

---

## 🔄 Updating Data

### Refresh All Businesses:
```bash
npm run enrich:google
```

### Refresh Only New Businesses:
The script automatically skips businesses that already have Google data.

### Force Refresh All:
Edit the script and comment out the skip logic:
```typescript
// Skip if already has Google rating
// if (business.google_rating && business.google_rating > 0) {
//   console.log(`   ⏭️  Already has Google data`);
//   skipped++;
//   continue;
// }
```

---

## 🐛 Troubleshooting

### Error: "API key not found"
**Solution:** Make sure `GOOGLE_MAPS_API_KEY` is in `.env.local`

### Error: "This API project is not authorized"
**Solution:** Enable Places API in Google Cloud Console

### Error: "INVALID_REQUEST"
**Solution:** Check that the API key is correct and Places API is enabled

### Error: "OVER_QUERY_LIMIT"
**Solution:** You've exceeded daily limit. Wait 24 hours or upgrade billing.

### Business Not Found:
**Reasons:**
- Business name spelling is different on Google Maps
- Business doesn't have a Google Maps listing yet
- Business is very new

**Solutions:**
1. Check Google Maps manually for correct name
2. Update business name in Supabase to match Google
3. Try adding more location details to the search

---

## 🎯 What Gets Updated

For each business, the script updates:

```typescript
{
  google_rating: 4.8,              // 1-5 stars
  google_review_count: 127,         // Number of reviews
  latitude: 25.6637115,             // Exact location
  longitude: 55.7995418,            // Exact location
  operating_hours: {                // Complete schedule
    monday: { open: '09:00', close: '18:00' },
    tuesday: { open: '09:00', close: '18:00' },
    // ... all 7 days
  }
}
```

---

## ✅ Verification

After running, check in Supabase:

```sql
SELECT 
  name,
  google_rating,
  google_review_count,
  latitude,
  longitude,
  operating_hours
FROM businesses
WHERE source = 'scraped'
ORDER BY google_rating DESC;
```

All businesses should now have:
- ⭐ Ratings
- 📊 Review counts
- 📍 Coordinates
- 🕐 Hours (if available on Google)

---

## 🚀 Next Steps

Once enrichment is complete:

1. ✅ Verify data in Supabase
2. ✅ Check a few businesses manually on Google Maps
3. ✅ Run CREATE-SCORE-TRIGGER.sql for completeness scoring
4. ✅ Build the homepage to display businesses with ratings
5. ✅ Create the claim page

---

## 📞 Need Help?

If you get stuck:
1. Check the error message carefully
2. Verify API key is correct
3. Ensure Places API is enabled
4. Check billing is set up (even for free tier)

**Common Issue:** "REQUEST_DENIED" usually means Places API isn't enabled.

---

## 🎉 Summary

**Setup time:** 15 minutes  
**Cost:** $0 (free tier)  
**Businesses covered:** All 14  
**Data quality:** Official from Google  
**Ongoing maintenance:** Automatic  

**Ready? Get your API key and run `npm run enrich:google`!** 🚀
