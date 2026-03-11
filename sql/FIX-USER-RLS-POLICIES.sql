-- Fix RLS policies to allow business owners to create and manage customer users

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON users;
DROP POLICY IF EXISTS "Business owners can view all users" ON users;
DROP POLICY IF EXISTS "Business owners can create customers" ON users;
DROP POLICY IF EXISTS "Business owners can update customers" ON users;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow business owners to view all users
CREATE POLICY "Business owners can view all users"
  ON users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_staff
      WHERE business_staff.user_id = auth.uid()
      AND business_staff.role IN ('owner', 'admin')
    )
  );

-- Allow business owners to create customer users
CREATE POLICY "Business owners can create customers"
  ON users FOR INSERT
  WITH CHECK (
    user_type = 'customer'
    AND EXISTS (
      SELECT 1 FROM business_staff
      WHERE business_staff.user_id = auth.uid()
      AND business_staff.role IN ('owner', 'admin')
    )
  );

-- Allow business owners to update customer users
CREATE POLICY "Business owners can update customers"
  ON users FOR UPDATE
  USING (
    user_type = 'customer'
    AND EXISTS (
      SELECT 1 FROM business_staff
      WHERE business_staff.user_id = auth.uid()
      AND business_staff.role IN ('owner', 'admin')
    )
  );

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
