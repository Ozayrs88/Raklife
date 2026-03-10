# 💰 Comprehensive Pricing System

## Overview
The RAKlife pricing system supports **multiple pricing models** to accommodate different business needs:
- Drop-in (pay per session)
- Monthly packages
- Term packages (quarterly/termly)
- Sibling discounts
- Custom pricing

---

## Setup Instructions

### 1. Run the SQL Migration

First, run this SQL in your Supabase SQL Editor:

```bash
# File: ADD-PRICING-SYSTEM.sql
```

This creates:
- `pricing_plans` table
- RLS policies for pricing plans
- Indexes for performance

### 2. Navigate to Pricing Page

Access via: `/dashboard/pricing`

---

## Features

### 📦 Plan Types

**1. Monthly Package**
- Fixed duration (usually 4 weeks)
- Set sessions per week
- Calculates cost per session automatically
- Example: "2x/week for 4 weeks = AED 400"

**2. Term Package** 
- Longer duration (8-12 weeks)
- Bulk discount pricing
- Great for quarterly commitments
- Example: "3x/week for 12 weeks = AED 1800"

**3. Sibling Discount**
- Percentage-based discount
- Applies to 2nd, 3rd+ children
- Automatic calculation
- Example: "10% off for 2nd child"

**4. Custom Pricing**
- Flexible pricing for special cases
- No session/week requirements
- For private lessons, events, etc.
- Example: "Private coaching = AED 500"

---

## How to Use

### Creating a Pricing Plan

1. Go to `/dashboard/pricing`
2. Click "Add Pricing Plan"
3. Select:
   - **Service**: Which service this applies to
   - **Plan Type**: Monthly, Term, Sibling, or Custom
   - **Plan Name**: e.g., "Monthly 2x/week"
   - **Sessions/Week**: How many times per week
   - **Duration**: Number of weeks
   - **Price**: Total package price
   - **Discount %**: (For sibling plans only)
   - **Description**: Optional notes

4. Click "Create Plan"

### Example Setups

**Scenario 1: Kids Football Academy**

Service: "Kids Football Training" (AED 50/session)

Pricing Plans:
- **Drop-in**: AED 50 (default)
- **Monthly (2x/week)**: AED 300 (vs 400 drop-in) = 25% savings
- **Term (2x/week, 12 weeks)**: AED 800 (vs 1200 drop-in) = 33% savings
- **Sibling Rate**: 10% off for 2nd child

**Scenario 2: Yoga Studio**

Service: "Yoga Class" (AED 75/session)

Pricing Plans:
- **Drop-in**: AED 75
- **Monthly Unlimited**: AED 500 (8+ sessions)
- **10-Class Pack**: AED 650 (custom, no weekly limit)
- **Couple's Rate**: AED 1200/month for 2 people (custom)

**Scenario 3: Swimming Lessons**

Service: "Swimming Lesson" (AED 100/session)

Pricing Plans:
- **Drop-in**: AED 100
- **Monthly (1x/week)**: AED 350
- **Monthly (2x/week)**: AED 650
- **Sibling 1st Child**: AED 350/month
- **Sibling 2nd Child**: AED 315/month (10% off)
- **Sibling 3rd Child**: AED 280/month (20% off)

---

## Pricing Calculator

The system **automatically calculates**:

```
Cost per session = Total Price / (Sessions per Week × Duration in Weeks)
```

Example:
- Package: AED 400
- 2 sessions/week × 4 weeks = 8 sessions
- **Cost per session: AED 50**

Compared to drop-in at AED 60:
- **Savings: AED 80 (16%)**

---

## Customer View (Coming Soon)

When customers book, they'll see:
- All available pricing options
- Savings vs drop-in
- Per-session breakdown
- Sibling discount eligibility

---

## Business Benefits

✅ **Increase revenue** - Encourage package purchases
✅ **Customer loyalty** - Monthly/term commitments
✅ **Sibling enrollments** - Family-friendly discounts
✅ **Flexible pricing** - Custom rates for special cases
✅ **Clear value** - Automatic savings calculator
✅ **Professional** - Multiple pricing tiers

---

## Database Schema

```sql
pricing_plans (
  id UUID PRIMARY KEY,
  service_id UUID → services(id),
  name TEXT,
  type TEXT (monthly | term | sibling | custom),
  sessions_per_week INTEGER,
  duration_weeks INTEGER,
  price DECIMAL,
  sibling_discount_percent DECIMAL,
  description TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

---

## Future Enhancements

- [ ] Auto-apply sibling discounts at checkout
- [ ] Family account management
- [ ] Membership auto-renewal
- [ ] Promo codes and seasonal discounts
- [ ] Usage tracking (sessions used/remaining)
- [ ] Package expiration dates
- [ ] Gift packages

---

## FAQ

**Q: Can I have multiple pricing plans per service?**
A: Yes! Create as many as you need.

**Q: Do customers see all pricing options?**
A: Yes, they can choose which plan to purchase.

**Q: Can I change pricing later?**
A: Yes, edit or delete plans anytime. Existing bookings unaffected.

**Q: How do sibling discounts work?**
A: Set a percentage off. System applies when booking multiple children.

**Q: What if I need a custom price for one customer?**
A: Use "Custom Pricing" type for special cases.

---

## Summary

The pricing system gives you **complete flexibility** to structure your business pricing:

📊 **4 pricing models** (Drop-in, Monthly, Term, Sibling)
💰 **Unlimited plans per service**
🧮 **Automatic calculations**
👨‍👩‍👧‍👦 **Family-friendly discounts**
✨ **Professional presentation**

**Your pricing strategy, your way!** 🚀
