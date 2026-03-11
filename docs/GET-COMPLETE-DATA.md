# 🎯 GET COMPLETE DATA FOR ALL BUSINESSES

## What This Does

Gets **EVERYTHING** from Google Maps for all your businesses:

✅ **Ratings & Reviews** (5-star ratings, review counts, actual reviews)  
✅ **Complete Contact** (phone, address, website)  
✅ **Operating Hours** (full weekly schedule)  
✅ **Photos** (up to 10 images per business, downloaded & saved)  
✅ **Location** (exact coordinates for maps)  
✅ **Categories** (proper categorization from Google)  
✅ **Reviews** (top 5 reviews with text)  
✅ **Price Level** ($ to $$$$)  
✅ **Business Status** (open, closed, etc.)

---

## 🚀 How to Run

### Step 1: Make sure you have Google API key
```bash
# Check your .env.local has:
GOOGLE_MAPS_API_KEY=AIza...your-key
```

### Step 2: Run the complete enrichment
```bash
cd business-dashboard
npm run enrich:complete
```

### Step 3: Watch it work!
```
🗺️  COMPLETE Google Maps Enrichment
Getting ALL data for ALL businesses...

[1/15] Chase Sports Academy
🔍 Searching: Chase Sports Academy
   ✓ Found on Google Maps
   ⭐ Rating: 4.8/5 (73 reviews)
   📍 Location: Al Hamra Industrial Area, RAK
   📞 Phone: +971 58 661 0334
   🌐 Website: https://csprak.com
   📸 Photos: 12
   💬 Reviews: 5
   🏷️  Category: sports
   🕐 Hours: Added
   📸 Downloading 12 photos...
   ✅ 12 photos saved
   💬 5 reviews saved
   ✅ Updated in database

[2/15] KiDojo Karate...
...

✅ COMPLETE Enrichment Done!
📊 Results:
   ✅ Updated: 15
   ❌ Failed: 0
   📊 Total: 15

🎉 All businesses now have complete Google Maps data!
```

---

## 📊 What Gets Added/Updated

### For Each Business:

**Before:**
```
Name: Chase Sports Academy
Phone: +971 58 661 0334
Rating: null
Photos: 0
Reviews: 0
```

**After:**
```
Name: Chase Sports Academy
Phone: +971 58 661 0334  
Address: Al Hamra Industrial Area, Wearhouse WIZ 1/014, RAK ✅
Rating: 4.8⭐ (73 reviews) ✅
Coordinates: 25.6637, 55.7995 ✅
Hours: Mon-Fri 15:00-22:00, Sat-Sun 09:00-22:00 ✅
Photos: 12 images ✅
Reviews: 5 detailed reviews ✅
Category: sports (from Google) ✅
Price Level: $$ ✅
Google URL: [direct link] ✅
```

---

## 📸 Photo Management

Photos are:
1. **Downloaded** from Google Maps
2. **Saved locally** to `/public/business-photos/{business-id}/`
3. **Added to database** in `business_images` table
4. **Categorized** as hero (first photo) or gallery (others)
5. **Linked** to the business

Example structure:
```
public/
└── business-photos/
    ├── business-id-1/
    │   ├── photo-0.jpg  (hero image)
    │   ├── photo-1.jpg
    │   ├── photo-2.jpg
    │   └── ...
    └── business-id-2/
        └── ...
```

---

## 💬 Review Management

Top 5 Google reviews saved with:
- Author name
- Star rating
- Review text
- Date/time
- Source: google_maps

Stored in `reviews_scraped` table.

---

## 🏷️  Category Mapping

Google categories → Your categories:
- `gym`, `fitness_center` → **fitness**
- `sports_club`, `martial_arts_school` → **sports**
- `dance_school`, `art_school`, `music_school` → **education**
- `swimming_pool` → **sports**
- `beauty_salon`, `spa` → **wellness**
- `restaurant`, `cafe` → **restaurant**

Auto-categorizes if category is missing!

---

## 💰 API Cost

**For 15 businesses:**
- Place Search: 15 calls
- Place Details: 15 calls  
- Photos: ~180 calls (12 photos × 15 businesses)
- **Total: ~210 API calls**

**Cost:**
- First 100,000 calls/month: FREE
- After: $0.017 per call
- **Your cost: $0** (well within free tier)

---

## ✅ What You Get

After running `npm run enrich:complete`:

✅ **15 businesses** fully enriched  
✅ **~180 photos** downloaded & saved  
✅ **~75 reviews** (5 per business)  
✅ **Complete hours** for all  
✅ **All ratings** from Google  
✅ **Proper categories**  
✅ **Exact coordinates**  
✅ **Everything visible on Google Maps**

---

## 🔄 Re-running

Safe to run multiple times:
- Won't duplicate data
- Updates missing info
- Downloads new photos only
- Always fresh from Google

**Run monthly** to keep data updated!

---

## 🎯 Next Steps

1. **Get API Key** (if you haven't)
   - https://console.cloud.google.com/
   - Enable Places API
   - Get key

2. **Run Script**
   ```bash
   npm run enrich:complete
   ```

3. **Check Results**
   - View in Supabase
   - See photos in `/public/business-photos/`
   - All data complete!

4. **Display on Homepage**
   - All businesses ready to show
   - Photos ready to display
   - Reviews ready to show
   - Complete data for booking

---

## 🎉 Result

**Complete, professional business listings with:**
- ⭐ Trusted Google ratings
- 📸 High-quality photos
- 💬 Real customer reviews
- 🕐 Accurate hours
- 📍 Exact locations
- 🏷️  Proper categories

**Ready for users to browse and book!** 🚀
