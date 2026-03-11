-- Create trigger to automatically update completeness and rank scores
-- whenever a business record is inserted or updated

CREATE OR REPLACE FUNCTION update_business_scores()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completeness_score := calculate_completeness_score(NEW.id);
  NEW.rank_score := calculate_rank_score(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_business_scores ON businesses;

-- Create trigger
CREATE TRIGGER trigger_update_business_scores
  BEFORE INSERT OR UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_business_scores();

-- Now manually update all existing scraped businesses
UPDATE businesses
SET 
  completeness_score = calculate_completeness_score(id),
  rank_score = calculate_rank_score(id)
WHERE source = 'scraped';

-- Verify
SELECT 
  name,
  completeness_score,
  rank_score,
  listing_type
FROM businesses
WHERE source = 'scraped'
ORDER BY rank_score DESC;
