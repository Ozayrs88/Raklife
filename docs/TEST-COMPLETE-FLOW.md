# 🧪 COMPLETE END-TO-END TEST - Payment Recovery System

## ✅ Pre-Flight Check

Before starting, make sure:
- [ ] All API keys are in `.env.local`
- [ ] Server is running on `http://localhost:3001`
- [ ] You have access to Supabase dashboard
- [ ] Your phone joined Twilio WhatsApp sandbox

---

## 🔥 TEST FLOW (30 mins)

### Part 1: Account Setup (5 mins)

**1.1 Create Test Business Account**
```
1. Go to: http://localhost:3001/signup
2. Create account:
   - Business Name: "Test Sports Academy"
   - Email: your-email+test@gmail.com
   - Password: TestPass123
3. ✅ Should redirect to /dashboard
```

**1.2 Connect Stripe**
```
1. Go to: http://localhost:3001/dashboard/settings
2. Click "Connect Stripe Account"
3. Complete Stripe Connect flow
4. ✅ Should show "Connected" status
```

---

### Part 2: Import Members (10 mins)

**2.1 Download Template**
```
1. Go to: http://localhost:3001/dashboard/members/import
2. Click "Download Template"
3. Edit CSV with 3 test members:

parent_email,parent_name,phone,child_name,child_age,overdue_amount,last_payment_date
your-email+test1@gmail.com,Ahmed Ali,+971501234567,Sara,8,1050.00,2024-12-15
your-email+test2@gmail.com,Fatima Hassan,+971502345678,Omar,6,840.00,2024-11-20
your-email+test3@gmail.com,Ali Mohammed,+971503456789,Layla,7,1260.00,2024-10-30
```

**2.2 Upload CSV**
```
1. Still on /dashboard/members/import
2. Upload your edited CSV
3. Click "Import Members"
4. ✅ Should show: "3 members imported successfully"
```

**2.3 Verify Import**
```
1. Go to: http://localhost:3001/dashboard/members
2. ✅ Should see 3 members listed
3. ✅ Should show overdue amounts
4. ✅ Should show "Overdue" status badges
```

---

### Part 3: Payment Recovery Dashboard (5 mins)

**3.1 View Metrics**
```
1. Go to: http://localhost:3001/dashboard/payment-recovery
2. Check metrics:
   - ✅ Total Overdue: AED 3,150
   - ✅ Overdue Customers: 3
   - ✅ Links Sent: 0
   - ✅ Recovery Rate: 0%
```

**3.2 Configure Chase Schedule**
```
1. Still on Payment Recovery page
2. Review chase schedule:
   - Day 7: Email
   - Day 14: Email + WhatsApp
   - Day 21: Email + WhatsApp
   - Day 30: WhatsApp only
3. Click "Save Schedule"
4. ✅ Should show: "Schedule saved"
```

**3.3 Enable Auto-Chase**
```
1. Toggle "Auto Chase" to ON
2. ✅ Should show: "Auto Chase: Enabled"
```

---

### Part 4: Send Payment Links (10 mins)

**4.1 Manual Send (From Members Page)**
```
1. Go to: http://localhost:3001/dashboard/members
2. Select all 3 members (checkboxes)
3. Click "Send Payment Links (3)"
4. ✅ Should see success message
5. ✅ Check browser console for any errors
```

**4.2 Verify in Supabase**
```
1. Go to: Supabase Dashboard
2. Open "payment_links" table
3. ✅ Should see 3 new rows
4. ✅ Each should have:
   - stripe_payment_link_id (not null)
   - stripe_payment_link_url (starts with https://pay.stripe.com/)
   - status = 'active'
```

**4.3 Check Activity Log**
```
1. Go to: Supabase Dashboard
2. Open "payment_activity_log" table
3. ✅ Should see 3 entries:
   - action_type = 'payment_link_created'
   - Each linked to a member
```

---

### Part 5: Test Email Sending (5 mins)

**5.1 Trigger Manual Chase**
```
Method 1 - Via API (Postman/curl):
curl -X POST http://localhost:3001/api/payment-recovery/auto-chase \
  -H "Content-Type: application/json"

Method 2 - Via Browser Console:
fetch('/api/payment-recovery/auto-chase', { method: 'POST' })
```

**5.2 Check Your Email**
```
1. Check inbox for: your-email+test1@gmail.com
2. ✅ Should receive payment reminder email
3. ✅ Should have:
   - Subject: "Payment Reminder from Test Sports Academy"
   - Customer name: Ahmed Ali
   - Amount: AED 1,050
   - Blue "Pay Now" button
   - Professional formatting
```

---

### Part 6: Test WhatsApp (5 mins)

**6.1 Verify Sandbox Setup**
```
1. Open WhatsApp on your phone
2. ✅ Should have conversation with Twilio (+1 415 523 8886)
3. ✅ Should see "Sandbox: connected" message
```

**6.2 Send Test WhatsApp**
```
Via browser console on Payment Recovery page:

fetch('/api/notifications/send-whatsapp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to_phone: '+971501234567', // YOUR phone that joined sandbox
    customer_name: 'Ahmed',
    overdue_amount: 1050,
    days_overdue: 14,
    payment_link: 'https://pay.stripe.com/test_xxx',
    business_name: 'Test Sports Academy'
  })
})
```

**6.3 Check WhatsApp**
```
1. Check your phone
2. ✅ Should receive WhatsApp from Twilio
3. ✅ Should have:
   - Warning emoji ⚠️
   - Customer name
   - Overdue amount
   - Payment link
```

---

## 🐛 TROUBLESHOOTING

### ❌ "Stripe not connected"
```
1. Check .env.local has correct Stripe keys
2. Restart server: pkill -f "next dev" && npm run dev
3. Go to Settings → Click "Connect Stripe" again
```

### ❌ "Email not sending"
```
1. Check RESEND_API_KEY in .env.local
2. Check server console for errors
3. Verify Resend dashboard shows API calls
4. Test with curl:
   curl -X POST http://localhost:3001/api/notifications/send-email \
     -H "Content-Type: application/json" \
     -d '{"to_email":"you@example.com","customer_name":"Test","overdue_amount":100,"days_overdue":7,"payment_link":"https://example.com","business_name":"Test"}'
```

### ❌ "WhatsApp not sending"
```
1. Did you join the sandbox? Send "join <code>" to +1 415 523 8886
2. Check TWILIO credentials in .env.local
3. Check Twilio console for errors
4. Verify phone number format: +971501234567 (with +)
```

### ❌ "Import failed"
```
1. Check CSV format matches template exactly
2. No extra spaces or special characters
3. Overdue amount is number (1050.00, not "AED 1,050")
4. Date format: YYYY-MM-DD (2024-12-15)
```

### ❌ "No members showing"
```
1. Check browser console for errors
2. Go to Supabase → "users" table
3. Verify users exist with user_type = 'customer'
4. Check business_id matches your business
```

---

## ✅ SUCCESS CRITERIA

If everything works, you should have:

- [x] Business account created
- [x] Stripe connected
- [x] 3 members imported
- [x] Payment links created for all 3
- [x] Email received with payment reminder
- [x] WhatsApp received with payment reminder
- [x] Payment Recovery dashboard showing metrics
- [x] Auto-chase enabled
- [x] Activity logs in Supabase

---

## 🎯 DEMO PREP

For tomorrow's demo, you'll show:

1. **Member Import** - "Upload your 300 members in 30 seconds"
2. **Payment Recovery Dashboard** - "AED 165,000 overdue from 150 members"
3. **Auto-Chase Schedule** - "Set it once, forget it"
4. **Email/WhatsApp** - "Automatic reminders via both channels"
5. **Payment Links** - "Secure Stripe payment links sent automatically"
6. **Real-time tracking** - "See who paid, who's still overdue"

---

## 📞 NEED HELP?

Just run through this checklist. If something fails, check:
1. .env.local has all keys
2. Server restarted after adding keys
3. No errors in terminal
4. Supabase tables exist (run SQL scripts if needed)

**You've got this!** 🚀
