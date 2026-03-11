-- Quick delete test user script
-- Run this in Supabase SQL Editor

-- Delete user by email (change the email to match your test user)
DO $$
DECLARE
  user_id_to_delete UUID;
BEGIN
  -- Get the user ID
  SELECT id INTO user_id_to_delete FROM users WHERE email = 'ozayr.y@icloud.com';
  
  IF user_id_to_delete IS NOT NULL THEN
    -- Delete related records
    DELETE FROM payment_links WHERE customer_id = user_id_to_delete;
    DELETE FROM bookings WHERE customer_id = user_id_to_delete;
    DELETE FROM children WHERE parent_id = user_id_to_delete;
    
    -- Delete the user
    DELETE FROM users WHERE id = user_id_to_delete;
    
    RAISE NOTICE 'User deleted successfully';
  ELSE
    RAISE NOTICE 'User not found';
  END IF;
END $$;

-- OR delete by phone number
-- DELETE FROM users WHERE phone = '+447454440408';

-- OR delete ALL customer test users at once
-- DELETE FROM users WHERE user_type = 'customer';
