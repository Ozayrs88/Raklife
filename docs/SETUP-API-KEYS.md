# 🔑 API KEYS SETUP - DO THIS FIRST

## Copy these commands and run them:

```bash
cd "/Users/ozayrsoge/ZEA RAKlife/business-dashboard"
```

## Then edit .env.local and replace:

### 1. STRIPE KEYS
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_ACTUAL_KEY
STRIPE_SECRET_KEY=sk_test_YOUR_ACTUAL_KEY
```

Get from: https://dashboard.stripe.com/test/apikeys

---

### 2. RESEND (EMAIL)
```
RESEND_API_KEY=re_YOUR_ACTUAL_KEY
```

Get from: https://resend.com/api-keys

---

### 3. TWILIO (WHATSAPP)
```
TWILIO_ACCOUNT_SID=AC_YOUR_ACTUAL_SID
TWILIO_AUTH_TOKEN=YOUR_ACTUAL_TOKEN
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

Get from: https://console.twilio.com/

---

### 4. INSTALL PACKAGES
```bash
cd "/Users/ozayrsoge/ZEA RAKlife/business-dashboard"
npm install resend twilio
```

---

### 5. RESTART SERVER
```bash
# Kill old server
pkill -f "next dev"

# Start fresh
npm run dev
```

---

## ✅ VERIFICATION CHECKLIST:

- [ ] Stripe keys added (pk_test_ and sk_test_)
- [ ] Resend key added (re_)
- [ ] Twilio credentials added (AC_ and token)
- [ ] Packages installed (resend, twilio)
- [ ] Server restarted
- [ ] No errors in terminal

---

## 🚨 IMPORTANT FOR WHATSAPP:

Before you can receive WhatsApp messages, you MUST join the Twilio sandbox:

1. Send this message from YOUR phone: `join <code-from-twilio>`
2. To this number: `+1 415 523 8886`
3. You'll get a confirmation WhatsApp

Without this step, WhatsApp will NOT work!
