# 📝 Payment Template Editor - Complete Guide

## Overview
Edit and test your payment reminder message templates before sending them to customers. Perfect for customizing the tone, language, and urgency of your payment chase messages.

---

## 🚀 Quick Start

1. **Navigate to Payment Templates**
   - Dashboard → Messaging → Payment Templates

2. **Edit Your Templates**
   - Three templates for different urgency levels
   - Use variables: `{name}`, `{amount}`, `{days}`, `{payment_link}`
   - Format with *bold* text for WhatsApp

3. **Test Before Sending**
   - Enter YOUR phone number
   - Set test values (name, amount, days overdue)
   - Preview the message
   - Send test to yourself

4. **Save Templates**
   - Click "Save Templates"
   - Templates will be used for all payment reminders

---

## 📋 Three Template Types

### 1. Early Reminder (1-7 days overdue)
**Tone:** Friendly, polite reminder

**Default Template:**
```
Hi {name},

Friendly reminder from RAK Life Academy:

Your account has an outstanding balance of *AED {amount}*.

Pay securely here:
{payment_link}

Questions? Reply to this message or call +971501234567.

Thank you! 🙏
```

**When it's sent:**
- Customer is 1-7 days overdue
- First reminder in the payment chase sequence
- Gentle approach to maintain relationship

---

### 2. Medium Urgency (8-14 days overdue)
**Tone:** More direct, clear deadline

**Default Template:**
```
Hi {name},

Your account balance is now *{days} days overdue*.

⚠️ Amount Due: *AED {amount}*

Please pay today:
{payment_link}

Need help? Contact us: +971501234567

RAK Life Academy
```

**When it's sent:**
- Customer is 8-14 days overdue
- Second reminder level
- Increased urgency with warning emoji

---

### 3. Urgent (15+ days overdue)
**Tone:** Strong, action-required

**Default Template:**
```
🚨 URGENT - {name}

Your account is *{days} days overdue*.

Amount: *AED {amount}*

PAY NOW to avoid service interruption:
{payment_link}

Need payment plan? Call +971501234567 IMMEDIATELY.

RAK Life Academy Billing
```

**When it's sent:**
- Customer is 15+ days overdue
- Final reminder level
- Strong language about consequences

---

## 🎯 Available Variables

| Variable | Description | Example Output |
|----------|-------------|----------------|
| `{name}` | Customer's first name | Ahmed |
| `{amount}` | Overdue amount | 1050 |
| `{days}` | Days overdue | 14 |
| `{payment_link}` | Stripe payment URL | https://pay.stripe.com/... |

**Usage in templates:**
```
Hi {name},                          → Hi Ahmed,
You owe AED {amount}                → You owe AED 1050
{days} days overdue                 → 14 days overdue
Pay here: {payment_link}            → Pay here: https://pay.stripe.com/...
```

---

## 📱 WhatsApp Formatting

### Bold Text
```
*Your text here* → Your text here (bold)
```

Use bold for:
- Amounts: `*AED {amount}*`
- Urgent words: `*PAY NOW*`
- Days overdue: `*{days} days overdue*`

### Emojis
```
🙏 Thank you
⚠️ Warning
🚨 Urgent
💰 Money
📱 Phone
✅ Checkmark
```

### Line Breaks
```
Hi {name},

[blank line = line break]

Your message here...
```

---

## 🧪 Testing Your Templates

### Step-by-Step Test Process:

1. **Enter Your Phone Number**
   ```
   +971501234567
   ```
   Include country code!

2. **Set Test Values**
   - Customer Name: Ahmed (or your name)
   - Amount: 1050 (or any test amount)
   - Days Overdue: 7, 10, or 20 (to test different templates)

3. **Preview the Message**
   - See exactly how it will look
   - Check variable replacements
   - Verify formatting

4. **Send Test**
   - Click "Send Test Message"
   - Check your WhatsApp
   - Verify formatting, links, emojis

5. **Adjust & Re-test**
   - Make changes to template
   - Test again until perfect
   - Then save templates

---

## 💡 Template Best Practices

### General Guidelines:
✅ Keep under 500 characters
✅ One clear call-to-action
✅ Include payment link
✅ Include contact info
✅ Be professional but friendly
✅ Match your brand voice
✅ Test on actual WhatsApp

### Early Template:
✅ Friendly tone
✅ "Reminder" not "warning"
✅ Thank you message
✅ Offer to help
❌ Don't threaten
❌ Don't use urgent language

### Medium Template:
✅ More direct
✅ Mention days overdue
✅ Use warning emoji ⚠️
✅ "Please pay today"
✅ Still offer help
❌ Don't be aggressive

### Urgent Template:
✅ Strong language
✅ Mention consequences
✅ ALL CAPS for emphasis
✅ Urgent emoji 🚨
✅ Call to action: "PAY NOW"
✅ Offer payment plan option

---

## 🎨 Customization Examples

### Example 1: Fitness Academy
```
🏋️ Hi {name},

Quick reminder about your membership dues:

Amount: *AED {amount}*

Keep your momentum going! Pay now:
{payment_link}

Questions? WhatsApp us: +971501234567

Stay strong! 💪
RAK Life Academy
```

### Example 2: School/Education
```
📚 Dear {name},

This is a friendly reminder about your tuition payment.

Outstanding balance: *AED {amount}*

Secure payment link:
{payment_link}

For payment plans, contact our office at +971501234567.

Thank you,
RAK Life Academy Administration
```

### Example 3: Membership Club
```
⭐ Hi {name}!

Your membership payment is overdue.

Amount due: *AED {amount}*
Days overdue: *{days} days*

Renew now to continue enjoying benefits:
{payment_link}

Need help? Reply to this message!

{businessName} Team 🙌
```

---

## 🔧 Setup Instructions

### 1. Database Setup (One-time)

Run in Supabase SQL Editor:
```sql
-- File: sql/ADD-PAYMENT-TEMPLATES-COLUMN.sql
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS payment_templates JSONB DEFAULT NULL;
```

### 2. Access the Editor

Dashboard → Messaging → Payment Templates

### 3. Customize Your Templates

- Edit the three templates
- Use variables where needed
- Add your business info
- Match your brand voice

### 4. Test Thoroughly

- Test with YOUR phone number
- Try all three templates (change days overdue: 5, 10, 20)
- Check formatting on actual WhatsApp
- Verify links are clickable

### 5. Save Templates

- Click "Save Templates"
- Confirm success message
- Templates now active for all customers

---

## 🔄 How Templates Are Used

When you send payment links (bulk or individual):

```
IF days_overdue <= 7:
    USE Early Template
    
ELSE IF days_overdue <= 14:
    USE Medium Template
    
ELSE:
    USE Urgent Template
```

**Example Workflow:**
1. Customer is 5 days overdue → Gets Early template
2. Customer is 10 days overdue → Gets Medium template
3. Customer is 20 days overdue → Gets Urgent template

---

## 📊 Template Strategy

### Recommended Schedule:

| Days Overdue | Template | Action |
|--------------|----------|--------|
| 3-7 | Early | First reminder |
| 10-14 | Medium | Second reminder |
| 20+ | Urgent | Final notice |
| 30+ | Manual | Phone call + urgent template |

### A/B Testing:
1. Test two versions of same template
2. Send to 10 customers each
3. Track response rates
4. Use winning version

---

## 🚨 Common Mistakes to Avoid

❌ **Too aggressive early on**
- Don't use "URGENT" for 3 days overdue
- Save strong language for 15+ days

❌ **Too long**
- Keep under 500 characters
- One message, one action

❌ **Missing payment link**
- Always include {payment_link}
- Make it easy to pay

❌ **No contact info**
- Always include phone number
- Offer help with payment

❌ **Inconsistent tone**
- Match your brand voice across all templates
- Professional ≠ robotic

❌ **Not testing**
- Always test on real WhatsApp
- Send to yourself first
- Check all three templates

---

## 📱 Integration with Payment System

### Where Templates Are Used:

1. **Bulk Send (Members Page)**
   - Select overdue customers
   - Click "Send Payment Links"
   - System picks template based on days overdue

2. **Individual Send**
   - Open customer profile
   - Click "Send Payment Link"
   - Appropriate template used

3. **Auto Chase (if enabled)**
   - Automatic sending based on schedule
   - Template selected by days overdue

### Template Selection Logic:
```typescript
function getTemplate(daysOverdue: number) {
  if (daysOverdue > 14) return urgentTemplate;
  if (daysOverdue > 7) return mediumTemplate;
  return earlyTemplate;
}
```

---

## 🎓 Training Your Team

### Show them:
1. Where to access templates
2. How to edit safely
3. How to test before saving
4. What each template is for

### Best practices:
- Test after any changes
- Keep backups of working templates
- Don't change during active campaigns
- Document custom variables

---

## 🔐 Security & Privacy

✅ **Authentication required**
- Must be logged in
- Must have business access

✅ **Business isolation**
- Each business has own templates
- Can't see other businesses' templates

✅ **Activity logged**
- All test messages logged
- Template saves tracked
- Audit trail maintained

✅ **Safe testing**
- Test messages don't affect customers
- Send to your own number only

---

## 📁 Files Reference

| File | Purpose |
|------|---------|
| `app/dashboard/payment-templates/page.tsx` | Page container |
| `app/dashboard/payment-templates/PaymentTemplatesEditor.tsx` | Main UI |
| `app/api/payment-templates/save/route.ts` | Save templates API |
| `app/api/payment-templates/test/route.ts` | Test send API |
| `sql/ADD-PAYMENT-TEMPLATES-COLUMN.sql` | Database setup |

---

## 🐛 Troubleshooting

### Templates not saving?
1. Check browser console for errors
2. Verify you're logged in
3. Ensure business access
4. Try refresh and save again

### Test message not arriving?
1. Verify phone number format (+countrycode)
2. Check WhatsApp connection status
3. Ensure WhatsApp is connected in Settings
4. Try sending to different number

### Variables not replacing?
1. Check spelling: `{name}` not `{Name}`
2. Ensure correct syntax: `{amount}` not `{{amount}}`
3. Save templates before testing
4. Refresh page and try again

### Formatting looks wrong?
1. Test on actual WhatsApp (not preview alone)
2. Use `*bold*` for WhatsApp markdown
3. Check for extra spaces
4. Verify line breaks

---

## ✅ Pre-Launch Checklist

Before using with customers:

- [ ] Database column added
- [ ] All three templates customized
- [ ] Business info added (name, phone)
- [ ] Variables tested and working
- [ ] Formatting checked on WhatsApp
- [ ] Test sent to your phone (all 3 templates)
- [ ] Team trained on how to use
- [ ] Templates saved successfully
- [ ] Response plan ready (for customer replies)
- [ ] Backup of templates kept

---

## 🎯 Success Metrics

Track these to improve:
- **Open rate:** % who read message
- **Click rate:** % who click payment link
- **Payment rate:** % who actually pay
- **Response rate:** % who reply
- **Time to payment:** Days from message to payment

### Example Goals:
- Early template: 40% payment rate
- Medium template: 30% payment rate
- Urgent template: 20% payment rate

---

## 📈 Continuous Improvement

### Monthly Review:
1. Check which template performs best
2. Review customer feedback
3. Test new variations
4. Update based on results

### Seasonal Adjustments:
- Holiday periods: More lenient
- Start of month: More direct
- End of month: Standard approach

---

**Last Updated:** 2026-03-11  
**Version:** 1.0  
**Status:** ✅ Production Ready

Happy template editing! 📝✨
