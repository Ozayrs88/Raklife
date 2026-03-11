-- Manually update scores for test business
UPDATE businesses
SET 
  completeness_score = calculate_completeness_score(id),
  rank_score = calculate_rank_score(id)
WHERE source = 'scraped' AND is_claimed = false;

-- Verify the update
SELECT 
  id,
  name,
  completeness_score,
  rank_score,
  (SELECT COUNT(*) FROM business_images WHERE business_id = businesses.id) as image_count,
  (SELECT COUNT(*) FROM services_scraped WHERE business_id = businesses.id) as service_count,
  (SELECT COUNT(*) FROM team_members_scraped WHERE business_id = businesses.id) as team_count,
  (SELECT COUNT(*) FROM faqs_scraped WHERE business_id = businesses.id) as faq_count
FROM businesses
WHERE source = 'scraped'
ORDER BY completeness_score DESC;
