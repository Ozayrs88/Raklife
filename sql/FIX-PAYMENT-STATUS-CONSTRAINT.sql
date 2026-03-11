-- Check and fix the payment_status constraint
-- Run this in Supabase SQL Editor

-- First, let's see what the current constraint is
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass 
AND conname LIKE '%payment_status%';

-- Drop the old constraint if it exists
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_payment_status_check;

-- Add new constraint that includes 'paid'
ALTER TABLE users ADD CONSTRAINT users_payment_status_check 
CHECK (payment_status IN ('pending', 'paid', 'overdue', 'cancelled', 'refunded'));
