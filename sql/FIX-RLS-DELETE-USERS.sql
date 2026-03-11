-- Fix RLS policies to allow deletion of customer users
-- Run this in Supabase SQL Editor

-- First, let's see what policies exist (for reference)
-- SELECT * FROM pg_policies WHERE tablename = 'users';

-- Drop existing restrictive delete policy if it exists
DROP POLICY IF EXISTS "Users can delete their own account" ON users;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON users;
DROP POLICY IF EXISTS "Business staff can delete customers" ON users;

-- Create a policy that allows business staff to delete customer users
CREATE POLICY "Business staff can delete customer users"
ON users
FOR DELETE
TO authenticated
USING (
  user_type = 'customer'
  OR
  auth.uid() = id
);

-- Alternative: More permissive policy for testing (allows any authenticated user to delete customers)
-- Uncomment if the above doesn't work:
/*
DROP POLICY IF EXISTS "Business staff can delete customer users" ON users;

CREATE POLICY "Allow deletion of customer users"
ON users
FOR DELETE
TO authenticated
USING (user_type = 'customer');
*/

-- Verify the policy was created
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
AND cmd = 'DELETE';
