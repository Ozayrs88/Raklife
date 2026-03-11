-- =====================================================
-- ADD MANUAL USER WITH OVERDUE AMOUNT (FOR TESTING)
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Get your business ID (replace with your actual business ID)
-- To find it, run: SELECT id, name FROM businesses;
DO $$ 
DECLARE
  v_business_id UUID;
  v_user_id UUID;
  v_child_id UUID;
BEGIN
  -- Get the first business (or specify your business ID)
  SELECT id INTO v_business_id FROM businesses ORDER BY created_at DESC LIMIT 1;
  
  IF v_business_id IS NULL THEN
    RAISE EXCEPTION 'No business found. Please create a business first.';
  END IF;

  -- Check if user already exists
  SELECT id INTO v_user_id FROM users WHERE email = 'test.parent@example.com';
  
  IF v_user_id IS NULL THEN
    -- Create a test customer user with overdue amount
    INSERT INTO users (
      id,
      email,
      full_name,
      phone,
      user_type,
      overdue_amount,
      payment_status,
      last_payment_date
    ) VALUES (
      gen_random_uuid(),
      'test.parent@example.com',
      'Ahmed Al Maktoum',
      '+971501234567',
      'customer',
      1050.00,
      'overdue',
      '2024-12-15'
    )
    RETURNING id INTO v_user_id;
  ELSE
    -- Update existing user
    UPDATE users SET
      overdue_amount = 1050.00,
      payment_status = 'overdue',
      last_payment_date = '2024-12-15',
      phone = '+971501234567'
    WHERE id = v_user_id;
  END IF;

  RAISE NOTICE 'Created/Updated user with ID: %', v_user_id;

  -- Create a child for this user
  INSERT INTO children (
    parent_id,
    first_name,
    last_name,
    date_of_birth
  ) VALUES (
    v_user_id,
    'Sara',
    'Al Maktoum',
    '2016-03-15'
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_child_id;

  IF v_child_id IS NOT NULL THEN
    RAISE NOTICE 'Created child with ID: %', v_child_id;
  END IF;

  -- Create a dummy booking to link this customer to the business
  -- (so they appear in the business's member list)
  INSERT INTO bookings (
    business_id,
    customer_id,
    child_id,
    service_id,
    scheduled_date,
    start_time,
    end_time,
    status
  )
  SELECT
    v_business_id,
    v_user_id,
    v_child_id,
    (SELECT id FROM services WHERE business_id = v_business_id LIMIT 1),
    CURRENT_DATE,
    '16:00:00',
    '17:00:00',
    'completed'
  WHERE EXISTS (SELECT 1 FROM services WHERE business_id = v_business_id)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '✅ Test user created successfully!';
  RAISE NOTICE '📧 Email: test.parent@example.com';
  RAISE NOTICE '👤 Name: Ahmed Al Maktoum';
  RAISE NOTICE '💰 Overdue Amount: AED 1,050.00';
  RAISE NOTICE '👶 Child: Sara Al Maktoum (8 years old)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next steps:';
  RAISE NOTICE '1. Go to /dashboard/members';
  RAISE NOTICE '2. Filter by "Overdue" status';
  RAISE NOTICE '3. Select the user and send a payment link';
END $$;

-- Optional: Add more test users with different amounts
DO $$
DECLARE
  v_business_id UUID;
BEGIN
  SELECT id INTO v_business_id FROM businesses ORDER BY created_at DESC LIMIT 1;
  
  -- Insert test users with explicit IDs
  INSERT INTO users (id, email, full_name, phone, user_type, overdue_amount, payment_status, last_payment_date)
  VALUES 
    (gen_random_uuid(), 'fatima.test@example.com', 'Fatima Hassan', '+971502345678', 'customer', 840.00, 'overdue', '2024-11-20'),
    (gen_random_uuid(), 'ali.test@example.com', 'Ali Mohammed', '+971503456789', 'customer', 1260.00, 'overdue', '2024-10-30'),
    (gen_random_uuid(), 'mariam.test@example.com', 'Mariam Abdullah', '+971504567890', 'customer', 630.00, 'overdue', '2024-12-01')
  ON CONFLICT (email) DO UPDATE SET
    overdue_amount = EXCLUDED.overdue_amount,
    payment_status = EXCLUDED.payment_status;
  
  -- Link these users to the business with dummy bookings
  INSERT INTO bookings (
    business_id,
    customer_id,
    service_id,
    scheduled_date,
    start_time,
    end_time,
    status
  )
  SELECT
    v_business_id,
    u.id,
    (SELECT id FROM services WHERE business_id = v_business_id LIMIT 1),
    CURRENT_DATE - INTERVAL '7 days',
    '16:00:00',
    '17:00:00',
    'completed'
  FROM users u
  WHERE u.email IN ('fatima.test@example.com', 'ali.test@example.com', 'mariam.test@example.com')
    AND EXISTS (SELECT 1 FROM services WHERE business_id = v_business_id)
  ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '✅ Added 3 more test users!';
END $$;

-- Verify the users were created
SELECT 
  email,
  full_name,
  overdue_amount,
  payment_status,
  last_payment_date
FROM users
WHERE overdue_amount > 0
ORDER BY overdue_amount DESC;
