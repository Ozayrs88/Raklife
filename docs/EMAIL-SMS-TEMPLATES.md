# Email & SMS Templates for Payment Recovery

## Overview
These are the message templates for automated payment reminders. You can customize these based on your brand voice and client preferences.

---

## 📧 Email Templates

### Template 1: First Reminder (Day 7)
**Subject:** Friendly Reminder: Payment Due

```
Hi {customer_name},

Hope you and {child_name} are doing well!

This is a friendly reminder that your account has an outstanding balance:

💰 Amount Due: AED {overdue_amount}
📅 Last Payment: {last_payment_date}

To make it easy, we've created a secure payment link for you:

👉 Pay Now: {payment_link}

If you've already paid, please disregard this message. If you have any questions, feel free to reach out!

Best regards,
{business_name} Team

---
Questions? Reply to this email or call us at {business_phone}
```

### Template 2: Second Reminder (Day 14)
**Subject:** Important: Outstanding Balance - AED {overdue_amount}

```
Hi {customer_name},

We noticed your account still has an outstanding balance:

💰 Amount Due: AED {overdue_amount}
⏰ Days Overdue: 14 days

We understand life gets busy! To help you stay current, here's your secure payment link:

👉 Pay Now: {payment_link}

This link is valid for 30 days.

Need to discuss payment options? We're here to help! Just reply to this email.

Thank you,
{business_name} Team

---
Secure Payment Link: {payment_link}
Questions? {business_email} | {business_phone}
```

### Template 3: Urgent Reminder (Day 21)
**Subject:** Action Required: Account Balance Overdue

```
Hi {customer_name},

Your account requires immediate attention.

⚠️ Outstanding Balance: AED {overdue_amount}
📅 Overdue Since: {last_payment_date}

To avoid any service interruption, please settle your balance today:

👉 Pay Now: {payment_link}

💳 This secure link accepts all major cards
⏱️ Payment processed instantly

If you're experiencing financial difficulties, please reach out - we can discuss flexible payment options.

We value your business and want to keep {child_name} in our programs!

Best regards,
{business_name} Management

---
Immediate Payment: {payment_link}
Contact Us: {business_email} | {business_phone}
```

### Template 4: Final Notice (Day 30)
**Subject:** Final Notice: Overdue Balance - AED {overdue_amount}

```
Hi {customer_name},

This is a final notice regarding your overdue balance.

🚨 Amount Due: AED {overdue_amount}
📅 Days Overdue: 30+ days
⚠️ Account Status: Delinquent

Please settle this balance immediately to maintain your membership and avoid late fees:

👉 Pay Now: {payment_link}

If payment is not received within 7 days:
• Late fees may apply
• Services may be suspended
• Account may be sent to collections

We don't want it to come to this! Please pay now or contact us to arrange a payment plan.

{business_name} Billing Department

---
IMMEDIATE ACTION REQUIRED
Pay Here: {payment_link}
Questions? {business_email} | {business_phone}
```

---

## 📱 SMS Templates

### SMS 1: First Reminder (Day 7)
```
Hi {customer_name}, friendly reminder - you have an outstanding balance of AED {overdue_amount}. Pay securely here: {short_payment_link}

Thanks, {business_name}
```

### SMS 2: Second Reminder (Day 14)
```
{customer_name}, your account balance of AED {overdue_amount} is now 14 days overdue. Please pay today: {short_payment_link}

Questions? Call {business_phone}
{business_name}
```

### SMS 3: Urgent Reminder (Day 21)
```
URGENT - {customer_name}: Your AED {overdue_amount} balance is 21 days overdue. Pay now to avoid service interruption: {short_payment_link}

{business_name}
```

### SMS 4: Final Notice (Day 30)
```
FINAL NOTICE - {customer_name}: AED {overdue_amount} is 30+ days overdue. Account at risk. Pay immediately: {short_payment_link} or call {business_phone}

{business_name}
```

---

## 🎨 Customization Variables

These variables will be replaced with actual data:

```javascript
{customer_name}         // "Ahmed Ali"
{child_name}           // "Sara"
{overdue_amount}       // "1,050.00"
{last_payment_date}    // "December 15, 2024"
{payment_link}         // Full Stripe payment link
{short_payment_link}   // Shortened link for SMS
{business_name}        // "RAK Kids Academy"
{business_email}       // "billing@rakkids.ae"
{business_phone}       // "+971 50 123 4567"
{days_overdue}         // "14"
```

---

## 🛠️ Implementation Guide

### For Email (using Resend/SendGrid)

**Install Package:**
```bash
npm install resend
# OR
npm install @sendgrid/mail
```

**Create API Route:** `/api/notifications/send-email/route.ts`

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { customer_id, template_type } = await request.json();
  
  // Get customer data from database
  const customer = await getCustomerData(customer_id);
  
  // Select template based on days overdue
  const template = getEmailTemplate(template_type, customer);
  
  // Send email
  await resend.emails.send({
    from: 'billing@yourdomain.com',
    to: customer.email,
    subject: template.subject,
    html: template.body,
  });
  
  return Response.json({ success: true });
}
```

### For SMS (using Twilio)

**Install Package:**
```bash
npm install twilio
```

**Create API Route:** `/api/notifications/send-sms/route.ts`

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: Request) {
  const { customer_id, template_type } = await request.json();
  
  // Get customer data
  const customer = await getCustomerData(customer_id);
  
  // Select SMS template
  const message = getSMSTemplate(template_type, customer);
  
  // Send SMS
  await client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to: customer.phone,
    body: message,
  });
  
  return Response.json({ success: true });
}
```

---

## 📊 Message Scheduling Strategy

### Recommended Schedule:

| Day Overdue | Action | Template | Timing |
|------------|--------|----------|--------|
| 7 days | Email only | Template 1 | Tuesday 9 AM |
| 14 days | Email + SMS | Template 2 | Thursday 10 AM |
| 21 days | Email + SMS | Template 3 | Tuesday 9 AM |
| 30 days | SMS only | Template 4 | Monday 3 PM |

### Best Practices:

**Timing:**
- ✅ Tuesday-Thursday are best days
- ✅ 9-11 AM for emails
- ✅ 3-5 PM for SMS
- ❌ Avoid Mondays (busy inbox)
- ❌ Avoid Fridays (weekend planning)
- ❌ Avoid early mornings or late evenings

**Frequency:**
- ✅ Space reminders 7 days apart
- ✅ Don't send more than 1 per week
- ❌ Never send multiple in one day

**Tone:**
- Days 1-14: Friendly and helpful
- Days 15-21: Firm but understanding
- Days 22-30: Urgent and direct
- Day 30+: Final notice with consequences

---

## 🔌 Integration with Auto-Chase System

### Update the auto-chase function:

**File:** `/api/payment-recovery/auto-chase/route.ts`

Add email/SMS sending after creating payment links:

```typescript
// Send chase notification
if (matchingSchedule.action === 'email' || matchingSchedule.action === 'both') {
  await fetch('/api/notifications/send-email', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: customer.id,
      template_type: getTemplateType(daysOverdue),
      days_overdue: daysOverdue,
      payment_link: paymentLinkUrl,
    }),
  });
}

if (matchingSchedule.action === 'sms' || matchingSchedule.action === 'both') {
  await fetch('/api/notifications/send-sms', {
    method: 'POST',
    body: JSON.stringify({
      customer_id: customer.id,
      template_type: getTemplateType(daysOverdue),
      days_overdue: daysOverdue,
      payment_link: await shortenUrl(paymentLinkUrl),
    }),
  });
}
```

---

## 💰 Service Provider Setup

### Option 1: Resend (Email) - Recommended
**Why:** Modern, developer-friendly, great deliverability
**Pricing:** Free for 3,000 emails/month, then $20/10k
**Setup:**
1. Sign up at https://resend.com
2. Verify your domain
3. Get API key
4. Add to `.env.local`: `RESEND_API_KEY=re_xxxxx`

### Option 2: SendGrid (Email)
**Why:** Industry standard, reliable
**Pricing:** Free for 100 emails/day, then $15/month
**Setup:**
1. Sign up at https://sendgrid.com
2. Create API key
3. Add to `.env.local`: `SENDGRID_API_KEY=SG.xxxxx`

### Option 3: Twilio (SMS)
**Why:** Most popular SMS provider, global coverage
**Pricing:** ~$0.04 per SMS (AED 0.15 per SMS)
**Setup:**
1. Sign up at https://twilio.com
2. Get phone number
3. Get Account SID and Auth Token
4. Add to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxx
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Option 4: MessageBird (SMS)
**Why:** Good for UAE/Middle East
**Pricing:** ~AED 0.12 per SMS
**Setup:**
1. Sign up at https://messagebird.com
2. Get API key
3. Add to `.env.local`: `MESSAGEBIRD_API_KEY=xxxxx`

---

## 📈 Expected Response Rates

### Email Only:
- First reminder: 15-20% response
- Second reminder: 10-15% response
- Total: 25-35% recovery

### Email + SMS:
- First reminder: 25-30% response
- Second reminder: 20-25% response
- Total: 45-55% recovery

### SMS Only:
- Urgent reminder: 30-40% response
- Best for final notice

### Combined Strategy (Recommended):
- Total recovery rate: 70-95%
- Most cost-effective approach

---

## 💡 Cost Estimate

For 150 overdue customers:

**Email Costs (using Resend):**
- 150 customers × 3 emails average = 450 emails
- Cost: Free (under 3,000/month)

**SMS Costs (using Twilio):**
- 150 customers × 2 SMS average = 300 SMS
- Cost: 300 × AED 0.15 = **AED 45**

**Total Monthly Cost: AED 45**

**ROI:**
- Cost: AED 45
- Expected Recovery: AED 120,000
- ROI: 266,567% 🚀

---

## 🎯 Testing Your Templates

### Test Checklist:
- [ ] Send test email to yourself
- [ ] Verify all variables populate correctly
- [ ] Check payment link works
- [ ] Test on mobile devices
- [ ] Check spam score (use mail-tester.com)
- [ ] Verify SMS character count (under 160)
- [ ] Test shortened links work

### A/B Testing Ideas:
- Subject line variations
- Call-to-action wording
- Timing (morning vs afternoon)
- Tone (friendly vs urgent)
- Include/exclude late fee mention

---

## ✅ Launch Checklist

Before going live with email/SMS:

- [ ] Email provider account created
- [ ] SMS provider account created
- [ ] Domain verified (for email)
- [ ] Templates customized for your brand
- [ ] API keys added to environment
- [ ] Test emails/SMS sent successfully
- [ ] Unsubscribe link added (legally required for email)
- [ ] Legal review completed (if needed)
- [ ] Team trained on handling responses

---

**Ready to automate your payment recovery communications!** 📧📱
