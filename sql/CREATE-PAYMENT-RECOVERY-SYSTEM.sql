-- =====================================================
-- PAYMENT RECOVERY & SUBSCRIPTION MANAGEMENT SYSTEM
-- Run this in Supabase SQL Editor
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. MEMBER IMPORTS (CSV tracking)
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
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 2. MEMBERS (extends or creates new)
-- =====================================================

-- Check if members table exists, if not create it
CREATE TABLE IF NOT EXISTS members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Parent/Guardian info
  parent_email TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT,
  
  -- Child info
  child_name TEXT,
  child_age INTEGER,
  child_date_of_birth DATE,
  
  -- Membership details
  membership_tier TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'overdue', 'cancelled', 'paused')),
  overdue_amount DECIMAL(10,2) DEFAULT 0,
  last_payment_date TIMESTAMPTZ,
  
  -- Stripe
  stripe_customer_id TEXT,
  
  -- Metadata
  notes TEXT,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If members table already exists from children table, you may want to merge or rename

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
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- Stripe details
  stripe_payment_link_id TEXT,
  stripe_checkout_session_id TEXT,
  stripe_payment_link_url TEXT,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  purpose TEXT NOT NULL CHECK (purpose IN ('overdue_payment', 'subscription_start', 'one_time')),
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'viewed', 'paid', 'expired', 'cancelled')),
  sent_at TIMESTAMPTZ,
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
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  
  -- Link to source
  payment_link_id UUID REFERENCES payment_links(id),
  subscription_id UUID, -- References subscriptions(id) - added after subscriptions table
  
  -- Stripe details
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_invoice_id TEXT,
  
  -- Payment details
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'AED',
  payment_type TEXT NOT NULL CHECK (payment_type IN ('one_time', 'subscription_initial', 'subscription_recurring', 'refund')),
  payment_method TEXT, -- 'card', 'bank_transfer', etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'disputed')),
  failure_reason TEXT,
  
  -- Timestamps
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 6. SUBSCRIPTIONS (recurring memberships)
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  membership_plan_id UUID NOT NULL REFERENCES membership_plans(id),
  
  -- Stripe details
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'cancelled', 'paused', 'incomplete', 'trialing')),
  
  -- Billing cycle
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  
  -- Cancellation
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancel_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  
  -- Pausing
  pause_collection BOOLEAN DEFAULT false,
  paused_at TIMESTAMPTZ,
  resume_at TIMESTAMPTZ,
  
  -- Payment tracking
  failed_payment_count INTEGER DEFAULT 0,
  last_payment_date TIMESTAMPTZ,
  next_payment_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Now add foreign key to payment_transactions
ALTER TABLE payment_transactions
ADD CONSTRAINT fk_subscription
FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE SET NULL;

-- =====================================================
-- 7. ACTIVITY LOG (audit trail)
-- =====================================================

CREATE TABLE IF NOT EXISTS payment_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  
  -- Action details
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  
  -- Who did it
  user_id UUID REFERENCES users(id),
  ip_address TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES (for performance)
-- =====================================================

-- Members
CREATE INDEX IF NOT EXISTS idx_members_business_id ON members(business_id);
CREATE INDEX IF NOT EXISTS idx_members_business_status ON members(business_id, status);
CREATE INDEX IF NOT EXISTS idx_members_overdue ON members(business_id, overdue_amount) WHERE overdue_amount > 0;
CREATE INDEX IF NOT EXISTS idx_members_email ON members(parent_email);
CREATE INDEX IF NOT EXISTS idx_members_stripe ON members(stripe_customer_id) WHERE stripe_customer_id IS NOT NULL;

-- Payment Links
CREATE INDEX IF NOT EXISTS idx_payment_links_business ON payment_links(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_member ON payment_links(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_links_status ON payment_links(business_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_links_stripe ON payment_links(stripe_payment_link_id) WHERE stripe_payment_link_id IS NOT NULL;

-- Payment Transactions
CREATE INDEX IF NOT EXISTS idx_payment_transactions_business ON payment_transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_member ON payment_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(business_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created ON payment_transactions(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_stripe_pi ON payment_transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;

-- Subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_business ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_member ON subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(business_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON subscriptions(stripe_subscription_id) WHERE stripe_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_payment ON subscriptions(business_id, next_payment_date) WHERE status = 'active';

-- Membership Plans
CREATE INDEX IF NOT EXISTS idx_membership_plans_business ON membership_plans(business_id);
CREATE INDEX IF NOT EXISTS idx_membership_plans_active ON membership_plans(business_id, is_active) WHERE is_active = true;

-- Activity Log
CREATE INDEX IF NOT EXISTS idx_activity_log_business ON payment_activity_log(business_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_member ON payment_activity_log(member_id, created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_activity_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Business staff access own members" ON members;
DROP POLICY IF EXISTS "Business staff manage imports" ON member_imports;
DROP POLICY IF EXISTS "Business staff manage plans" ON membership_plans;
DROP POLICY IF EXISTS "Business staff manage payment links" ON payment_links;
DROP POLICY IF EXISTS "Business staff view transactions" ON payment_transactions;
DROP POLICY IF EXISTS "Business staff manage subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Business staff view activity log" ON payment_activity_log;

-- Members: Business staff can CRUD their own members
CREATE POLICY "Business staff access own members"
ON members FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

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

-- Payment Links: Business staff only
CREATE POLICY "Business staff manage payment links"
ON payment_links FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- Payment Transactions: Business staff read-only
CREATE POLICY "Business staff view transactions"
ON payment_transactions FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- Subscriptions: Business staff can manage
CREATE POLICY "Business staff manage subscriptions"
ON subscriptions FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- Activity Log: Business staff read-only
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
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_imports_updated_at BEFORE UPDATE ON member_imports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_membership_plans_updated_at BEFORE UPDATE ON membership_plans
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_links_updated_at BEFORE UPDATE ON payment_links
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_transactions_updated_at BEFORE UPDATE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Log activity when payment link is created
CREATE OR REPLACE FUNCTION log_payment_link_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO payment_activity_log (business_id, member_id, action, details)
  VALUES (
    NEW.business_id,
    NEW.member_id,
    'payment_link_created',
    jsonb_build_object(
      'payment_link_id', NEW.id,
      'amount', NEW.amount,
      'purpose', NEW.purpose
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_payment_link_created
AFTER INSERT ON payment_links
FOR EACH ROW EXECUTE FUNCTION log_payment_link_created();

-- Function: Update member status when payment is received
CREATE OR REPLACE FUNCTION update_member_on_payment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND NEW.payment_type IN ('one_time', 'subscription_initial') THEN
    -- Clear overdue amount
    UPDATE members
    SET 
      overdue_amount = GREATEST(overdue_amount - NEW.amount, 0),
      status = CASE 
        WHEN overdue_amount - NEW.amount <= 0 THEN 'active'
        ELSE status
      END,
      last_payment_date = NEW.paid_at
    WHERE id = NEW.member_id;
    
    -- Log activity
    INSERT INTO payment_activity_log (business_id, member_id, action, details)
    VALUES (
      NEW.business_id,
      NEW.member_id,
      'payment_received',
      jsonb_build_object(
        'transaction_id', NEW.id,
        'amount', NEW.amount,
        'payment_type', NEW.payment_type
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_member_on_payment
AFTER INSERT OR UPDATE ON payment_transactions
FOR EACH ROW EXECUTE FUNCTION update_member_on_payment();

-- =====================================================
-- VIEWS (for easier querying)
-- =====================================================

-- View: Members with payment summary
CREATE OR REPLACE VIEW members_with_payment_summary AS
SELECT 
  m.*,
  COUNT(DISTINCT pt.id) FILTER (WHERE pt.status = 'succeeded') as total_payments,
  COALESCE(SUM(pt.amount) FILTER (WHERE pt.status = 'succeeded'), 0) as total_paid,
  MAX(pt.paid_at) as last_payment_date,
  s.id as active_subscription_id,
  s.status as subscription_status,
  mp.name as subscription_plan_name,
  mp.price_monthly as subscription_price
FROM members m
LEFT JOIN payment_transactions pt ON pt.member_id = m.id
LEFT JOIN subscriptions s ON s.member_id = m.id AND s.status IN ('active', 'trialing')
LEFT JOIN membership_plans mp ON mp.id = s.membership_plan_id
GROUP BY m.id, s.id, mp.name, mp.price_monthly;

-- View: Business revenue summary
CREATE OR REPLACE VIEW business_revenue_summary AS
SELECT
  business_id,
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) FILTER (WHERE status = 'succeeded') as successful_payments,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_payments,
  COALESCE(SUM(amount) FILTER (WHERE status = 'succeeded'), 0) as total_revenue,
  COALESCE(SUM(amount) FILTER (WHERE payment_type = 'one_time'), 0) as one_time_revenue,
  COALESCE(SUM(amount) FILTER (WHERE payment_type IN ('subscription_initial', 'subscription_recurring')), 0) as subscription_revenue
FROM payment_transactions
GROUP BY business_id, DATE_TRUNC('month', created_at);

-- =====================================================
-- SAMPLE DATA (for testing)
-- =====================================================

-- Add stripe_account_id column to businesses if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'businesses' AND column_name = 'stripe_account_id'
  ) THEN
    ALTER TABLE businesses ADD COLUMN stripe_account_id TEXT;
    ALTER TABLE businesses ADD COLUMN stripe_account_status TEXT DEFAULT 'pending';
  END IF;
END $$;

-- =====================================================
-- DONE! 
-- =====================================================

-- Verify tables created
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN (
    'members',
    'member_imports',
    'membership_plans',
    'payment_links',
    'payment_transactions',
    'subscriptions',
    'payment_activity_log'
  )
ORDER BY table_name;

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Payment Recovery System tables created successfully!';
  RAISE NOTICE '📊 Next steps:';
  RAISE NOTICE '1. Set up Stripe Connect in business dashboard';
  RAISE NOTICE '2. Create membership plans';
  RAISE NOTICE '3. Import members via CSV';
  RAISE NOTICE '4. Send payment links!';
END $$;
