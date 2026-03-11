-- Add payment_templates column to businesses table
-- Run this in Supabase SQL Editor

-- Add column for storing custom payment reminder templates
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS payment_templates JSONB DEFAULT NULL;

-- Add comment explaining the structure
COMMENT ON COLUMN businesses.payment_templates IS 'Custom payment reminder templates with keys: early, medium, urgent';

-- Example structure:
-- {
--   "early": "Hi {name}, reminder message...",
--   "medium": "Hi {name}, more urgent...",
--   "urgent": "URGENT: {name}..."
-- }
