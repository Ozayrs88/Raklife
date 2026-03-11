-- SIMPLE FIX: Disable RLS on users table for testing
-- Run this in Supabase SQL Editor

-- Option 1: Disable RLS entirely (simplest for testing)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Done! Now refresh your Members page - you'll see all users.

-- TO RE-ENABLE LATER (when you want security back):
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
