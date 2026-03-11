-- Remove foreign key constraint on users table
-- This allows creating customer records without auth accounts (for manual entry)

-- Drop the foreign key constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- The users table can now have customers without auth accounts
-- Business owners/staff will still have auth accounts
-- Customers added manually won't be able to login, but can receive payment links

-- Note: If you want customers to login later, you'll need to:
-- 1. Create an auth.users record for them
-- 2. Update their public.users.id to match
