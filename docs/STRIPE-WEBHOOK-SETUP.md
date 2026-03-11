# Stripe Webhook Setup Guide

Your webhook endpoint is ready! Now you need to connect it to Stripe.

## 🎯 What This Does

When a customer pays via the Stripe payment link:
1. Stripe sends a webhook to your server
2. Your server automatically:
   - ✅ Marks the customer as "paid"
   - ✅ Clears their overdue amount
   - ✅ Updates last payment date
   - ✅ Marks the payment link as "paid"

## 📋 Setup Steps

### 1. Install Stripe CLI (for local testing)

```bash
brew install stripe/stripe-cli/stripe
```

### 2. Login to Stripe CLI

```bash
stripe login
```

### 3. Forward webhooks to your local server

In a NEW terminal, run:

```bash
stripe listen --forward-to http://localhost:3001/api/webhooks/stripe
```

This will output a webhook signing secret like: `whsec_xxxxxxxxxxxxx`

### 4. Add the webhook secret to .env.local

Copy the `whsec_` secret from step 3 and add to your `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### 5. Restart your dev server

```bash
# Stop the server (Ctrl+C)
npm run dev
```

## 🧪 Test It

1. Go to Members page
2. Send a payment link to your test member
3. Click the link and complete payment (use test card: `4242 4242 4242 4242`)
4. Check your terminal running `stripe listen` - you should see the webhook events
5. Go back to Members page - the member should now show as "paid" with 0 overdue!

## 🚀 Production Setup (for demo tomorrow)

For your demo, you have 2 options:

### Option A: Use Stripe CLI (Easiest)
- Keep `stripe listen` running during your demo
- Works perfectly for local demos

### Option B: Deploy to Vercel/Production
1. Deploy your app to Vercel
2. Go to: https://dashboard.stripe.com/test/webhooks
3. Click "Add endpoint"
4. Enter URL: `https://your-domain.com/api/webhooks/stripe`
5. Select events: `checkout.session.completed`, `payment_intent.succeeded`
6. Copy the signing secret and add to Vercel environment variables

## 🔍 Monitoring

Check your terminal running `npm run dev` for these logs:
- `✅ Webhook received: checkout.session.completed`
- `💳 Processing checkout completion`
- `✅ Payment processed for customer xxx`

## ❓ Troubleshooting

**Webhook not received?**
- Make sure `stripe listen` is running
- Check the webhook secret is in `.env.local`
- Restart dev server after adding the secret

**Payment not updating in system?**
- Check terminal logs for errors
- Verify the metadata (customer_id, business_id) is being set when creating payment links
