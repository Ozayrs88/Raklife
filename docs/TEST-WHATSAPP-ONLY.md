# 🧪 QUICK TEST - WhatsApp Payment Recovery

## Part 1: Create Test Account (2 mins)

1. Go to: http://localhost:3001/signup
2. Create account:
   - Business Name: "Test Sports Academy"
   - Email: your-email+test@gmail.com
   - Password: TestPass123
3. ✅ Should land on /dashboard

---

## Part 2: Connect Stripe (2 mins)

1. Go to: http://localhost:3001/dashboard/settings
2. Click "Connect Stripe Account"
3. Complete the flow (use test data)
4. ✅ Should show "Connected"

---

## Part 3: Import Test Members (5 mins)

**Create a CSV file:**

```csv
parent_email,parent_name,phone,child_name,child_age,overdue_amount,last_payment_date
test1@example.com,Ahmed Ali,+971501234567,Sara,8,1050.00,2024-12-15
test2@example.com,Fatima Hassan,+971502345678,Omar,6,840.00,2024-11-20
test3@example.com,Ali Mohammed,+971503456789,Layla,7,1260.00,2024-10-30
```

**Important:** Replace one of those phone numbers with YOUR phone (the one you used to join Twilio sandbox!)

Example:
```csv
parent_email,parent_name,phone,child_name,child_age,overdue_amount,last_payment_date
test1@example.com,Your Name,+447553674597,Sara,8,1050.00,2024-12-15
test2@example.com,Fatima Hassan,+971502345678,Omar,6,840.00,2024-11-20
test3@example.com,Ali Mohammed,+971503456789,Layla,7,1260.00,2024-10-30
```

**Upload:**
1. Go to: http://localhost:3001/dashboard/members/import
2. Upload your CSV
3. Click "Import Members"
4. ✅ Should see: "3 members imported"

---

## Part 4: View Members (1 min)

1. Go to: http://localhost:3001/dashboard/members
2. ✅ Should see 3 members
3. ✅ Should show overdue amounts
4. ✅ Should show "Overdue" badges

---

## Part 5: Send Payment Links (2 mins)

1. Still on Members page
2. Check the box next to the member with YOUR phone number
3. Click "Send Payment Links (1)"
4. ✅ Should see success message

**This creates the Stripe payment link.**

---

## Part 6: Test WhatsApp (5 mins)

Now let's manually send a WhatsApp notification.

**Open your browser console** (F12 or Cmd+Option+I)

Paste this code:

```javascript
fetch('/api/notifications/send-whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to_phone: '+447553674597',  // YOUR PHONE NUMBER
    customer_name: 'Your Name',
    overdue_amount: 1050,
    days_overdue: 14,
    payment_link: 'https://pay.stripe.com/test_YWNjdF8xT2JxeWcybklxTGdQWDBGLF9Sb1B',
    business_name: 'Test Sports Academy'
  })
})
.then(r => r.json())
.then(d => console.log('WhatsApp sent!', d))
.catch(e => console.error('Error:', e))
```

**Check your WhatsApp!** You should receive:

```
⚠️ PAYMENT REMINDER

Hi Your Name,

Your account with Test Sports Academy is 14 days overdue.

Amount due: *AED 1,050*

Please pay now to avoid service interruption:
[payment link]

Questions? Contact us.

Thank you!
Test Sports Academy
```

---

## Part 7: Check Payment Recovery Dashboard (1 min)

1. Go to: http://localhost:3001/dashboard/payment-recovery
2. ✅ Check metrics:
   - Total Overdue: AED 3,150
   - Overdue Customers: 3
   - Links Sent: 1

---

## 🎯 SUCCESS CRITERIA

If everything works:
- [x] Account created
- [x] Stripe connected
- [x] 3 members imported
- [x] Payment link created
- [x] WhatsApp received on your phone ← **KEY TEST**
- [x] Dashboard shows metrics

---

## 🐛 TROUBLESHOOTING

### WhatsApp not received?

1. **Did you join the sandbox?**
   - Send "join <code>" to +1 415 523 8886
   - Wait for confirmation

2. **Check phone number format:**
   - Must include country code: +447553674597 ✅
   - No spaces or dashes: +44 7553 674597 ❌

3. **Check server console:**
   - Look for errors in terminal
   - Should show: "WhatsApp sent successfully"

4. **Check Twilio logs:**
   - Go to: https://console.twilio.com/us1/monitor/logs/sms
   - See if message was attempted

---

## 📝 NOTES FOR DEMO

- WhatsApp only works for numbers that joined your sandbox (max ~10)
- For production, need to upgrade to WhatsApp Business API
- For demo tomorrow: Show WhatsApp to YOUR phone, mention email will work for all customers

---

**Ready to test? Start with Part 1!** 🚀
