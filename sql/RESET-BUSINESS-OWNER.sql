-- Reset the business owner's overdue amount (it was mistakenly updated)
-- Run this in Supabase SQL Editor

UPDATE users 
SET overdue_amount = 0 
WHERE user_type = 'business_owner' 
AND phone = '+447545440408';

-- Verify
SELECT id, full_name, phone, user_type, overdue_amount 
FROM users 
WHERE phone = '+447545440408';
