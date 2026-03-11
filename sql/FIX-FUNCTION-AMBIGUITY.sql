-- Fix the ambiguous column reference in calculate_completeness_score function

DROP FUNCTION IF EXISTS calculate_completeness_score(UUID);

CREATE OR REPLACE FUNCTION calculate_completeness_score(p_business_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  biz RECORD;
  image_count INTEGER;
  service_count INTEGER;
BEGIN
  SELECT * INTO biz FROM businesses WHERE id = p_business_id;
  
  -- Basic info (40 points)
  IF biz.name IS NOT NULL AND length(biz.name) > 2 THEN score := score + 5; END IF;
  IF biz.address IS NOT NULL AND length(biz.address) > 10 THEN score := score + 5; END IF;
  IF biz.phone IS NOT NULL THEN score := score + 5; END IF;
  IF biz.email IS NOT NULL THEN score := score + 5; END IF;
  IF biz.website IS NOT NULL THEN score := score + 5; END IF;
  IF biz.description IS NOT NULL AND length(biz.description) > 100 THEN score := score + 10; END IF;
  IF biz.business_type IS NOT NULL THEN score := score + 5; END IF;
  
  -- Media (30 points)
  SELECT COUNT(*) INTO image_count FROM business_images WHERE business_images.business_id = p_business_id;
  IF biz.logo_url IS NOT NULL THEN score := score + 5; END IF;
  IF biz.cover_photo_url IS NOT NULL THEN score := score + 5; END IF;
  IF image_count >= 5 THEN score := score + 10;
  ELSIF image_count >= 3 THEN score := score + 5;
  ELSIF image_count >= 1 THEN score := score + 3;
  END IF;
  IF biz.video_urls IS NOT NULL AND array_length(biz.video_urls, 1) > 0 THEN score := score + 10; END IF;
  
  -- Services (15 points)
  SELECT COUNT(*) INTO service_count FROM services_scraped WHERE services_scraped.business_id = p_business_id;
  IF service_count >= 5 THEN score := score + 15;
  ELSIF service_count >= 3 THEN score := score + 10;
  ELSIF service_count >= 1 THEN score := score + 5;
  END IF;
  
  -- Additional details (15 points)
  IF biz.operating_hours IS NOT NULL THEN score := score + 5; END IF;
  IF biz.google_rating IS NOT NULL THEN score := score + 5; END IF;
  IF biz.amenities IS NOT NULL AND array_length(biz.amenities, 1) > 0 THEN score := score + 3; END IF;
  IF biz.instagram_url IS NOT NULL OR biz.facebook_url IS NOT NULL THEN score := score + 2; END IF;
  
  RETURN LEAST(score, 100);
END;
$$ LANGUAGE plpgsql;

-- Also fix the calculate_rank_score function

DROP FUNCTION IF EXISTS calculate_rank_score(UUID);

CREATE OR REPLACE FUNCTION calculate_rank_score(p_business_id UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  biz RECORD;
BEGIN
  SELECT * INTO biz FROM businesses WHERE id = p_business_id;
  
  -- Completeness score (0-20 points)
  score := score + (calculate_completeness_score(p_business_id) * 0.2)::INTEGER;
  
  -- Premium bonus (0-50 points)
  IF biz.listing_type = 'premium' AND biz.is_active_booking THEN
    score := score + 50;
  END IF;
  
  -- Activity score (0-30 points)
  IF biz.last_booking_at > NOW() - INTERVAL '30 days' THEN
    score := score + 10;
  END IF;
  IF biz.response_rate > 80 THEN
    score := score + 10;
  END IF;
  IF biz.google_rating >= 4.5 THEN
    score := score + 10;
  END IF;
  
  RETURN score;
END;
$$ LANGUAGE plpgsql;
