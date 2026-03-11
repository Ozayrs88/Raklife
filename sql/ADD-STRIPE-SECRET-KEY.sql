-- Add stripe_secret_key column to businesses table
-- This allows storing business Stripe API keys directly

ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS stripe_secret_key TEXT;

-- Add comment
COMMENT ON COLUMN businesses.stripe_secret_key IS 'Stripe secret key for direct API integration (stored encrypted in production)';

-- Note: In production, this should be encrypted at rest
-- For now, it's just stored as text for testing
