-- Update bookings table to support package bookings

-- Add missing columns
ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS pricing_plan_id UUID REFERENCES pricing_plans(id),
  ADD COLUMN IF NOT EXISTS pricing_option_id UUID REFERENCES pricing_options(id),
  ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS sessions_per_week INTEGER,
  ADD COLUMN IF NOT EXISTS duration_weeks INTEGER;

-- Update booking_type to support new types
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_booking_type_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_booking_type_check 
  CHECK (booking_type IN ('single', 'recurring', 'drop_in', 'monthly', 'term', 'custom'));

-- Update status to support pending
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_pricing_plan ON bookings(pricing_plan_id);
CREATE INDEX IF NOT EXISTS idx_bookings_pricing_option ON bookings(pricing_option_id);

-- Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;

-- Allow customers to create their own bookings
CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Allow customers to view their own bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id);
