# 🚀 Payment Recovery System - Deployment Checklist

## Pre-Deployment Setup

### ✅ 1. Database Setup
- [ ] Run `CREATE-PAYMENT-RECOVERY-SYSTEM-FIXED.sql` in Supabase SQL Editor
- [ ] Run `ADD-CHASE-SCHEDULE.sql` in Supabase SQL Editor
- [ ] Verify tables created: `member_imports`, `payment_links`, `payment_transactions`, `payment_activity_log`
- [ ] Verify columns added to `users`: `overdue_amount`, `payment_status`, `stripe_customer_id`
- [ ] Verify columns added to `businesses`: `payment_chase_schedule`, `auto_chase_enabled`

### ✅ 2. Environment Variables
Add to `.env.local`:

```bash
# Existing Supabase (should already be there)
NEXT_PUBLIC_SUPABASE_URL=https://xqktkocghagcwdlljcho.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NEW - Stripe Keys (get from https://dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

- [ ] Stripe publishable key added
- [ ] Stripe secret key added
- [ ] Stripe webhook secret added (after webhook setup)

### ✅ 3. Install Dependencies
```bash
cd business-dashboard
npm install
```

- [ ] All packages installed (Stripe package already in package.json)
- [ ] No dependency errors

### ✅ 4. Local Testing
```bash
npm run dev
```

- [ ] App starts on http://localhost:3000
- [ ] Can access `/dashboard/members`
- [ ] Can access `/dashboard/payment-recovery`
- [ ] No console errors

---

## Deployment Steps

### ✅ 5. Deploy to Vercel

```bash
# From business-dashboard folder
vercel --prod
```

OR use Vercel Dashboard:
1. Import Git repository
2. Select `business-dashboard` as root directory
3. Add environment variables
4. Deploy

- [ ] App deployed successfully
- [ ] No build errors
- [ ] Cron job automatically configured (from vercel.json)

### ✅ 6. Configure Stripe Webhook

1. **Go to Stripe Dashboard**
   - https://dashboard.stripe.com/test/webhooks

2. **Add Endpoint**
   - URL: `https://your-production-domain.vercel.app/api/stripe/webhook`
   - Events to listen for:
     - [x] `checkout.session.completed`
     - [x] `payment_intent.succeeded`
     - [x] `payment_intent.payment_failed`
     - [x] `customer.subscription.created`
     - [x] `customer.subscription.updated`
     - [x] `customer.subscription.deleted`

3. **Copy Webhook Signing Secret**
   - Starts with `whsec_`
   - Add to Vercel environment variables: `STRIPE_WEBHOOK_SECRET`

4. **Redeploy** (after adding webhook secret)

- [ ] Webhook endpoint added
- [ ] Events selected
- [ ] Signing secret copied
- [ ] Environment variable updated in Vercel
- [ ] App redeployed

### ✅ 7. Test Webhook

In Stripe Dashboard:
1. Go to Webhooks
2. Click your endpoint
3. Click "Send test webhook"
4. Select `payment_intent.succeeded`
5. Send

- [ ] Test webhook sent successfully
- [ ] No errors in response
- [ ] Check Vercel logs for webhook receipt

---

## Post-Deployment Setup

### ✅ 8. Connect Business Stripe Account

1. Login to your dashboard: `https://your-domain.vercel.app/login`
2. Go to `/dashboard/settings`
3. Click "Connect Stripe"
4. Complete Stripe Connect onboarding
5. Verify connection

- [ ] Stripe account connected
- [ ] Charges enabled
- [ ] Account status: "Connected"

### ✅ 9. Import Member Data

1. Prepare CSV file (see `members-import-template.csv`)
2. Go to `/dashboard/members/import`
3. Upload CSV with your 300 members
4. Wait for import to complete

- [ ] CSV uploaded
- [ ] Import completed successfully
- [ ] 300 members imported
- [ ] 150 members showing as overdue
- [ ] Total overdue amount displayed

### ✅ 10. Configure Auto-Chase Schedule

1. Go to `/dashboard/payment-recovery`
2. Review default schedule:
   - Day 7: Email
   - Day 14: Email + SMS
   - Day 21: Email + SMS
   - Day 30: SMS
3. Adjust if needed
4. Click "Save Schedule"

- [ ] Schedule configured
- [ ] Schedule saved successfully

### ✅ 11. Enable Auto-Chase

1. On `/dashboard/payment-recovery`
2. Toggle "Auto Chase: Enabled"
3. System will now run daily at 9 AM

- [ ] Auto-chase toggled ON
- [ ] Confirmation saved

### ✅ 12. Send Initial Payment Links

1. Go to `/dashboard/members`
2. Filter: "Overdue" (should show 150 members)
3. Click "Select All Overdue"
4. Click "Send Payment Links (150)"
5. Wait for processing

- [ ] All overdue members selected
- [ ] Payment links created successfully
- [ ] Links appear in Stripe dashboard
- [ ] Activity logged in system

---

## Verification & Testing

### ✅ 13. Verify Payment Links in Stripe

1. Go to Stripe Dashboard → Payment Links
2. Should see 150 new payment links
3. Each for corresponding overdue amount

- [ ] Payment links visible in Stripe
- [ ] Amounts match overdue balances
- [ ] Links are active

### ✅ 14. Test Complete Payment Flow

1. Copy a payment link from Stripe or database
2. Open in incognito browser
3. Complete test payment (use Stripe test card: 4242 4242 4242 4242)
4. Verify:
   - Payment recorded in Stripe
   - Webhook received
   - Database updated (overdue amount reduced)
   - Customer status changed to "Current"

- [ ] Test payment completed
- [ ] Webhook triggered
- [ ] Database updated
- [ ] Customer status updated

### ✅ 15. Test Auto-Chase (Manual Trigger)

```bash
curl https://your-domain.vercel.app/api/payment-recovery/auto-chase
```

- [ ] Request successful
- [ ] Response shows customers processed
- [ ] Activity logged in database
- [ ] No errors

### ✅ 16. Verify Cron Job

1. Wait 24 hours or check Vercel logs next day
2. Go to Vercel Dashboard → Deployments → Logs
3. Search for "auto-chase"
4. Should see daily execution at 9 AM

- [ ] Cron job running daily
- [ ] Executes at 9 AM UTC
- [ ] No errors in logs

---

## Monitoring & Maintenance

### Daily Monitoring

**Dashboard Checks** (2 minutes):
- [ ] Check `/dashboard/payment-recovery` for overnight payments
- [ ] Review recovery rate
- [ ] Check for any errors in activity log

**Vercel Logs** (1 minute):
- [ ] No webhook errors
- [ ] Cron job executing successfully
- [ ] No API failures

### Weekly Review

- [ ] Review recovery metrics
- [ ] Analyze which chase day performs best
- [ ] Adjust schedule if needed
- [ ] Check for any stuck payment links

### Monthly Tasks

- [ ] Import updated member data (CSV)
- [ ] Review monthly recovery report
- [ ] Send bulk reminder to remaining overdues
- [ ] Export data for accounting

---

## Success Metrics

Track these KPIs:

### Week 1
- [ ] 40-50% of payment links paid
- [ ] 60-75 successful payments
- [ ] ~AED 60,000-75,000 recovered

### Week 2
- [ ] Additional 20-30% paid
- [ ] 30-45 more payments
- [ ] ~AED 30,000-45,000 more recovered

### Week 3
- [ ] Additional 10-15% paid
- [ ] 15-22 more payments
- [ ] ~AED 15,000-22,000 more recovered

### Month 1 Target
- [ ] 70-95% total recovery rate
- [ ] 105-142 total payments
- [ ] ~AED 105,000-142,000 total recovered

---

## Troubleshooting Guide

### Issue: Cron not running
**Check:**
- [ ] `vercel.json` exists in project root
- [ ] Cron path is `/api/payment-recovery/auto-chase`
- [ ] App is deployed on Vercel Pro plan (required for crons)

### Issue: Webhooks failing
**Check:**
- [ ] Webhook URL is correct in Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- [ ] Endpoint is accessible (test with curl)

### Issue: Payment links not creating
**Check:**
- [ ] Stripe account connected to business
- [ ] `stripe_charges_enabled = true` in database
- [ ] Valid Stripe API keys in environment
- [ ] Customer has `overdue_amount > 0`

### Issue: Auto-chase not sending
**Check:**
- [ ] `auto_chase_enabled = true` in businesses table
- [ ] Chase schedule configured and saved
- [ ] Customers have `last_payment_date` set
- [ ] Payment links exist for customers

---

## Security Checklist

- [ ] Stripe keys are in environment variables (not in code)
- [ ] Webhook secret is secure
- [ ] RLS (Row Level Security) enabled on all tables
- [ ] Users can only see their own business data
- [ ] API routes verify user authentication
- [ ] Sensitive data logged appropriately

---

## Final Verification

### System Health Check:
- [ ] Database schema complete
- [ ] All API endpoints responding
- [ ] Stripe integration working
- [ ] Webhooks receiving events
- [ ] Cron job executing
- [ ] Members imported
- [ ] Payment links sent
- [ ] Auto-chase enabled
- [ ] First payments received
- [ ] Customer balances updating

---

## 🎉 System is Live!

If all items are checked, your payment recovery system is fully operational!

**Daily at 9 AM:**
- System checks overdue customers
- Sends automated reminders
- Tracks all activity

**When customers pay:**
- Stripe processes payment
- Webhook updates database
- Customer balance updated
- Status changed to "Current"

**Your job:**
- Monitor dashboard daily (2 min)
- Import monthly CSV updates
- Celebrate recovered payments! 💰

---

## Support & Resources

**Documentation:**
- Quick Start: `QUICK-START-PAYMENT-RECOVERY.md`
- Full Guide: `PAYMENT-RECOVERY-SETUP.md`
- Database Schema: `CREATE-PAYMENT-RECOVERY-SYSTEM-FIXED.sql`

**Helpful Links:**
- Stripe Dashboard: https://dashboard.stripe.com
- Supabase Dashboard: https://supabase.com/dashboard
- Vercel Dashboard: https://vercel.com/dashboard

**Need Help?**
- Check troubleshooting section above
- Review Vercel deployment logs
- Test each component individually
- Verify all environment variables

---

**Last Updated:** March 10, 2026
**Version:** 1.0
**Status:** Production Ready ✅
