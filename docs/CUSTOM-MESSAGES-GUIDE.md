# 📱 Custom WhatsApp Messages - Complete Guide

## Overview
Send personalized WhatsApp messages with images to your customers! Perfect for promotions, announcements, reminders, or any custom communication.

---

## 🚀 Quick Start

1. **Navigate to Custom Messages**
   - Dashboard → Messaging → Custom Messages

2. **Write Your Message**
   - Use the text editor
   - Add formatting (*bold*, _italic_)
   - Include emojis 🎉

3. **Add Image (Optional)**
   - Upload PNG/JPG up to 5MB
   - Preview before sending

4. **Select Recipients**
   - Choose specific customers
   - Filter by "All" or "Overdue Only"
   - Select all or pick individually

5. **Send!**
   - Preview how it will look
   - Click "Send to X customers"
   - Messages sent via WhatsApp

---

## ✨ Features

### 📝 Rich Text Editing
- Write custom messages in plain text
- Use WhatsApp markdown formatting
- Real-time character count
- Preview before sending

### 🖼️ Image Support
- Upload promotional images
- Product photos
- Event flyers
- Schedule screenshots
- Max 5MB per image

### 👥 Smart Recipient Selection
- Select individual customers
- Filter by overdue status
- Select all / clear all
- See customer details (phone, overdue amount)
- Count shows selected recipients

### 📱 WhatsApp Preview
- See exactly how message will look
- Preview includes image placement
- Test formatting before sending

### 🎯 Quick Templates
Pre-written templates for common messages:
- 🎉 **Promotion** - Special offers
- 📅 **Reminder** - Session reminders
- 🏆 **Motivation** - Encouragement
- ⚠️ **Update** - Important announcements

---

## 💡 Message Formatting

### WhatsApp Markdown

**Bold Text:**
```
*Your text here* → Your text here (bold)
```

**Italic Text:**
```
_Your text here_ → Your text here (italic)
```

**Strikethrough:**
```
~Your text here~ → Your text here (strikethrough)
```

### Variable Placeholders

Use these placeholders in your message:
- `{name}` or `{first_name}` → Customer's first name
- `{business}` → Your business name

**Example:**
```
Hi {name}!

Welcome to {business}! 🎉
```

**Becomes:**
```
Hi Ahmed!

Welcome to RAK Life Academy! 🎉
```

---

## 📸 Image Guidelines

### Requirements:
- ✅ Format: PNG, JPG, JPEG
- ✅ Max size: 5MB
- ✅ Recommended: 1080x1080px (square)
- ✅ Aspect ratio: Any (square works best)

### Best Practices:
- Use high-quality images
- Keep text on image readable
- Test on mobile device first
- Compress large images before upload
- Use landscape for wide content

### Image Ideas:
- **Promotions:** Discount flyers, special offers
- **Classes:** Schedule, new class announcements
- **Events:** Event posters, registration info
- **Motivation:** Quotes, success stories
- **Products:** New equipment, merchandise
- **Updates:** Policy changes, holiday hours

---

## 🎯 Use Cases

### 1. Monthly Promotions
```
🎉 SPECIAL OFFER - {name}!

This month only:
Get 20% OFF all sessions!

Valid until March 31st.

Book now: [link]

RAK Life Academy 💪
```
*With image: Promotional banner with 20% OFF*

### 2. Class Reminders
```
📅 Hi {name}!

Your session tomorrow:
⏰ Time: 6:00 PM
📍 Location: Main Studio

See you there! 🏋️

{business}
```
*With image: Schedule screenshot*

### 3. New Class Announcement
```
🆕 NEW CLASS ALERT!

We're launching Yoga Basics!

📅 Starts: April 1st
⏰ Time: 7:00 AM
👥 Limited spots!

Register now!

{business} 🧘
```
*With image: Class promo image*

### 4. Holiday Closure
```
⚠️ IMPORTANT UPDATE

We'll be closed for Eid holidays:

🗓️ March 28 - April 2

Normal schedule resumes April 3rd.

Eid Mubarak! 🌙

{business}
```
*With image: Holiday greeting graphic*

### 5. Payment Thank You
```
🙏 Thank you, {name}!

We appreciate your recent payment!

Your account is up to date.

Keep up the great work! 💪

{business}
```
*With image: Thank you graphic*

### 6. Re-engagement
```
Hey {name}, we miss you! 👋

It's been a while since your last visit.

Special comeback offer:
🎁 First session FREE!

Reply to book your spot.

{business}
```
*With image: "We miss you" graphic*

---

## 🔧 Setup Instructions

### 1. Create Storage Bucket (One-time)

Run this SQL in Supabase:

```sql
-- Run in Supabase SQL Editor
-- File: sql/CREATE-WHATSAPP-MEDIA-BUCKET.sql

INSERT INTO storage.buckets (id, name, public)
VALUES ('whatsapp-media', 'whatsapp-media', true)
ON CONFLICT (id) DO NOTHING;
```

### 2. Verify WhatsApp Connection

1. Go to **Settings → WhatsApp**
2. Ensure status is "Connected"
3. If not connected, scan QR code

### 3. Test with Yourself First!

1. Add yourself as a test customer
2. Create a test message
3. Send to yourself only
4. Verify formatting and image

---

## 📊 Activity Tracking

All custom messages are logged in `payment_activity_log` table:

```json
{
  "action": "custom_message_sent",
  "details": {
    "message_preview": "Hi Ahmed! Special offer...",
    "has_image": true,
    "sent_via": "whatsapp"
  }
}
```

View logs:
```sql
SELECT * FROM payment_activity_log
WHERE action = 'custom_message_sent'
ORDER BY created_at DESC;
```

---

## 🧪 Testing Checklist

Before sending to all customers:

- [ ] Test message with your own phone number
- [ ] Check WhatsApp formatting (bold, italic)
- [ ] Verify image displays correctly
- [ ] Test on mobile and desktop
- [ ] Check message length (not too long)
- [ ] Verify placeholders replaced correctly
- [ ] Test with 1-2 customers first
- [ ] Check customer feedback
- [ ] Review activity logs

---

## 🚨 Troubleshooting

### Image Not Uploading?
- Check file size (must be < 5MB)
- Verify file format (PNG, JPG only)
- Ensure Supabase storage bucket exists
- Check browser console for errors

### Message Not Sending?
1. Verify WhatsApp connection status
2. Check customer has valid phone number
3. Ensure you selected recipients
4. Review browser console logs
5. Check API response in Network tab

### Recipients Not Showing?
- Verify customers have phone numbers
- Check they have active bookings
- Try refreshing the page
- Clear filter if set to "Overdue Only"

### Formatting Not Working?
- Use exact markdown syntax: `*bold*`, `_italic_`
- Don't mix markdown types
- Test in WhatsApp first
- Some characters may need escaping

---

## 💰 Cost Considerations

### Storage Costs:
- Supabase free tier: 1GB storage
- ~1000 images (1MB each) = 1GB
- Paid: $0.021/GB/month

### WhatsApp Costs:
- Using WhatsApp Web.js = FREE
- No per-message charges
- Only internet/hosting costs

---

## 🎨 Design Tips

### Message Content:
✅ Keep under 500 characters
✅ Use emojis sparingly (2-3 max)
✅ One clear call-to-action
✅ Include contact info
✅ Personalize with {name}
✅ Match your brand voice

### Image Design:
✅ High contrast text
✅ Large, readable fonts
✅ Clear focal point
✅ Mobile-friendly layout
✅ Brand colors
✅ Logo placement

---

## 📱 Files Reference

| File | Purpose |
|------|---------|
| `app/dashboard/messages/page.tsx` | Page container |
| `app/dashboard/messages/CustomMessageComposer.tsx` | Main UI component |
| `app/api/messages/send-custom/route.ts` | Send API endpoint |
| `sql/CREATE-WHATSAPP-MEDIA-BUCKET.sql` | Storage setup |
| `components/DashboardLayout.tsx` | Navigation menu |

---

## 🔐 Security Notes

- ✅ Authentication required
- ✅ Business access verified
- ✅ Public image URLs (for WhatsApp display)
- ✅ Activity logged with user ID
- ✅ RLS policies on storage

---

## 🚀 Advanced Features

### Bulk Messaging Best Practices:
1. Segment your audience
2. Personalize messages
3. Time your sends appropriately
4. Monitor engagement
5. Follow up on no-replies

### A/B Testing:
1. Create two message variations
2. Send to 10% of audience each
3. Measure response rates
4. Send winning version to rest

### Automation Ideas:
- Birthday messages (auto-send)
- Welcome messages (new members)
- Re-engagement (inactive > 30 days)
- Payment reminders (custom)
- Class reminders (24h before)

---

## 📈 Success Metrics

Track these to improve:
- Open rate (via read receipts)
- Response rate
- Click-through rate (if links)
- Booking/payment conversions
- Unsubscribe requests

---

## 🎓 Training Your Team

1. **Show them the interface**
   - Demo creating a message
   - Show image upload
   - Explain recipient selection

2. **Best practices**
   - Always test first
   - Use templates
   - Keep messages short
   - Personalize when possible

3. **Common scenarios**
   - Monthly promotions
   - Event announcements
   - Class updates
   - Holiday greetings

---

## 🆘 Support

### Need Help?
- Check browser console (F12)
- Review Supabase logs
- Test WhatsApp connection
- Verify customer phone numbers

### Report Issues:
1. Screenshot the error
2. Copy browser console logs
3. Note what you were trying to do
4. Send to support

---

## ✅ Launch Checklist

- [ ] Storage bucket created
- [ ] WhatsApp connected
- [ ] Tested with your phone
- [ ] Image uploads working
- [ ] Templates created
- [ ] Team trained
- [ ] Test messages sent
- [ ] Feedback collected
- [ ] Ready for production!

---

**Last Updated:** 2026-03-11  
**Version:** 1.0  
**Status:** ✅ Production Ready

Happy messaging! 📱✨
