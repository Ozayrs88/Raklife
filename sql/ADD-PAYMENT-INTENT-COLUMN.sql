-- Add missing column to payment_links table
-- Run this in Supabase SQL Editor

ALTER TABLE payment_links 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_links_stripe_payment_intent_id 
ON payment_links(stripe_payment_intent_id);
