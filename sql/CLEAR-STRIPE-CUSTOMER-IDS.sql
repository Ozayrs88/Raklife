-- Clear old Stripe customer IDs so new ones can be created
-- Run this in Supabase SQL Editor

UPDATE users 
SET stripe_customer_id = NULL 
WHERE stripe_customer_id IS NOT NULL;
