# 🎨 Add Your Logo to Payment Pages

## Current Setup

Right now you see:
- ✅ **Stripe logo** (required by Stripe)
- Product name: "Overdue Payment - Your Business"
- Payment form

**This is normal!** Stripe requires their logo for security/trust.

---

## How to Add YOUR Logo

You have 2 options to add your business logo:

---

## ⭐ Option 1: Stripe Dashboard (Recommended - Easiest)

**Applies to ALL payment pages automatically**

### Steps:

1. **Go to Stripe Branding Settings**
   - https://dashboard.stripe.com/settings/branding

2. **Upload Your Logo**
   - Click "Brand icon"
   - Upload PNG or JPG
   - Recommended: 512x512px square
   - Max 2MB

3. **Set Brand Color**
   - Choose your primary brand color
   - This colors the payment button

4. **Preview**
   - See how it looks on desktop & mobile

5. **Save**
   - Your logo now appears on ALL Stripe pages!

**Result:**
```
┌─────────────────────────────┐
│  [Stripe Logo]  [YOUR LOGO] │
│                              │
│  Overdue Payment - Business  │
│  AED 1,050                   │
│                              │
│  [Payment Form]              │
└─────────────────────────────┘
```

---

## 🔧 Option 2: Add Logo URL in Code

**For per-payment customization**

### Steps:

1. **Host Your Logo Online**
   
   Options:
   - Your website: `https://raklife.ae/logo.png`
   - Cloudinary (free tier)
   - AWS S3
   - Supabase Storage
   
   Requirements:
   - ✅ Publicly accessible (https://)
   - ✅ PNG or JPG format
   - ✅ Recommended: 800x800px
   - ✅ Max 2MB

2. **Update Code**
   
   File: `app/api/payment-links/bulk-create/route.ts`
   
   Find this section (around line 109):
   ```typescript
   product_data: {
     name: `Overdue Payment - ${business.name}`,
     description: `Outstanding balance payment`,
     // Add your logo here (must be publicly accessible URL)
     // images: ['https://your-domain.com/logo.png'],
   },
   ```
   
   **Uncomment and update:**
   ```typescript
   product_data: {
     name: `Overdue Payment - ${business.name}`,
     description: `Outstanding balance payment`,
     images: ['https://raklife.ae/logo.png'], // 👈 ADD THIS
   },
   ```

3. **Test**
   - Create a new payment link
   - Open in browser
   - Your logo should appear!

---

## 📸 Logo Specifications

### Ideal Logo Format:

**For Stripe Dashboard:**
- Format: PNG (with transparent background)
- Size: 512x512px (square)
- File size: Under 2MB
- Background: Transparent or white

**For Product Images (in code):**
- Format: PNG or JPG
- Size: 800x800px (square) or 1200x630px (landscape)
- File size: Under 2MB
- Background: Transparent, white, or branded color

---

## 🎨 Branding Tips

### Your Logo Should:
✅ Be clear and readable at small sizes
✅ Work on both light and dark backgrounds
✅ Be professional and high-quality
✅ Match your brand colors

### Don't:
❌ Use logos with very thin lines
❌ Include small text in logo
❌ Use low-resolution images
❌ Upload logos with complex gradients (may not render well)

---

## 🧪 Test Your Logo

After adding logo:

1. **Create test payment link**
   - Add a test customer
   - Send payment link

2. **Open on multiple devices**
   - Desktop browser
   - Mobile phone
   - Tablet

3. **Check appearance**
   - Logo visible and clear?
   - Correct size?
   - Good quality?
   - Matches your brand?

4. **Adjust if needed**
   - Try different image sizes
   - Optimize file size
   - Adjust colors

---

## 🔍 What Customers See

### Before (No Custom Logo):
```
┌─────────────────────────────┐
│  [Stripe Logo]               │
│                              │
│  Overdue Payment             │
│  RAK Life Academy            │
│  AED 1,050                   │
│                              │
│  Card Details:               │
│  [____________]              │
│  [Pay AED 1,050]             │
└─────────────────────────────┘
```

### After (With Your Logo):
```
┌─────────────────────────────┐
│  [Stripe Logo]  [Your Logo]  │
│                              │
│  RAK Life Academy            │
│  Membership Payment          │
│  AED 1,050                   │
│                              │
│  Card Details:               │
│  [____________]              │
│  [Pay AED 1,050]             │
└─────────────────────────────┘
```

**Note:** Stripe logo always appears (for trust/security). Your logo appears alongside it.

---

## 🎯 Quick Start: Option 1 (Easiest)

1. Go to https://dashboard.stripe.com/settings/branding
2. Upload logo under "Brand icon"
3. Set brand color
4. Save
5. Done! ✅

**All future payment pages will show your logo automatically.**

---

## 💡 Pro Tips

### Tip 1: Use Transparent Background
Logos with transparent backgrounds look best on Stripe's white payment pages.

### Tip 2: Keep It Simple
Simpler logos are more recognizable at small sizes.

### Tip 3: Test Colors
Make sure your logo colors contrast well with white background.

### Tip 4: Brand Consistency
Use the same logo as your website/social media.

### Tip 5: Mobile First
Most customers pay on mobile - ensure logo looks good on small screens.

---

## 🆘 Troubleshooting

### Logo Not Showing?

**Check:**
1. Is URL publicly accessible? (try opening in incognito)
2. Is file format PNG or JPG?
3. Is file size under 2MB?
4. Is URL using https:// (not http://)?
5. Did you save changes in Stripe dashboard?

**Solution:**
- Try uploading to different host
- Reduce file size
- Use direct image URL (not page URL)
- Clear browser cache

### Logo Looks Blurry?

**Fix:**
- Use higher resolution image (minimum 800x800px)
- Export at 2x resolution
- Use PNG format for better quality
- Optimize image with tools like TinyPNG

### Logo Wrong Size?

**Fix:**
- Crop to square (1:1 aspect ratio)
- Use 512x512px for dashboard
- Use 800x800px for product images
- Center your logo in the canvas

---

## 📋 Checklist

Before going live:

- [ ] Logo uploaded to Stripe dashboard OR
- [ ] Logo hosted online (https://)
- [ ] Logo URL added to code
- [ ] Test payment link created
- [ ] Logo appears correctly
- [ ] Tested on mobile device
- [ ] Tested on desktop
- [ ] Logo is clear and professional
- [ ] Brand color set in Stripe
- [ ] All changes saved

---

## 🔗 Resources

- **Stripe Branding:** https://dashboard.stripe.com/settings/branding
- **Stripe Branding Guide:** https://stripe.com/docs/payments/checkout/customization
- **Image Optimization:** https://tinypng.com
- **Free Logo Hosting:** 
  - Cloudinary: https://cloudinary.com
  - ImgBB: https://imgbb.com

---

## ✅ Summary

**Stripe Logo = Security & Trust** ✅ (stays)
**Your Logo = Branding** ✅ (you add)

**Easiest way:** Upload logo in Stripe Dashboard settings!

---

**Questions?** Test it yourself at:
https://dashboard.stripe.com/settings/branding

🎨 Happy branding!
