# 🎨 Customize Payment Links & WhatsApp Messages

## Overview
This guide shows you how to customize:
1. 📱 **WhatsApp message templates** (payment reminders & thank you messages)
2. 🔗 **Stripe payment link appearance** (logo, colors, branding)
3. ✅ **Payment success page** (confirmation message)

---

## 1. 📱 Customize WhatsApp Messages

### A. Payment Reminder Messages (when sending payment links)

**File:** `app/api/notifications/send-whatsapp/route.ts`

**Lines 75-118:** Three message templates based on days overdue

#### Template 1: Early Reminder (1-7 days)
```typescript
if (days_overdue <= 7) {
  return `Hi ${customer_name},

Friendly reminder from ${business_name}:

Your account has an outstanding balance of *AED ${overdue_amount}*.

Pay securely here:
${payment_link}

Questions? Reply to this message or call ${business_phone}.

Thank you! 🙏`;
}
```

#### Template 2: Medium Urgency (8-14 days)
```typescript
else if (days_overdue <= 14) {
  return `Hi ${customer_name},

Your account balance is now *${days_overdue} days overdue*.

⚠️ Amount Due: *AED ${overdue_amount}*

Please pay today:
${payment_link}

Need help? Contact us: ${business_phone}

${business_name}`;
}
```

#### Template 3: Urgent (15+ days)
```typescript
else {
  return `🚨 URGENT - ${customer_name}

Your account is *${days_overdue} days overdue*.

Amount: *AED ${overdue_amount}*

PAY NOW to avoid service interruption:
${payment_link}

Need payment plan? Call ${business_phone} IMMEDIATELY.

${business_name} Billing`;
}
```

**💡 Customize:** Change the text, emojis, tone, or add your own branding!

---

### B. Bulk Send Message (Members page)

**File:** `app/api/payment-links/bulk-create/route.ts`

**Lines 161-175:** Message sent when using "Send Payment Links" button

```typescript
const message = `⚠️ PAYMENT REMINDER

Hi ${customer.full_name?.split(' ')[0] || 'there'},

Your account with ${business.name} is ${daysOverdue} days overdue.

Amount due: *AED ${customer.overdue_amount}*

Please pay now to avoid service interruption:
${paymentUrl}

Questions? Contact us.

Thank you!
${business.name}`;
```

**💡 Tip:** You can make this match your brand voice - more friendly or more formal!

---

### C. Thank You Message (after payment)

**File:** `app/api/webhooks/stripe/route.ts`

**Lines 247-258:** Automatic confirmation when payment received

```typescript
const thankYouMessage = `✅ Payment Received!

Hi ${customerName},

Thank you for your payment of *AED ${amountPaid.toFixed(2)}*! 

Your account is now up to date. We appreciate your prompt payment.

If you have any questions, feel free to contact us at ${businessPhone}.

${businessName}
🙏 Thank you!`;
```

**💡 Ideas:**
- Add a discount code for next payment
- Include a link to your schedule/booking system
- Add social media links
- Include a satisfaction survey link

---

## 2. 🎨 WhatsApp Formatting Tips

### Bold Text
```
*Your text here* → Your text here (bold)
```

### Italic Text
```
_Your text here_ → Your text here (italic)
```

### Strikethrough
```
~Your text here~ → Your text here (strikethrough)
```

### Emojis
Popular payment-related emojis:
- ✅ Checkmark (success)
- ⚠️ Warning (reminder)
- 🚨 Urgent (critical)
- 💰 Money bag
- 🙏 Thank you
- 📱 Phone
- 💳 Card
- 📧 Email
- 🔗 Link

---

## 3. 🔗 Customize Stripe Payment Link

### A. Add Your Business Logo

**File:** `app/api/payment-links/bulk-create/route.ts`

**Lines 105-128:** Add `images` parameter

```typescript
const paymentLink = await stripe.paymentLinks.create({
  line_items: [{
    price_data: {
      currency: 'aed',
      product_data: {
        name: `Overdue Payment - ${business.name}`,
        description: `Outstanding balance payment`,
        images: ['https://your-domain.com/logo.png'], // 👈 ADD THIS
      },
      unit_amount: Math.round(customer.overdue_amount * 100),
    },
    quantity: 1,
  }],
  // ... rest of config
});
```

**Requirements:**
- ✅ Image must be hosted online (https://)
- ✅ Recommended size: 800x800px
- ✅ Format: PNG or JPG
- ✅ Max file size: 2MB

**Where to host your logo:**
- Your website (e.g., `https://raklife.ae/logo.png`)
- Cloudinary, AWS S3, or similar
- Supabase Storage

---

### B. Customize Payment Page Details

**Same file, lines 105-128:**

```typescript
const paymentLink = await stripe.paymentLinks.create({
  line_items: [{
    price_data: {
      currency: 'aed',
      product_data: {
        name: `Payment for RAK Life Academy`,           // 👈 Payment title
        description: `Outstanding membership fee`,      // 👈 Description
        images: ['https://your-domain.com/logo.png'],   // 👈 Logo
      },
      unit_amount: Math.round(customer.overdue_amount * 100),
    },
    quantity: 1,
  }],
  metadata: {
    customer_id: customer.id,
    business_id: business_id,
    purpose: 'overdue_recovery',
  },
  after_completion: {
    type: 'hosted_confirmation',
    hosted_confirmation: {
      custom_message: 'Thank you! Your payment is confirmed. We appreciate your business!', // 👈 Success message
    },
  },
});
```

---

### C. Add Custom Colors & Branding (Stripe Dashboard)

You can customize the Stripe payment page appearance in your Stripe Dashboard:

1. **Go to:** https://dashboard.stripe.com/settings/branding
2. **Customize:**
   - Brand icon (logo)
   - Brand color (primary color)
   - Accent color
   - Background image
   - Font

3. **Preview** how it looks on desktop and mobile

**Note:** These settings apply to ALL your Stripe payment pages.

---

## 4. ✅ Customize Success Page

### A. Custom Success Message

**File:** `app/api/payment-links/bulk-create/route.ts`

**Lines 122-127:**

```typescript
after_completion: {
  type: 'hosted_confirmation',
  hosted_confirmation: {
    custom_message: 'Thank you for your payment! Your account has been updated.', // 👈 EDIT THIS
  },
},
```

**Ideas:**
```typescript
custom_message: '🎉 Payment confirmed! Welcome back to RAK Life Academy. See you at the gym!'

custom_message: 'Thank you! Your membership is now active. Check your WhatsApp for next steps.'

custom_message: 'Payment received! Your account is up to date. Questions? Call us at +971501234567'
```

### B. Redirect to Your Website (Optional)

Instead of Stripe's hosted confirmation, redirect to your own page:

```typescript
after_completion: {
  type: 'redirect',
  redirect: {
    url: 'https://your-website.com/payment-success',
  },
},
```

Then create a custom success page at `/app/payment-success/page.tsx`

---

## 5. 🎯 Quick Customization Checklist

### WhatsApp Messages
- [ ] Update business name/tone in reminder messages
- [ ] Customize thank you message after payment
- [ ] Add emojis that match your brand
- [ ] Include your contact info (phone, email, social)
- [ ] Test with your own phone number

### Stripe Payment Link
- [ ] Upload your logo (800x800px)
- [ ] Set custom product name
- [ ] Write helpful description
- [ ] Customize success message
- [ ] Set brand colors in Stripe Dashboard

### Testing
- [ ] Send test payment link to yourself
- [ ] Check message formatting on WhatsApp
- [ ] Complete test payment with card: 4242 4242 4242 4242
- [ ] Verify thank you message arrives
- [ ] Review payment page appearance

---

## 6. 📝 Example: RAK Life Academy Customization

Here's a complete example for a fitness academy:

### WhatsApp Reminder:
```typescript
const message = `🏋️ Hi ${customer_name}!

Your RAK Life Academy membership payment is overdue.

Amount due: *AED ${overdue_amount}*

Keep your momentum going! Pay now to avoid interruption:
${payment_link}

Questions? WhatsApp us at ${business_phone}

Stay strong! 💪
RAK Life Academy`;
```

### Thank You Message:
```typescript
const thankYouMessage = `🎉 Payment Confirmed!

Hi ${customerName},

Thank you for your payment of *AED ${amountPaid}*! 

Your membership is now active. See you at the gym! 🏋️

Check our schedule: https://raklife.ae/schedule
Questions? WhatsApp ${businessPhone}

Stay strong! 💪
RAK Life Academy`;
```

### Stripe Payment Link:
```typescript
product_data: {
  name: `RAK Life Academy - Membership`,
  description: `Membership fees for ${customer.full_name}`,
  images: ['https://raklife.ae/logo-square.png'],
}
```

---

## 7. 🔧 Advanced Customizations

### A. Dynamic Messages Based on Amount

```typescript
function getWhatsAppMessage(days_overdue: number, data: any) {
  const { customer_name, overdue_amount, payment_link, business_name } = data;
  
  // Different message for large amounts
  if (overdue_amount > 5000) {
    return `Hi ${customer_name},

We notice a significant balance on your account.

Amount: *AED ${overdue_amount}*

Need a payment plan? Let's discuss options.

Call us: ${business_phone}

${business_name}`;
  }
  
  // Standard message for regular amounts
  return `Hi ${customer_name}...`;
}
```

### B. Personalized Messages by Customer Type

```typescript
// In bulk-create route
const { data: customer } = await supabase
  .from('users')
  .select('id, full_name, phone, overdue_amount, user_type, tags')
  .eq('id', customerId)
  .single();

let messagePrefix = '';
if (customer.tags?.includes('vip')) {
  messagePrefix = '⭐ VIP Member - ';
} else if (customer.tags?.includes('new')) {
  messagePrefix = '👋 Welcome! ';
}

const message = `${messagePrefix}Hi ${customer.full_name}...`;
```

### C. Include QR Code in WhatsApp Message

```typescript
// Generate QR code for payment link
import QRCode from 'qrcode';

const qrCodeUrl = await QRCode.toDataURL(paymentUrl);

// Send WhatsApp with QR code
const message = `Hi ${customer_name},

Scan to pay:
${qrCodeUrl}

Or click: ${paymentUrl}

Thank you!`;
```

---

## 8. 🧪 Testing Your Customizations

### Test WhatsApp Messages:
1. Go to Payment Recovery dashboard
2. Use "Test WhatsApp Notification" section
3. Enter YOUR phone number
4. Click "Send Test WhatsApp"
5. Check formatting, links, emojis

### Test Payment Link:
1. Add yourself as a test customer
2. Send payment link
3. Open on mobile and desktop
4. Check logo, colors, branding
5. Complete test payment with: `4242 4242 4242 4242`
6. Verify success message
7. Confirm thank you WhatsApp arrives

---

## 9. 💡 Best Practices

### WhatsApp Messages:
✅ Keep it under 1000 characters
✅ Use **bold** for important info (amounts, deadlines)
✅ Include payment link on its own line
✅ Add a clear call-to-action
✅ Always include contact info
✅ Match your brand voice (friendly, professional, etc.)
✅ Test on actual WhatsApp before sending to customers

### Payment Links:
✅ Use clear, descriptive product names
✅ Add your logo (builds trust)
✅ Write helpful descriptions
✅ Test on mobile devices
✅ Use Stripe's test mode first
✅ Match colors to your website

---

## 10. 📁 Quick Reference: Files to Edit

| What to Customize | File | Lines |
|-------------------|------|-------|
| Payment reminder messages | `app/api/notifications/send-whatsapp/route.ts` | 75-118 |
| Bulk send message | `app/api/payment-links/bulk-create/route.ts` | 161-175 |
| Thank you message | `app/api/webhooks/stripe/route.ts` | 247-258 |
| Payment link details | `app/api/payment-links/bulk-create/route.ts` | 105-128 |
| Logo & branding | Stripe Dashboard | - |

---

## 🚀 Next Steps

1. **Edit the messages** in the files above
2. **Upload your logo** to a public URL
3. **Update Stripe branding** in dashboard
4. **Test everything** with your own phone/card
5. **Get feedback** from a test customer
6. **Iterate** based on results

---

**Need help?** Check the console logs when sending messages to debug any issues.

**Pro tip:** Save your old message templates in comments before changing them, so you can revert if needed!
