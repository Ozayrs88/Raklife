# 🗺️ Payment Recovery System - Where Everything Is

## 📍 Quick Access Map

### Dashboard Pages

**Payment Recovery Dashboard**
- URL: `/dashboard/payment-recovery`
- What's here: Main dashboard with metrics, auto-chase configuration, recovery stats
- Use for: Monitoring overdue payments, configuring automated chases

**Members Management**
- URL: `/dashboard/members`
- What's here: List of all members, filter by overdue, select & send payment links
- Use for: Viewing all 300 members, selecting 150 overdue ones, bulk actions

**CSV Import**
- URL: `/dashboard/members/import`
- What's here: CSV upload interface, download template, import results
- Use for: Uploading your 300 members with overdue amounts

**Stripe Settings**
- URL: `/dashboard/settings`
- What's here: Business info + **NEW Stripe Connection Section**
- Use for: Connecting your Stripe account, viewing connection status

---

## 🔧 Stripe Connection - Quick Setup

### Option 1: Through Dashboard (Easiest)

1. Go to: `/dashboard/settings`
2. Scroll to **"Payment Settings (Stripe)"** section
3. You'll see:
   - If connected: Green box showing account details
   - If not connected: Orange warning + "Connect Stripe Account" button
4. Click **"Connect Stripe Account"** (opens Stripe dashboard)

### Option 2: Manual Setup (For Testing)

In the **Settings → Payment Settings** section, there's a gray box with manual SQL:

```sql
UPDATE businesses
SET stripe_account_id = 'acct_xxxxx',  -- Your Stripe Account ID
    stripe_account_status = 'connected',
    stripe_charges_enabled = true
WHERE id = 'your-business-id';
```

**To get your Stripe Account ID:**
1. Go to https://dashboard.stripe.com/settings/account
2. Look for "Account ID" (starts with `acct_`)
3. Copy it and run the SQL above in Supabase

---

## 📂 File Locations

### Frontend Components

```
business-dashboard/app/dashboard/
├── payment-recovery/
│   ├── page.tsx                    # Main page
│   └── PaymentRecoveryContent.tsx  # Dashboard UI
├── members/
│   ├── page.tsx                    # Members list
│   ├── MembersContent.tsx          # Members UI
│   └── import/
│       ├── page.tsx
│       └── ImportMembersContent.tsx
└── settings/
    ├── page.tsx                    # Settings page (with Stripe)
    └── SettingsContent.tsx         # Settings UI (UPDATED)
```

### API Routes

```
business-dashboard/app/api/
├── members/
│   └── import/route.ts             # CSV import API
├── payment-links/
│   └── bulk-create/route.ts        # Create payment links
├── payment-recovery/
│   ├── schedule-chase/route.ts     # Save/get chase schedule
│   └── auto-chase/route.ts         # Automated chasing (cron)
└── stripe/
    └── webhook/route.ts            # Stripe webhooks
```

### Database Scripts

```
ZEA RAKlife/
├── CREATE-PAYMENT-RECOVERY-SYSTEM-FIXED.sql  # Main schema
├── ADD-CHASE-SCHEDULE.sql                    # Chase schedule fields
└── members-import-template.csv               # Sample CSV
```

### Documentation

```
ZEA RAKlife/
├── QUICK-START-PAYMENT-RECOVERY.md   # 5-min quick start
├── PAYMENT-RECOVERY-SETUP.md         # Full setup guide
├── DEPLOYMENT-CHECKLIST.md           # Deploy checklist
└── EMAIL-SMS-TEMPLATES.md            # Email/SMS templates
```

---

## 🎯 Your 5-Step Workflow

### Step 1: Setup Database
**Where:** Supabase Dashboard → SQL Editor
**Run:**
1. `CREATE-PAYMENT-RECOVERY-SYSTEM-FIXED.sql`
2. `ADD-CHASE-SCHEDULE.sql`

### Step 2: Connect Stripe
**Where:** `/dashboard/settings`
**Do:** Scroll to "Payment Settings (Stripe)" → Connect account

### Step 3: Import Members
**Where:** `/dashboard/members/import`
**Do:** Upload your CSV with 300 members

### Step 4: Configure Auto-Chase
**Where:** `/dashboard/payment-recovery`
**Do:**
- Review/edit schedule
- Toggle "Auto Chase: Enabled"
- Click "Save Schedule"

### Step 5: Send Payment Links
**Where:** `/dashboard/members`
**Do:**
- Filter: "Overdue"
- Click "Select All Overdue" (150 members)
- Click "Send Payment Links (150)"

---

## 🔍 Finding Specific Features

### To view recovery metrics:
→ `/dashboard/payment-recovery`
- Total overdue amount
- Number of overdue customers
- Links sent/paid
- Recovery rate

### To filter overdue members:
→ `/dashboard/members`
- Click "Overdue" button at top
- Shows only customers with balance > 0

### To download CSV template:
→ `/dashboard/members/import`
- Click "Download Template" button

### To check Stripe connection:
→ `/dashboard/settings`
- Scroll to "Payment Settings (Stripe)"
- Green box = connected
- Orange box = not connected

### To manually trigger chase:
```bash
curl https://your-domain.com/api/payment-recovery/auto-chase
```

---

## 📋 Environment Variables Location

**File:** `business-dashboard/.env.local`

```bash
# Stripe Settings (Add these)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Get Stripe keys from:**
https://dashboard.stripe.com/test/apikeys

---

## 🚀 Starting the App

```bash
cd business-dashboard
npm run dev
```

Then open: http://localhost:3000/dashboard/settings

---

## 📊 Data Flow

```
CSV Upload → Database (users table)
↓
View Members → Filter Overdue
↓
Send Payment Links → Stripe API
↓
Links Created → Stored in payment_links table
↓
Customer Pays → Stripe Webhook
↓
Database Updated → Overdue amount reduced
```

---

## 🔐 Database Tables Created

**Main Tables:**
- `member_imports` - Track CSV imports
- `payment_links` - All payment links created
- `payment_transactions` - All payments received
- `payment_activity_log` - Audit trail
- `membership_plans` - Pricing tiers (optional)

**Updated Tables:**
- `users` - Added: overdue_amount, payment_status, stripe_customer_id
- `businesses` - Added: stripe_account_id, payment_chase_schedule, auto_chase_enabled
- `subscriptions` - Added: stripe_subscription_id, stripe_customer_id

---

## 🎨 Navigation Menu

After implementation, you'll see:

```
Dashboard Sidebar:
├── Overview
│   ├── Dashboard
│   └── Analytics
├── Management
│   ├── Bookings
│   ├── Customers
│   ├── Members        ← NEW
│   ├── Services
│   └── Pricing
├── Payments           ← NEW SECTION
│   └── Payment Recovery
├── Schedule
│   ├── Time Slots
│   ├── Calendar
│   └── Staff
└── Settings
    └── Business Settings (includes Stripe)
```

---

## 💡 Quick Troubleshooting

### "Can't see Members menu"
→ Refresh browser, sidebar added with "Members" and "Payment Recovery"

### "Stripe section not showing in Settings"
→ Page just updated, hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### "CSV import not working"
→ Check format matches template exactly (use provided `members-import-template.csv`)

### "Payment links not creating"
→ First connect Stripe in Settings, then enable charges

### "Auto-chase not running"
→ Deploy to Vercel with `vercel.json` (already created) for cron to work

---

## ✅ Everything You Need

**Database:** ✅ Schema files created
**Frontend:** ✅ All pages built
**API:** ✅ All routes created
**Settings:** ✅ Stripe configuration added
**Docs:** ✅ Complete guides ready
**Sample:** ✅ CSV template provided

**Ready to go!** Just follow the 5 steps above. 🚀

---

## 📞 Key URLs to Bookmark

- Local Dashboard: http://localhost:3000/dashboard
- Settings: http://localhost:3000/dashboard/settings
- Members: http://localhost:3000/dashboard/members
- Import: http://localhost:3000/dashboard/members/import
- Recovery: http://localhost:3000/dashboard/payment-recovery
- Stripe: https://dashboard.stripe.com
- Supabase: https://supabase.com/dashboard

---

**Last Updated:** March 10, 2026
**Status:** Complete & Ready to Use ✅
