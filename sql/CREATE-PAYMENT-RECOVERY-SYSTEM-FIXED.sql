-- =====================================================
-- PAYMENT RECOVERY & SUBSCRIPTION MANAGEMENT SYSTEM
-- FIXED VERSION - Works with existing schema
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. EXTEND EXISTING TABLES
-- =====================================================

-- Add payment recovery columns to existing users table
DO $$ 
BEGIN
  -- Add overdue tracking to users (customers)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'overdue_amount') THEN
    ALTER TABLE users ADD COLUMN overdue_amount DECIMAL(10,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_payment_date') THEN
    ALTER TABLE users ADD COLUMN last_payment_date TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'payment_status') THEN
    ALTER TABLE users ADD COLUMN payment_status TEXT DEFAULT 'current' CHECK (payment_status IN ('current', 'overdue', 'delinquent'));
  END IF;
  
  -- Add Stripe customer ID if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
  END IF;
END $$;

-- Add Stripe account info to businesses
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'stripe_account_id') THEN
    ALTER TABLE businesses ADD COLUMN stripe_account_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'stripe_account_status') THEN
    ALTER TABLE businesses ADD COLUMN stripe_account_status TEXT DEFAULT 'pending' CHECK (stripe_account_status IN ('pending', 'connected', 'disconnected'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'stripe_charges_enabled') THEN
    ALTER TABLE businesses ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Extend existing subscriptions table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id') THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id') THEN
    ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_start') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_start TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'current_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_end TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end') THEN
    ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancelled_at') THEN
    ALTER TABLE subscriptions ADD COLUMN cancelled_at TIMESTAMPTZ;
  END IF;
END $$;

-- =====================================================
-- 2. CSV IMPORT TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS member_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  successful_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_log JSONB DEFAULT '[]'::jsonb,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 3. MEMBERSHIP PLANS (pricing tiers)
-- =====================================================

CREATE TABLE IF NOT EXISTS membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  description TEXT,
  sessions_per_week INTEGER,
  price_monthly DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  
  -- Stripe
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. PAYMENT LINKS (for overdue payments)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  
  -- Stripe details
  stripe_payment_link_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_link_url TEXT,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  purpose TEXT NOT NULL CHECK (purpose IN ('overdue_payment', 'subscription_start', 'one_time')),
  description TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'paid', 'expired', 'cancelled')),
  sent_at TIMESTAMPTZ,
  sent_via TEXT, -- 'email', 'whatsapp', 'sms'
  viewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Optional: attach to subscription
  membership_plan_id UUID REFERENCES membership_plans(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 5. PAYMENT TRANSACTIONS (all payments)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID REFERENCES children(id),
  
  -- Link to source
  payment_link_id UUID REFERENCES payment_links(id),
  subscription_id UUID REFERENCES subscriptions(id),
  booking_id UUID REFERENCES bookings(id),
  
  -- Stripe details
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('one_time', 'subscription_initial', 'subscription_recurring', 'refund', 'overdue_recovery')),
  payment_method TEXT, -- 'card', 'bank_transfer', etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'disputed')),
  failure_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. ACTIVITY LOG (audit trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Action details
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Who did it
  actor_id UUID REFERENCES auth.users(id),
  actor_type TEXT, -- 'business_staff', 'customer', 'system'
  ip_address TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES (for performance)
-- =====================================================

-- Users (payment tracking)
CREATE INDEX IF NOT EXISTS idx_users_overdue ON users(overdue_amount) WHERE overdue_amount > 0;
CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Payment Links
CREATE INDEX IF NOT EXISTS idx_payment_links_business ON payment_links(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_customer ON payment_links(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(business_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_links_stripe ON payment_links(stripe_payment_link_id) WHERE stripe_payment_link_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_links_expires ON payment_links(expires_at) WHERE status IN ('pending', 'sent');

-- Payment Transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_business ON payment_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(business_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created ON payment_transactions(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_pi ON payment_transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(business_id, payment_type, created_at DESC);

-- Subscriptions (additional)
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer ON subscriptions(customer_id);

-- Membership Plans
CREATE INDEX IF NOT EXISTS idx_membership_plans_business ON membership_plans(business_id);
CREATE INDEX IF NOT EXISTS idx_membership_plans_active ON membership_plans(business_id, is_active) WHERE is_active = true;

-- Activity Log
CREATE INDEX IF NOT EXISTS idx_activity_log_business ON payment_activity_log(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_customer ON payment_activity_log(customer_id, created_at DESC) WHERE customer_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE member_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Business staff manage imports" ON member_imports;
DROP POLICY IF EXISTS "Business staff manage plans" ON membership_plans;
DROP POLICY IF EXISTS "Business staff manage payment links" ON payment_links;
DROP POLICY IF EXISTS "Business staff view transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Business staff view activity log" ON payment_activity_log;

-- Member Imports: Business staff only
CREATE POLICY "Business staff manage imports"
ON member_imports FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- Membership Plans: Business staff only
CREATE POLICY "Business staff manage plans"
ON membership_plans FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- Payment Links: Business staff can manage, customers can view their own
CREATE POLICY "Business staff manage payment links"
ON payment_links FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
  OR customer_id = auth.uid()
);

-- Payment Transactions: Business staff can view, customers can view their own
CREATE POLICY "Business staff view transactions"
ON payment_transactions FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
  OR customer_id = auth.uid()
);

-- Activity Log: Business staff can view
CREATE POLICY "Business staff view activity log"
ON payment_activity_log FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_member_imports_updated_at ON member_imports;
CREATE TRIGGER update_member_imports_updated_at BEFORE UPDATE ON member_imports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_membership_plans_updated_at ON membership_plans;
CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON membership_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_links_updated_at ON payment_links;
CREATE TRIGGER update_payment_links_updated_at BEFORE UPDATE ON payment_links
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Log activity when payment link is created
CREATE OR REPLACE FUNCTION log_payment_link_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_activity_log (business_id, customer_id, action, details, actor_type)
  VALUES (
    NEW.business_id,
    NEW.customer_id,
    'payment_link_created',
    jsonb_build_object(
      'payment_link_id', NEW.id,
      'amount', NEW.amount,
      'purpose', NEW.purpose
    ),
    'system'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_payment_link_created ON payment_links;
CREATE TRIGGER trigger_log_payment_link_created
AFTER INSERT ON payment_links
FOR EACH ROW EXECUTE FUNCTION log_payment_link_created();

-- Function: Update user payment status when payment is received
CREATE OR REPLACE FUNCTION update_user_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
    -- Update user's overdue amount and payment status
    UPDATE users
    SET 
      overdue_amount = GREATEST(COALESCE(overdue_amount, 0) - NEW.amount, 0),
      payment_status = CASE 
        WHEN GREATEST(COALESCE(overdue_amount, 0) - NEW.amount, 0) = 0 THEN 'current'
        ELSE payment_status
      END,
      last_payment_date = NEW.paid_at
    WHERE id = NEW.customer_id;
    
    -- Mark payment link as paid if applicable
    IF NEW.payment_link_id IS NOT NULL THEN
      UPDATE payment_links
      SET 
        status = 'paid',
        paid_at = NEW.paid_at
      WHERE id = NEW.payment_link_id;
    END IF;
    
    -- Log activity
    INSERT INTO payment_activity_log (business_id, customer_id, action, details, actor_type)
    VALUES (
      NEW.business_id,
      NEW.customer_id,
      'payment_received',
      jsonb_build_object(
        'transaction_id', NEW.id,
        'amount', NEW.amount,
        'payment_type', NEW.payment_type,
        'stripe_payment_intent_id', NEW.stripe_payment_intent_id
      ),
      'system'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_on_payment ON payment_transactions;
CREATE TRIGGER trigger_update_user_on_payment
AFTER UPDATE ON payment_transactions
FOR EACH ROW 
WHEN (NEW.status = 'succeeded' AND OLD.status != 'succeeded')
EXECUTE FUNCTION update_user_on_payment();

-- =====================================================
-- VIEWS (for easier querying)
-- =====================================================

-- View: Customers with payment summary
CREATE OR REPLACE VIEW customers_with_payment_summary AS
SELECT 
  u.id,
  u.email,
  u.full_name,
  u.phone,
  u.overdue_amount,
  u.last_payment_date,
  u.payment_status,
  u.stripe_customer_id,
  COUNT(DISTINCT c.id) as children_count,
  COUNT(DISTINCT pt.id) FILTER (WHERE pt.status = 'succeeded') as total_payments,
  COALESCE(SUM(pt.amount) FILTER (WHERE pt.status = 'succeeded'), 0) as total_paid,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'active') as active_subscriptions,
  MAX(pt.paid_at) as last_successful_payment
FROM users u
LEFT JOIN children c ON c.parent_id = u.id
LEFT JOIN payment_transactions pt ON pt.customer_id = u.id
LEFT JOIN subscriptions s ON s.customer_id = u.id
WHERE u.user_type = 'customer'
GROUP BY u.id;

-- View: Business revenue summary (monthly)
CREATE OR REPLACE VIEW business_revenue_summary AS
SELECT
  business_id,
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE status = 'succeeded') as successful_payments,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
  COALESCE(SUM(amount) FILTER (WHERE status = 'succeeded'), 0) as total_revenue,
  COALESCE(SUM(amount) FILTER (WHERE payment_type = 'one_time'), 0) as one_time_revenue,
  COALESCE(SUM(amount) FILTER (WHERE payment_type = 'overdue_recovery'), 0) as recovery_revenue,
  COALESCE(SUM(amount) FILTER (WHERE payment_type IN ('subscription_initial', 'subscription_recurring')), 0) as subscription_revenue,
  COUNT(DISTINCT customer_id) as unique_customers
FROM payment_transactions
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
GROUP BY business_id, DATE_TRUNC('month', created_at)
ORDER BY business_id, month DESC;

-- View: Overdue customers per business
CREATE OR REPLACE VIEW overdue_customers_by_business AS
SELECT
  b.id as business_id,
  b.name as business_name,
  COUNT(DISTINCT bs.customer_id) as total_customers,
  COUNT(DISTINCT u.id) FILTER (WHERE u.overdue_amount > 0) as overdue_customers,
  COALESCE(SUM(u.overdue_amount), 0) as total_overdue_amount,
  COALESCE(AVG(u.overdue_amount) FILTER (WHERE u.overdue_amount > 0), 0) as avg_overdue_amount
FROM businesses b
LEFT JOIN bookings bs ON bs.business_id = b.id
LEFT JOIN users u ON u.id = bs.customer_id AND u.overdue_amount > 0
GROUP BY b.id, b.name;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function: Get business revenue metrics
CREATE OR REPLACE FUNCTION get_business_revenue_metrics(
  p_business_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT DATE_TRUNC('month', CURRENT_DATE),
  p_end_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
RETURNS TABLE (
  expected_revenue DECIMAL,
  collected_revenue DECIMAL,
  outstanding_revenue DECIMAL,
  active_subscriptions INTEGER,
  failed_payments INTEGER,
  recovery_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    -- Expected: active subscriptions + overdue amounts
    (SELECT COALESCE(SUM(mp.price_monthly), 0)
     FROM subscriptions s
     JOIN membership_plans mp ON mp.id = s.plan_id
     WHERE s.business_id = p_business_id AND s.status = 'active') +
    (SELECT COALESCE(SUM(u.overdue_amount), 0)
     FROM users u
     WHERE u.id IN (SELECT DISTINCT customer_id FROM bookings WHERE business_id = p_business_id)
       AND u.overdue_amount > 0) as expected,
    
    -- Collected: successful payments in period
    (SELECT COALESCE(SUM(amount), 0)
     FROM payment_transactions
     WHERE business_id = p_business_id
       AND status = 'succeeded'
       AND created_at BETWEEN p_start_date AND p_end_date) as collected,
    
    -- Outstanding: current overdue amounts
    (SELECT COALESCE(SUM(u.overdue_amount), 0)
     FROM users u
     WHERE u.id IN (SELECT DISTINCT customer_id FROM bookings WHERE business_id = p_business_id)
       AND u.overdue_amount > 0) as outstanding,
    
    -- Active subscriptions
    (SELECT COUNT(*)::INTEGER
     FROM subscriptions
     WHERE business_id = p_business_id AND status = 'active') as active_subs,
    
    -- Failed payments in period
    (SELECT COUNT(*)::INTEGER
     FROM payment_transactions
     WHERE business_id = p_business_id
       AND status = 'failed'
       AND created_at BETWEEN p_start_date AND p_end_date) as failed,
    
    -- Recovery rate: (recovered amount / total sent) * 100
    (SELECT 
      CASE 
        WHEN SUM(pl.amount) > 0 THEN
          (COUNT(*) FILTER (WHERE pl.status = 'paid')::DECIMAL / COUNT(*)::DECIMAL * 100)
        ELSE 0
      END
     FROM payment_links pl
     WHERE pl.business_id = p_business_id
       AND pl.purpose = 'overdue_recovery'
       AND pl.created_at BETWEEN p_start_date AND p_end_date) as recovery;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- DONE! 
-- =====================================================

-- Verify tables created
DO $$ 
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN (
      'member_imports',
      'membership_plans',
      'payment_links',
      'payment_transactions',
      'payment_activity_log'
    );
  
  RAISE NOTICE '✅ Payment Recovery System created successfully!';
  RAISE NOTICE '📊 New tables created: %', table_count;
  RAISE NOTICE '🔧 Existing tables extended: users, businesses, subscriptions';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Next steps:';
  RAISE NOTICE '1. Dashboard → Settings → Connect Stripe account';
  RAISE NOTICE '2. Dashboard → Plans → Create membership pricing tiers';
  RAISE NOTICE '3. Dashboard → Members → Import CSV with overdue balances';
  RAISE NOTICE '4. Dashboard → Members → Send payment links';
  RAISE NOTICE '';
  RAISE NOTICE '💰 Ready to recover payments!';
END $$;
