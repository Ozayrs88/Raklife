-- Verify the scraping system works

-- 1. Check if the test business was created
SELECT 
  name,
  source,
  listing_type,
  is_claimed,
  completeness_score,
  rank_score,
  google_rating,
  claim_token
FROM businesses 
WHERE source = 'scraped'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verify all new columns exist
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'businesses'
  AND column_name IN (
    'source', 'is_claimed', 'claim_token', 'completeness_score', 
    'rank_score', 'listing_type', 'instagram_url', 'google_rating'
  )
ORDER BY column_name;

-- 3. Check new tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'business_images', 
    'services_scraped', 
    'team_members_scraped',
    'reviews_scraped',
    'faqs_scraped',
    'scraping_jobs'
  )
ORDER BY table_name;

-- 4. Test the completeness score function
SELECT calculate_completeness_score(id) as score
FROM businesses 
WHERE source = 'scraped'
LIMIT 1;

-- 5. Test the rank score function
SELECT calculate_rank_score(id) as rank
FROM businesses 
WHERE source = 'scraped'
LIMIT 1;
