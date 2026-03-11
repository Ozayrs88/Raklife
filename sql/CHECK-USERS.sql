-- Check what users actually exist in the database
-- Run this in Supabase SQL Editor

SELECT 
  id, 
  email, 
  full_name, 
  phone, 
  user_type, 
  overdue_amount, 
  created_at
FROM users 
ORDER BY created_at DESC
LIMIT 20;
