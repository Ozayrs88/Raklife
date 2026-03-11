# 💰 Payment Recovery System - Quick Start

**Problem Solved:** Sports academies lose AED 150,000+ due to manual payment collection.

**Solution:** Automated payment recovery system with Stripe integration.

---

## ⚡ 3-Step Setup

### 1. Run SQL Migration
```bash
# In Supabase SQL Editor, run:
CREATE-PAYMENT-RECOVERY-SYSTEM-FIXED.sql
```

### 2. Configure Stripe
```bash
# Add to business-dashboard/.env.local:
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Start App
```bash
cd business-dashboard
npm install
npm run dev
```

---

## 🎯 How It Works

### For Academy Owner:

1. **Import Members** → Upload CSV with overdue balances
2. **Send Payment Links** → Bulk send Stripe payment links
3. **Track Payments** → See real-time collections on dashboard

### For Parents:

1. **Receive Link** → Get secure Stripe payment link
2. **Choose Option** → Pay balance only OR pay + subscribe
3. **Complete Payment** → Stripe handles everything securely

---

## 📊 Features

✅ CSV member import  
✅ Bulk payment link creation  
✅ Stripe Connect integration  
✅ Automatic payment tracking  
✅ Subscription management  
✅ Revenue metrics dashboard  
✅ Failed payment monitoring  
✅ Complete audit trail  

---

## 📁 Key Files

**Pages:**
- `/dashboard/members` - Member management
- `/dashboard/members/import` - CSV import
- `/dashboard/plans` - Membership plans

**API:**
- `/api/members/import` - Import handler
- `/api/payment-links/bulk-create` - Payment link creator
- `/api/webhooks/stripe` - Stripe webhook

---

## 🚀 Usage Example

```csv
# members.csv
parent_email,parent_name,phone,child_name,overdue_amount
ahmed@test.com,Ahmed Ali,+971501234567,Sara,1050.00
```

1. Upload CSV → 150 members imported
2. Select all → Send payment links
3. Parents pay → AED 127,500 collected (85% recovery rate)
4. **Result:** Recovered AED 127,500 in 2 weeks

---

## 💡 Next Steps

1. Run the SQL migration (5 min)
2. Set up Stripe (10 min)
3. Import your first 10 members (2 min)
4. Send payment links (1 min)
5. Monitor dashboard as payments arrive

**Full documentation:** See `PAYMENT-RECOVERY-SETUP.md`

---

Built with Next.js + Supabase + Stripe Connect
