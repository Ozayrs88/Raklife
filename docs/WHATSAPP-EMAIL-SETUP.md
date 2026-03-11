# 🚀 WHATSAPP + EMAIL SETUP GUIDE

## Quick Setup (Tomorrow - 2 Hours)

---

## 📧 EMAIL SETUP (30 mins)

### 1. Sign Up for Resend (10 mins)
```
1. Go to: https://resend.com/signup
2. Sign up with your email
3. Verify email
4. Go to: https://resend.com/api-keys
5. Click "Create API Key"
6. Copy the key (re_xxxxx)
```

### 2. Install & Configure (10 mins)
```bash
# Install Resend
cd business-dashboard
npm install resend

# Add to .env.local:
RESEND_API_KEY=re_xxxxx

# Restart server
npm run dev
```

### 3. Test Email (10 mins)
```
1. Go to: /api/notifications/send-email
2. Send test email
3. Check inbox
4. Verify formatting looks good
```

---

## 📱 WHATSAPP SETUP (1 hour)

### Option A: Twilio (Fastest - Recommended)

**1. Sign Up (15 mins)**
```
1. Go to: https://www.twilio.com/try-twilio
2. Sign up (need phone verification)
3. Complete onboarding
4. You'll get $15 free credit
```

**2. Enable WhatsApp (15 mins)**
```
1. Go to: https://console.twilio.com/
2. Click "Messaging" → "Try it out" → "Send a WhatsApp message"
3. Follow WhatsApp sandbox setup:
   - Send "join <your-code>" to Twilio WhatsApp number
   - From your phone
4. Test sending a message
```

**3. Get Credentials (10 mins)**
```
From https://console.twilio.com/:

Account SID: ACxxxxx (copy this)
Auth Token: Click "Show" → Copy
WhatsApp Number: whatsapp:+14155238886 (test number)
```

**4. Install & Configure (10 mins)**
```bash
# Install Twilio
npm install twilio

# Add to .env.local:
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Restart server
npm run dev
```

**5. Test WhatsApp (10 mins)**
```
1. Make sure you joined sandbox (step 2)
2. Test sending message to your phone
3. Verify you receive it
```

---

## 🎯 CHASE SCHEDULE (Already Configured)

Your auto-chase will now send:

```
Day 7 Overdue:
→ Email: Friendly reminder
→ WhatsApp: ❌ (email only)

Day 14 Overdue:
→ Email: Important notice
→ WhatsApp: ⚠️ Reminder

Day 21 Overdue:
→ Email: Urgent
→ WhatsApp: 🚨 Urgent

Day 30 Overdue:
→ Email: ❌ (WhatsApp only)
→ WhatsApp: 🚨 Final notice
```

---

## 📝 EMAIL TEMPLATES (Pre-Built)

**Day 7:** Friendly, blue button
**Day 14:** Warning, yellow box
**Day 21:** Urgent, red alert

All include:
- Customer name
- Overdue amount
- Payment link button
- Professional formatting

---

## 💬 WHATSAPP TEMPLATES (Pre-Built)

**Day 7:** 
```
Hi Ahmed,

Friendly reminder from Dubai Sports Academy:

Your account has an outstanding balance of *AED 1,050*.

Pay securely here:
[link]

Questions? Reply or call +971 50 123 4567.

Thank you! 🙏
```

**Day 21:**
```
🚨 URGENT - Ahmed

Your account is *21 days overdue*.

Amount: *AED 1,050*

PAY NOW to avoid service interruption:
[link]

Need payment plan? Call +971 50 123 4567 IMMEDIATELY.

Dubai Sports Academy Billing
```

---

## ⚠️ IMPORTANT NOTES

### Twilio WhatsApp Sandbox:
```
✅ FREE for testing
✅ Send to ANY number (that joined sandbox)
❌ Numbers must join your sandbox first
❌ Can only send to 5-10 numbers

For production (more than 10 customers):
Need to upgrade to Twilio WhatsApp Business API
~AED 0.15 per message
```

### For Friday Demo:
```
1. Use email for all customers
2. Show WhatsApp capability (send to YOUR phone)
3. Say: "WhatsApp integration ready, activating next week"
4. Don't promise what's not fully tested
```

---

## 🚀 QUICK START TOMORROW:

### Morning (Before gym work):
```bash
# 1. Sign up for Resend (10 mins)
https://resend.com/signup

# 2. Sign up for Twilio (20 mins)
https://www.twilio.com/try-twilio

# 3. Install packages (5 mins)
npm install resend twilio

# 4. Add API keys to .env.local (5 mins)
# Copy from dashboards

# 5. Restart server (1 min)
npm run dev

# 6. Test both (20 mins)
# Send test email to yourself
# Send test WhatsApp to your phone
```

---

## 💰 COSTS:

**Resend:**
- Free: 3,000 emails/month
- Paid: $20/month for 50,000 emails

**Twilio WhatsApp:**
- Sandbox: FREE (testing only)
- Production: ~AED 0.15 per message
- For 150 customers × 3 messages = 450 messages
- Cost: ~AED 70/month

**Total: ~AED 100/month for notifications**

---

## 🎯 FOR FRIDAY PITCH:

"The system sends automatic reminders via:
✅ Email (professional invoices)
✅ WhatsApp (instant notifications)

You configure the schedule:
- Day 7: Email
- Day 14: Email + WhatsApp  
- Day 21: WhatsApp urgent
- Day 30: Final notice

Set it and forget it."

---

## 📋 CHECKLIST:

Tomorrow Morning:
- [ ] Sign up for Resend
- [ ] Sign up for Twilio
- [ ] Get API keys
- [ ] Install packages
- [ ] Add to .env.local
- [ ] Restart server
- [ ] Test email to yourself
- [ ] Test WhatsApp to yourself

If time allows:
- [ ] Customize email templates
- [ ] Adjust WhatsApp messages
- [ ] Test chase schedule

---

**Email & WhatsApp are now BUILT and READY!**

Just need:
1. API keys (tomorrow morning)
2. Quick test
3. Ready for Friday! 🚀
