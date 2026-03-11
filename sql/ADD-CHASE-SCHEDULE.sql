-- =====================================================
-- ADD PAYMENT CHASE SCHEDULE TO BUSINESSES
-- Run this in Supabase SQL Editor
-- =====================================================

DO $$ 
BEGIN
  -- Add chase schedule to businesses
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'payment_chase_schedule') THEN
    ALTER TABLE businesses ADD COLUMN payment_chase_schedule JSONB DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'auto_chase_enabled') THEN
    ALTER TABLE businesses ADD COLUMN auto_chase_enabled BOOLEAN DEFAULT false;
  END IF;
  
  RAISE NOTICE '✅ Payment chase schedule fields added to businesses table';
END $$;
