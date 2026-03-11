# ⚡ QUICK SETUP - DO THIS NOW (15 mins)

## 📋 STEP-BY-STEP SETUP

### 1️⃣ Get Stripe Keys (5 mins)
```
🔗 https://dashboard.stripe.com/test/apikeys

Copy these two keys:
1. Publishable key (pk_test_...)
2. Secret key (sk_test_...)
```

### 2️⃣ Get Resend Key (5 mins)
```
🔗 https://resend.com/signup
→ Sign up
→ Go to: https://resend.com/api-keys
→ Create API Key
→ Copy: re_...
```

### 3️⃣ Get Twilio Keys (5 mins)
```
🔗 https://www.twilio.com/try-twilio
→ Sign up
→ Go to: https://console.twilio.com/
→ Copy Account SID: AC...
→ Copy Auth Token (click "Show")
→ WhatsApp number: whatsapp:+14155238886
```

---

## 🔧 UPDATE .ENV.LOCAL

Open: `/Users/ozayrsoge/ZEA RAKlife/business-dashboard/.env.local`

Replace these lines with YOUR actual keys:

```bash
# STRIPE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_[YOUR_KEY]
STRIPE_SECRET_KEY=sk_test_[YOUR_KEY]

# RESEND
RESEND_API_KEY=re_[YOUR_KEY]

# TWILIO
TWILIO_ACCOUNT_SID=AC[YOUR_SID]
TWILIO_AUTH_TOKEN=[YOUR_TOKEN]
```

---

## 🚀 RESTART SERVER

```bash
# In terminal:
cd "/Users/ozayrsoge/ZEA RAKlife/business-dashboard"
pkill -f "next dev"
npm run dev
```

---

## ✅ YOU'RE DONE!

All packages are installed ✅
Now just:
1. Add your API keys ↑
2. Restart server ↑
3. Follow TEST-COMPLETE-FLOW.md

---

## 📱 IMPORTANT: WhatsApp Sandbox

Before testing WhatsApp, you MUST:

1. Open WhatsApp on your phone
2. Send this to: `+1 415 523 8886`
   ```
   join <your-code>
   ```
   (Get your code from Twilio console)
3. Wait for confirmation

Without this, WhatsApp won't work!

---

## 🎯 WHAT'S READY:

✅ Packages installed (resend, twilio, stripe)
✅ API routes built (email, WhatsApp, payment links)
✅ Member import ready
✅ Payment Recovery dashboard ready
✅ Settings page with Stripe Connect ready

JUST NEED: Your API keys!

---

## 🆘 NEED HELP?

Check these files:
- `SETUP-API-KEYS.md` - Detailed key setup
- `TEST-COMPLETE-FLOW.md` - Full testing guide
- `WHATSAPP-EMAIL-SETUP.md` - Service setup details

Good luck! 🚀
