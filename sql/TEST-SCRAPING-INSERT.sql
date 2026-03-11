-- Add missing website column and update test

-- Add website column if it doesn't exist
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS website TEXT;

-- Quick test: Insert a sample scraped business to verify schema works
INSERT INTO businesses (
  slug,
  name,
  business_type,
  description,
  address,
  phone,
  website,
  source,
  scraped_at,
  google_rating,
  google_review_count,
  latitude,
  longitude,
  operating_hours,
  listing_type,
  is_claimed,
  tagline
) VALUES (
  'test-business-' || substr(md5(random()::text), 0, 8),
  'Test Champions Football Academy',
  'sports',
  'Professional football training for kids aged 6-16',
  'Al Hamra Village, Ras Al Khaimah',
  '+971 7 244 xxxx',
  'https://example.com',
  'scraped',
  NOW(),
  4.8,
  127,
  25.7889,
  55.9758,
  '{"monday": {"open": "16:00", "close": "19:00"}, "tuesday": {"open": "16:00", "close": "19:00"}}'::jsonb,
  'basic',
  false,
  'Premier football training for young athletes'
) RETURNING id, name, completeness_score, rank_score;
