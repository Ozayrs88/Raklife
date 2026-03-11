# 🔧 Quick Setup - Run These SQL Scripts

## Step 1: Add Auto-Confirm Settings

```sql
-- Copy from: ADD-AUTO-CONFIRM.sql

ALTER TABLE services 
  ADD COLUMN IF NOT EXISTS auto_confirm BOOLEAN DEFAULT false;

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS auto_confirm_bookings BOOLEAN DEFAULT false;

COMMENT ON COLUMN services.auto_confirm IS 'If true, bookings are auto-confirmed. If false, require manual approval.';
COMMENT ON COLUMN businesses.auto_confirm_bookings IS 'Global default for auto-confirming bookings';
```

---

## Step 2: Create Enrollment System

```sql
-- Copy from: CREATE-ENROLLMENT-SYSTEM.sql

-- Add enrollment tracking to subscriptions table
ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id),
  ADD COLUMN IF NOT EXISTS schedule_days INTEGER[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS pricing_plan_id UUID REFERENCES pricing_plans(id),
  ADD COLUMN IF NOT EXISTS pricing_option_id UUID REFERENCES pricing_options(id);

-- Update plan_id to be nullable
ALTER TABLE subscriptions ALTER COLUMN plan_id DROP NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_service_id ON subscriptions(service_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- RLS Policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Customers can view their own subscriptions
DROP POLICY IF EXISTS "Customers can view own subscriptions" ON subscriptions;
CREATE POLICY "Customers can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = customer_id);

-- Customers can create their own subscriptions
DROP POLICY IF EXISTS "Customers can create subscriptions" ON subscriptions;
CREATE POLICY "Customers can create subscriptions"
  ON subscriptions FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Business staff can view subscriptions for their business
DROP POLICY IF EXISTS "Staff can view business subscriptions" ON subscriptions;
CREATE POLICY "Staff can view business subscriptions"
  ON subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_staff bs
      WHERE bs.business_id = subscriptions.business_id
        AND bs.user_id = auth.uid()
    )
  );

-- Business staff can update subscriptions for their business
DROP POLICY IF EXISTS "Staff can update business subscriptions" ON subscriptions;
CREATE POLICY "Staff can update business subscriptions"
  ON subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_staff bs
      WHERE bs.business_id = subscriptions.business_id
        AND bs.user_id = auth.uid()
        AND bs.role IN ('owner', 'admin')
    )
  );
```

---

## Step 3: Optional - Add Attended Column to Bookings

```sql
-- If not already added

ALTER TABLE bookings 
  ADD COLUMN IF NOT EXISTS attended BOOLEAN DEFAULT NULL;

COMMENT ON COLUMN bookings.attended IS 'Whether customer attended the session (null = not yet happened, true = attended, false = no-show)';
```

---

## ✅ Verification

Run this to check everything is set up:

```sql
-- Check subscriptions table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name IN ('service_id', 'schedule_days', 'pricing_plan_id', 'pricing_option_id')
ORDER BY column_name;

-- Should return 4 rows

-- Check services has auto_confirm
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'services'
  AND column_name = 'auto_confirm';

-- Should return 1 row

-- Check bookings has attended
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'bookings'
  AND column_name = 'attended';

-- Should return 1 row
```

---

## 🎉 Done!

Once these SQL scripts run successfully, the entire enrollment system is ready to use!

**Next:** Test the flow end-to-end using `COMPLETE-ENROLLMENT-SYSTEM.md` checklist.
