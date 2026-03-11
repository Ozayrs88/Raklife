# 💰 Payment Recovery & Subscription Management System

## 🎯 Problem Statement

Sports academies lose significant revenue due to:
- **Manual payment collection** (bank transfers)
- **Overdue payments** (example: 150 members × AED 1,000 = AED 150,000 outstanding)
- **No automated billing** system
- **Poor visibility** into payment health

## ✅ Solution Overview

A complete **payment recovery and subscription management system** that:

1. ✅ Imports existing members with overdue balances
2. ✅ Sends payment links to recover outstanding amounts
3. ✅ Converts one-time payers to recurring subscribers
4. ✅ Tracks payment health and revenue metrics
5. ✅ Uses **Stripe Connect** for multi-tenant payments

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────┐
│     Business Dashboard (Next.js)    │
│                                     │
│  ├─ Import Members (CSV)            │
│  ├─ View Overdue Balances           │
│  ├─ Send Payment Links              │
│  ├─ Track Payment Status            │
│  └─ Revenue Analytics               │
└──────────────┬──────────────────────┘
               │
               │ Supabase Client SDK
               │
┌──────────────▼──────────────────────┐
│         Supabase Backend            │
│                                     │
│  ├─ PostgreSQL (multi-tenant)       │
│  ├─ Row Level Security (RLS)        │
│  ├─ Edge Functions                  │
│  │   ├─ create-payment-link         │
│  │   ├─ process-payment             │
│  │   ├─ create-subscription         │
│  │   └─ handle-stripe-webhook       │
│  └─ Storage (CSV imports)           │
└──────────────┬──────────────────────┘
               │
               │ Stripe API
               │
┌──────────────▼──────────────────────┐
│         Stripe Connect              │
│                                     │
│  ├─ Payment Links (per academy)     │
│  ├─ Checkout Sessions               │
│  ├─ Subscriptions                   │
│  ├─ Automatic Retries               │
│  └─ Connected Accounts              │
└─────────────────────────────────────┘
               │
               │ Email/WhatsApp
               │
┌──────────────▼──────────────────────┐
│       Parent Payment Page           │
│                                     │
│  ├─ View Outstanding Balance        │
│  ├─ Pay Now (One-time)              │
│  ├─ Subscribe (Recurring)           │
│  └─ Choose Membership Plan          │
└─────────────────────────────────────┘
```

---

## 📊 Database Schema (Extension)

### New Tables

```sql
-- Import tracking
member_imports
  id                uuid PRIMARY KEY
  business_id       uuid REFERENCES businesses(id)
  file_name         text
  total_rows        integer
  processed_rows    integer
  successful_rows   integer
  failed_rows       integer
  status            enum('pending', 'processing', 'completed', 'failed')
  error_log         jsonb
  uploaded_by       uuid REFERENCES users(id)
  created_at        timestamptz

-- Members (extends existing or new)
members
  id                uuid PRIMARY KEY
  business_id       uuid REFERENCES businesses(id)
  parent_email      text NOT NULL
  parent_name       text NOT NULL
  parent_phone      text
  child_name        text
  child_age         integer
  child_date_of_birth date
  membership_tier   text (e.g., '2x/week', '3x/week')
  status            enum('active', 'overdue', 'cancelled', 'paused')
  overdue_amount    decimal(10,2) DEFAULT 0
  last_payment_date timestamptz
  stripe_customer_id text
  created_at        timestamptz
  updated_at        timestamptz

-- Payment links
payment_links
  id                uuid PRIMARY KEY
  business_id       uuid REFERENCES businesses(id)
  member_id         uuid REFERENCES members(id)
  stripe_payment_link_id text
  stripe_checkout_session_id text
  amount            decimal(10,2)
  currency          text DEFAULT 'AED'
  purpose           enum('overdue_payment', 'subscription_start', 'one_time')
  status            enum('pending', 'sent', 'viewed', 'paid', 'expired')
  sent_at           timestamptz
  viewed_at         timestamptz
  paid_at           timestamptz
  expires_at        timestamptz
  created_at        timestamptz

-- Membership plans (pricing tiers)
membership_plans
  id                uuid PRIMARY KEY
  business_id       uuid REFERENCES businesses(id)
  name              text (e.g., '1x per week', '2x per week')
  sessions_per_week integer
  price_monthly     decimal(10,2)
  currency          text DEFAULT 'AED'
  description       text
  stripe_price_id   text
  is_active         boolean DEFAULT true
  sort_order        integer
  created_at        timestamptz

-- Payment transactions
payment_transactions
  id                uuid PRIMARY KEY
  business_id       uuid REFERENCES businesses(id)
  member_id         uuid REFERENCES members(id)
  payment_link_id   uuid REFERENCES payment_links(id)
  subscription_id   uuid REFERENCES subscriptions(id)
  stripe_payment_intent_id text
  stripe_charge_id  text
  amount            decimal(10,2)
  currency          text DEFAULT 'AED'
  payment_type      enum('one_time', 'subscription_initial', 'subscription_recurring')
  status            enum('pending', 'succeeded', 'failed', 'refunded')
  failure_reason    text
  paid_at           timestamptz
  refunded_at       timestamptz
  created_at        timestamptz

-- Subscriptions (recurring memberships)
subscriptions
  id                uuid PRIMARY KEY
  business_id       uuid REFERENCES businesses(id)
  member_id         uuid REFERENCES members(id)
  membership_plan_id uuid REFERENCES membership_plans(id)
  stripe_subscription_id text
  stripe_customer_id text
  status            enum('active', 'past_due', 'cancelled', 'paused')
  current_period_start timestamptz
  current_period_end timestamptz
  cancel_at         timestamptz
  cancelled_at      timestamptz
  pause_collection  boolean DEFAULT false
  created_at        timestamptz
  updated_at        timestamptz

-- Activity log (audit trail)
payment_activity_log
  id                uuid PRIMARY KEY
  business_id       uuid REFERENCES businesses(id)
  member_id         uuid REFERENCES members(id)
  action            text (e.g., 'payment_link_sent', 'payment_received', 'subscription_created')
  details           jsonb
  user_id           uuid REFERENCES users(id)
  created_at        timestamptz
```

### Indexes (for performance)

```sql
CREATE INDEX idx_members_business_status ON members(business_id, status);
CREATE INDEX idx_members_overdue ON members(business_id, overdue_amount) WHERE overdue_amount > 0;
CREATE INDEX idx_payment_links_member ON payment_links(member_id, status);
CREATE INDEX idx_subscriptions_business ON subscriptions(business_id, status);
CREATE INDEX idx_payment_transactions_member ON payment_transactions(member_id, status);
```

---

## 🔄 Core Workflows

### 1. CSV Import & Member Setup

```typescript
// Flow:
1. Business uploads CSV file
2. System parses CSV (name, email, phone, child, overdue amount)
3. Create/update member records
4. Mark members with overdue_amount > 0 as 'overdue'
5. Display import summary

// CSV Format:
parent_email, parent_name, phone, child_name, child_age, overdue_amount, last_payment_date
ahmed@example.com, Ahmed Ali, +971501234567, Sara, 8, 1050, 2024-12-15
```

### 2. Send Payment Links

```typescript
// Flow:
1. Business selects overdue members
2. Click "Send Payment Link"
3. Edge function creates Stripe Payment Link
4. System sends email/SMS with link
5. Track status: sent → viewed → paid

// Payment Link Content:
Subject: Outstanding Balance - [Academy Name]
Body:
  Hi Ahmed,

  You have an outstanding balance of AED 1,050 for Sara's classes.
  
  Pay now: https://pay.stripe.com/xxx
  
  Questions? Contact us: [phone/email]
```

### 3. Parent Payment Flow

```typescript
// Parent clicks payment link:

1. Lands on custom Stripe Checkout page:
   ┌─────────────────────────────┐
   │   Parkour Academy           │
   │                             │
   │   Outstanding Balance       │
   │   AED 1,050                 │
   │                             │
   │   Options:                  │
   │   ○ Pay Balance Only        │
   │   ○ Pay + Start Membership  │
   │                             │
   │   [Continue]                │
   └─────────────────────────────┘

2. If "Pay + Start Membership":
   ┌─────────────────────────────┐
   │   Choose Your Plan          │
   │                             │
   │   ○ 1x/week - AED 220/mo    │
   │   ● 2x/week - AED 420/mo    │
   │   ○ 3x/week - AED 560/mo    │
   │                             │
   │   Total Today: AED 1,470    │
   │   (Balance + 1st month)     │
   │                             │
   │   [Pay Now]                 │
   └─────────────────────────────┘

3. Enter payment details (Stripe)
4. Payment processed
5. Redirect to success page
6. Receive confirmation email
```

### 4. Webhook Processing

```typescript
// Stripe sends webhooks to:
// https://[your-domain]/api/webhooks/stripe

Events to handle:
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.failed
- invoice.payment_succeeded
- invoice.payment_failed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted

Actions:
- Update member status
- Record payment transaction
- Create/update subscription
- Log activity
- Send confirmation email
```

### 5. Subscription Management

```typescript
// Automatic monthly billing:
1. Stripe charges card on billing date
2. If successful: extend subscription period
3. If failed: retry 3 times (Stripe automatic)
4. After retries fail: mark subscription 'past_due'
5. Notify business + member
6. Business can pause/cancel manually
```

---

## 🎨 Dashboard Features

### Members Page

```typescript
┌─────────────────────────────────────────────────────────┐
│  Members                                    [Import CSV] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Filters: [All] [Overdue] [Active] [Cancelled]          │
│  Search: [________________]                              │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Name           │ Balance  │ Status   │ Actions     │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Ahmed Ali      │ AED 1,050│ Overdue  │ [Send Link] │ │
│  │ (Sara, 8)      │          │          │ [View]      │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Fatima Hassan  │ AED 840  │ Link Sent│ [Resend]    │ │
│  │ (Omar, 6)      │          │          │ [View]      │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Ali Mohammed   │ -        │ Active   │ [View]      │ │
│  │ (Layla, 7)     │          │          │ [Manage]    │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Total Overdue: AED 150,000 (150 members)               │
└─────────────────────────────────────────────────────────┘
```

### Dashboard Metrics

```typescript
┌─────────────────────────────────────────────────────────┐
│  Revenue Overview                          [This Month]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Expected     │  │ Collected    │  │ Outstanding  │  │
│  │ AED 45,000   │  │ AED 32,500   │  │ AED 12,500   │  │
│  │ ↑ 15%        │  │ ↑ 12%        │  │ ↓ 8%         │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Active Subs  │  │ Failed       │  │ Recovery     │  │
│  │ 145          │  │ 8            │  │ Rate: 85%    │  │
│  │ ↑ 5          │  │ ↑ 2          │  │ ↑ 5%         │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Payment Links Page

```typescript
┌─────────────────────────────────────────────────────────┐
│  Payment Links                          [Create New]     │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Status: [All] [Sent] [Paid] [Expired]                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Member        │ Amount   │ Status   │ Sent         │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Ahmed Ali     │ AED 1,050│ Sent     │ 2 days ago   │ │
│  │               │          │ Viewed   │              │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Fatima Hassan │ AED 840  │ Paid ✓   │ 1 week ago   │ │
│  │               │          │          │              │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Ali Mohammed  │ AED 1,260│ Expired  │ 1 month ago  │ │
│  │               │          │          │ [Resend]     │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Member Detail Page

```typescript
┌─────────────────────────────────────────────────────────┐
│  Ahmed Ali                                  [Edit]       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Contact:                Child:                          │
│  ahmed@example.com      Sara (8 years old)               │
│  +971 50 123 4567                                        │
│                                                          │
│  Status: Overdue        Overdue Amount: AED 1,050        │
│  Last Payment: Dec 15, 2024                              │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Payment History                                    │ │
│  ├────────────────────────────────────────────────────┤ │
│  │ Mar 10, 2026  │ AED 420   │ Subscription - 2x/week │ │
│  │ Feb 10, 2026  │ AED 420   │ Subscription - 2x/week │ │
│  │ Jan 10, 2026  │ AED 420   │ Failed ✗               │ │
│  │ Dec 15, 2025  │ AED 840   │ One-time Payment       │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Actions:                                                │
│  [Send Payment Link] [Pause Subscription] [Contact]     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints (Edge Functions)

### 1. Create Payment Link

```typescript
// POST /api/payment-links/create

Request:
{
  business_id: "uuid",
  member_id: "uuid",
  amount: 1050,
  include_subscription: boolean,
  membership_plan_id?: "uuid"
}

Response:
{
  payment_link_id: "uuid",
  stripe_payment_link_url: "https://pay.stripe.com/...",
  expires_at: "2026-04-10T00:00:00Z"
}
```

### 2. Process Payment

```typescript
// POST /api/payments/process

Request (from Stripe webhook):
{
  event_type: "checkout.session.completed",
  session_id: "cs_xxx",
  payment_intent_id: "pi_xxx",
  amount: 1050,
  customer_id: "cus_xxx",
  subscription_id?: "sub_xxx"
}

Actions:
- Update member status
- Record transaction
- Clear overdue amount
- Create subscription if applicable
- Log activity
- Send confirmation email
```

### 3. Create Subscription

```typescript
// POST /api/subscriptions/create

Request:
{
  business_id: "uuid",
  member_id: "uuid",
  membership_plan_id: "uuid",
  stripe_customer_id: "cus_xxx",
  payment_method_id: "pm_xxx"
}

Response:
{
  subscription_id: "uuid",
  stripe_subscription_id: "sub_xxx",
  status: "active",
  current_period_end: "2026-04-10T00:00:00Z"
}
```

### 4. Import Members

```typescript
// POST /api/members/import

Request:
{
  business_id: "uuid",
  file_url: "https://..../members.csv"
}

Process:
1. Parse CSV
2. Validate data
3. Create/update members
4. Return summary

Response:
{
  import_id: "uuid",
  total_rows: 150,
  successful: 148,
  failed: 2,
  errors: [...]
}
```

---

## 💳 Stripe Integration

### Setup Stripe Connect

```typescript
// 1. Business connects Stripe account
// Dashboard → Settings → Payments → Connect Stripe

// Create connected account
const account = await stripe.accounts.create({
  type: 'express',
  country: 'AE',
  email: business.email,
  capabilities: {
    card_payments: { requested: true },
    transfers: { requested: true },
  },
  business_type: 'company',
  business_profile: {
    name: business.name,
    url: business.website,
  }
});

// Save stripe_account_id to businesses table
await supabase
  .from('businesses')
  .update({ stripe_account_id: account.id })
  .eq('id', business.id);

// Generate onboarding link
const accountLink = await stripe.accountLinks.create({
  account: account.id,
  refresh_url: `${BASE_URL}/dashboard/settings?stripe=refresh`,
  return_url: `${BASE_URL}/dashboard/settings?stripe=success`,
  type: 'account_onboarding',
});

// Redirect business to Stripe onboarding
return accountLink.url;
```

### Create Payment Links

```typescript
// Create price for overdue amount
const price = await stripe.prices.create({
  unit_amount: Math.round(amount * 100), // AED 1,050 → 105000
  currency: 'aed',
  product_data: {
    name: `Outstanding Balance - ${member.child_name}`,
  },
}, {
  stripeAccount: business.stripe_account_id
});

// Create payment link
const paymentLink = await stripe.paymentLinks.create({
  line_items: [
    {
      price: price.id,
      quantity: 1,
    },
  ],
  metadata: {
    business_id: business.id,
    member_id: member.id,
    payment_type: 'overdue_recovery',
  },
  after_completion: {
    type: 'redirect',
    redirect: {
      url: `${BASE_URL}/payment-success?member_id=${member.id}`,
    },
  },
}, {
  stripeAccount: business.stripe_account_id
});

return paymentLink.url;
```

### Create Subscription

```typescript
// Create recurring price for membership
const price = await stripe.prices.create({
  unit_amount: Math.round(plan.price_monthly * 100),
  currency: 'aed',
  recurring: {
    interval: 'month',
  },
  product_data: {
    name: `${business.name} - ${plan.name}`,
  },
}, {
  stripeAccount: business.stripe_account_id
});

// Create subscription
const subscription = await stripe.subscriptions.create({
  customer: stripe_customer_id,
  items: [{ price: price.id }],
  payment_behavior: 'default_incomplete',
  payment_settings: {
    payment_method_types: ['card'],
    save_default_payment_method: 'on_subscription',
  },
  expand: ['latest_invoice.payment_intent'],
  metadata: {
    business_id: business.id,
    member_id: member.id,
    membership_plan_id: plan.id,
  },
}, {
  stripeAccount: business.stripe_account_id
});

// Return client_secret for frontend confirmation
return subscription.latest_invoice.payment_intent.client_secret;
```

### Webhook Handling

```typescript
// /api/webhooks/stripe

// Verify webhook signature
const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body,
  sig,
  WEBHOOK_SECRET
);

// Handle events
switch (event.type) {
  case 'checkout.session.completed':
    await handleCheckoutComplete(event.data.object);
    break;
    
  case 'invoice.payment_succeeded':
    await handlePaymentSuccess(event.data.object);
    break;
    
  case 'invoice.payment_failed':
    await handlePaymentFailure(event.data.object);
    break;
    
  case 'customer.subscription.deleted':
    await handleSubscriptionCancelled(event.data.object);
    break;
}
```

---

## 📧 Email & WhatsApp Integration

### Using Resend for Email

```typescript
// Send payment link via email
import { Resend } from 'resend';

const resend = new Resend(RESEND_API_KEY);

await resend.emails.send({
  from: 'payments@youracademy.com',
  to: member.parent_email,
  subject: `Outstanding Balance - ${business.name}`,
  html: `
    <h2>Hi ${member.parent_name},</h2>
    <p>You have an outstanding balance of <strong>AED ${amount}</strong> for ${member.child_name}'s classes at ${business.name}.</p>
    
    <a href="${payment_link}" style="background: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
      Pay Now
    </a>
    
    <p>Or start a monthly membership and save!</p>
    
    <p>Questions? Contact us at ${business.phone} or ${business.email}</p>
  `,
});
```

### WhatsApp Integration (Optional)

```typescript
// Use Twilio or WhatsApp Business API
// Simple message with payment link

const message = `
Hi ${member.parent_name},

You have an outstanding balance of AED ${amount} for ${member.child_name}'s classes at ${business.name}.

Pay now: ${payment_link}

Questions? Call ${business.phone}
`;

// Send via Twilio WhatsApp API
await twilio.messages.create({
  from: 'whatsapp:+1234567890',
  to: `whatsapp:${member.parent_phone}`,
  body: message,
});
```

---

## 📱 Parent Payment Page

Create a custom Next.js page for a better payment experience:

```typescript
// /pay/[payment_link_id]/page.tsx

export default async function PaymentPage({ params }) {
  const { payment_link_id } = params;
  
  // Fetch payment link details
  const { data: paymentLink } = await supabase
    .from('payment_links')
    .select('*, member:members(*), business:businesses(*)')
    .eq('id', payment_link_id)
    .single();
    
  // Fetch membership plans
  const { data: plans } = await supabase
    .from('membership_plans')
    .select('*')
    .eq('business_id', paymentLink.business_id)
    .eq('is_active', true)
    .order('sort_order');
  
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="text-center mb-8">
        <img src={paymentLink.business.logo_url} className="w-24 h-24 mx-auto mb-4" />
        <h1 className="text-3xl font-bold">{paymentLink.business.name}</h1>
      </div>
      
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">Outstanding Balance</h2>
        <p className="text-4xl font-bold text-red-600">
          AED {paymentLink.amount}
        </p>
        <p className="text-gray-600 mt-2">
          For {paymentLink.member.child_name}'s classes
        </p>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Choose an option:</h3>
        
        <div className="border rounded-lg p-4 cursor-pointer hover:border-blue-500">
          <input type="radio" name="option" value="balance_only" />
          <label className="ml-3">
            <div className="font-medium">Pay Balance Only</div>
            <div className="text-sm text-gray-600">
              One-time payment of AED {paymentLink.amount}
            </div>
          </label>
        </div>
        
        {plans.map(plan => (
          <div key={plan.id} className="border rounded-lg p-4 cursor-pointer hover:border-blue-500">
            <input type="radio" name="option" value={plan.id} />
            <label className="ml-3">
              <div className="font-medium">
                Pay Balance + Start {plan.name} Membership
              </div>
              <div className="text-sm text-gray-600">
                AED {plan.price_monthly}/month (billed monthly)
              </div>
              <div className="text-lg font-semibold mt-2">
                Total today: AED {paymentLink.amount + plan.price_monthly}
              </div>
            </label>
          </div>
        ))}
      </div>
      
      <button className="w-full bg-blue-600 text-white py-4 rounded-lg mt-6 text-lg font-semibold">
        Continue to Payment
      </button>
    </div>
  );
}
```

---

## 📁 Folder Structure

```
/business-dashboard/
  app/
    dashboard/
      members/
        page.tsx                    # Members list
        import/
          page.tsx                  # CSV import
        [id]/
          page.tsx                  # Member detail
      payment-links/
        page.tsx                    # Payment links list
      subscriptions/
        page.tsx                    # Active subscriptions
      reports/
        revenue/
          page.tsx                  # Revenue reports
    pay/
      [payment_link_id]/
        page.tsx                    # Parent payment page
    api/
      webhooks/
        stripe/
          route.ts                  # Stripe webhook handler
      payment-links/
        create/
          route.ts                  # Create payment link
      subscriptions/
        create/
          route.ts                  # Create subscription
      members/
        import/
          route.ts                  # Import members
  components/
    members/
      MemberTable.tsx               # Members data table
      MemberImport.tsx              # CSV import UI
      SendPaymentLink.tsx           # Payment link modal
    payment-links/
      PaymentLinkTable.tsx          # Payment links list
      PaymentLinkStatus.tsx         # Status badges
    subscriptions/
      SubscriptionCard.tsx          # Subscription display
      ManageSubscription.tsx        # Pause/cancel
    dashboard/
      RevenueMetrics.tsx            # Revenue cards
      PaymentChart.tsx              # Revenue chart
  lib/
    stripe/
      connect.ts                    # Stripe Connect helpers
      payments.ts                   # Payment processing
      subscriptions.ts              # Subscription management
      webhooks.ts                   # Webhook handlers
    csv/
      parser.ts                     # CSV parsing
      validator.ts                  # Data validation
```

---

## 🚀 Implementation Plan (2-3 Weeks)

### Week 1: Foundation

**Days 1-2: Database Setup**
- ✅ Create new tables (members, payment_links, subscriptions, etc.)
- ✅ Set up RLS policies
- ✅ Create indexes
- ✅ Write seed data for testing

**Days 3-4: Stripe Integration**
- ✅ Set up Stripe Connect
- ✅ Create payment link generation
- ✅ Build webhook handler
- ✅ Test payment flow

**Days 5-7: CSV Import**
- ✅ Build CSV parser
- ✅ Create import UI
- ✅ Handle validation & errors
- ✅ Test with sample data

### Week 2: Core Features

**Days 8-10: Members Management**
- ✅ Members list page with filters
- ✅ Member detail page
- ✅ Send payment link functionality
- ✅ Track payment link status

**Days 11-12: Payment Flow**
- ✅ Parent payment page
- ✅ Stripe Checkout integration
- ✅ Success/failure handling
- ✅ Email notifications

**Days 13-14: Subscriptions**
- ✅ Membership plans setup
- ✅ Subscription creation flow
- ✅ Manage subscriptions (pause/cancel)
- ✅ Failed payment handling

### Week 3: Polish & Launch

**Days 15-16: Dashboard & Reports**
- ✅ Revenue metrics cards
- ✅ Payment charts
- ✅ Recovery rate tracking
- ✅ Export functionality

**Days 17-18: Testing**
- ✅ End-to-end testing
- ✅ Payment flow testing
- ✅ Webhook testing
- ✅ Edge cases

**Days 19-21: Launch Prep**
- ✅ Documentation
- ✅ Onboarding flow
- ✅ Support materials
- ✅ Soft launch with 1-2 academies

---

## 🎯 Success Metrics

### MVP Launch Criteria

- ✅ 3+ academies onboarded
- ✅ CSV import working
- ✅ Payment links sent & paid
- ✅ At least 1 subscription created
- ✅ Webhooks processing correctly
- ✅ Revenue metrics accurate

### 30-Day Goals

- 💰 Recover AED 50,000+ in overdue payments
- 📈 Convert 30% of overdue members to subscriptions
- ⚡ 90%+ payment link success rate
- 🎯 <5% failed payment rate
- ⭐ Net Promoter Score >40

---

## 💡 Key Principles

1. **Start Simple** - One-time payments first, subscriptions second
2. **Multi-tenant from Day 1** - Every table has business_id
3. **Stripe Connect** - Each academy has isolated payments
4. **Mobile-friendly** - Parents pay on phones
5. **Track Everything** - Activity logs for audit trail
6. **Security First** - RLS on all tables

---

## 🔒 Security Considerations

### RLS Policies

```sql
-- Members: Business staff see only their members
CREATE POLICY "Business staff access own members"
ON members FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- Payment links: Business staff only
CREATE POLICY "Business staff manage payment links"
ON payment_links FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- Transactions: Read-only for business staff
CREATE POLICY "Business staff view transactions"
ON payment_transactions FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);
```

### Webhook Security

```typescript
// Always verify Stripe webhook signatures
const signature = request.headers['stripe-signature'];

try {
  const event = stripe.webhooks.constructEvent(
    request.body,
    signature,
    WEBHOOK_SECRET
  );
  // Process event
} catch (err) {
  console.error('Webhook signature verification failed');
  return new Response('Unauthorized', { status: 401 });
}
```

---

## 📚 Next Steps

1. **Read this document thoroughly**
2. **Review database schema**
3. **Set up Stripe test account**
4. **Create database tables**
5. **Build CSV import first**
6. **Then payment links**
7. **Test with real data**
8. **Launch with pilot academy**

---

**You have the foundation. Let's build the payment recovery system on top! 🚀**
