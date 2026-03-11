-- Fix RLS policies to allow reading customer users
-- Run this in Supabase SQL Editor

-- Drop existing restrictive select policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Business staff can view customers" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to read" ON users;

-- Create a permissive read policy for customer users
CREATE POLICY "Allow authenticated users to read customer users"
ON users
FOR SELECT
TO authenticated
USING (
  user_type = 'customer'
  OR
  auth.uid() = id
);

-- Also update the insert policy to make sure new users are properly created
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON users;

CREATE POLICY "Allow authenticated users to insert customers"
ON users
FOR INSERT
TO authenticated
WITH CHECK (user_type = 'customer' OR auth.uid() = id);

-- Update policy to allow updating customer users
DROP POLICY IF EXISTS "Allow authenticated users to update customers" ON users;

CREATE POLICY "Allow authenticated users to update customers"
ON users
FOR UPDATE
TO authenticated
USING (user_type = 'customer' OR auth.uid() = id)
WITH CHECK (user_type = 'customer' OR auth.uid() = id);

-- Verify all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY cmd, policyname;
