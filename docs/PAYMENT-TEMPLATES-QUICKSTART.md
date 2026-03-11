# 🎉 New Feature: Payment Template Editor

## What's New?

You can now **edit and test** your payment reminder messages before sending them to customers!

---

## 🚀 Access

**Dashboard → Messaging → Payment Templates**

Or go to: `/dashboard/payment-templates`

---

## ✨ Features

### 1. Edit Three Templates
- **Early Reminder** (1-7 days overdue) - Friendly
- **Medium Urgency** (8-14 days overdue) - More direct  
- **Urgent** (15+ days overdue) - Strong action required

### 2. Use Variables
- `{name}` - Customer first name
- `{amount}` - Overdue amount
- `{days}` - Days overdue
- `{payment_link}` - Payment URL

### 3. Test Before Sending
- Enter YOUR phone number
- Set test values (name, amount, days)
- Preview the message
- Send test to yourself
- Verify formatting on WhatsApp

### 4. Save Templates
- Click "Save Templates"
- Used automatically for all payment reminders
- System picks template based on days overdue

---

## 🧪 Quick Test

1. Go to Payment Templates page
2. Enter your phone: `+971501234567`
3. Set days overdue: `7` (tests early template)
4. Click "Send Test Message"
5. Check your WhatsApp! 📱

Change days overdue to `10` or `20` to test other templates.

---

## 💡 Why This Matters

✅ **Customize tone** to match your brand
✅ **Test safely** with your own number
✅ **See preview** before sending
✅ **No coding** required
✅ **Real-time editing**

---

## 📋 Setup Required

Run once in Supabase SQL Editor:

```sql
-- File: sql/ADD-PAYMENT-TEMPLATES-COLUMN.sql
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS payment_templates JSONB DEFAULT NULL;
```

---

## 📱 Example Templates

### Early (Friendly)
```
Hi {name},

Friendly reminder from RAK Life Academy:

Your account has an outstanding balance of *AED {amount}*.

Pay securely here:
{payment_link}

Questions? Call +971501234567.

Thank you! 🙏
```

### Urgent (Strong)
```
🚨 URGENT - {name}

Your account is *{days} days overdue*.

Amount: *AED {amount}*

PAY NOW to avoid service interruption:
{payment_link}

Need payment plan? Call +971501234567 IMMEDIATELY.

RAK Life Academy Billing
```

---

## 🎯 How It Works

When sending payment links:
- System checks days overdue
- Selects appropriate template
- Replaces variables with real data
- Sends via WhatsApp

**Example:**
- Customer "Ahmed" is 5 days overdue, owes AED 1050
- System uses Early template
- Replaces: `{name}` → Ahmed, `{amount}` → 1050
- Sends friendly reminder

---

## 📚 Full Documentation

See complete guide: `docs/PAYMENT-TEMPLATES-GUIDE.md`

---

## ✅ Next Steps

1. Run SQL setup (one-time)
2. Go to Payment Templates page
3. Customize templates for your business
4. Test with YOUR phone number
5. Save templates
6. Start using!

---

**Questions?** Check the full guide or test it yourself!

🎉 Happy messaging!
