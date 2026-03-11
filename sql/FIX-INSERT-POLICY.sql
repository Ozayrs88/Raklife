-- Fix INSERT policy to allow authenticated users to create customers
-- Run this in Supabase SQL Editor

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Business owners can create customers" ON users;

-- Create a simpler policy that allows any authenticated user to create customers
CREATE POLICY "Authenticated users can create customers"
ON users
FOR INSERT
TO authenticated
WITH CHECK (user_type = 'customer');

-- Also simplify the UPDATE policy
DROP POLICY IF EXISTS "Business owners can update customers" ON users;

CREATE POLICY "Authenticated users can update customers"
ON users
FOR UPDATE
TO authenticated
USING (user_type = 'customer')
WITH CHECK (user_type = 'customer');

-- Verify the policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'users' AND cmd IN ('INSERT', 'UPDATE')
ORDER BY cmd, policyname;
