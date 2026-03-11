# SIMPLE TESTING GUIDE - Payment Recovery & Members

## ✅ What's Fixed:

1. **Members page shows ALL customers** - No need for bookings
2. **Delete button uses admin API** - Bypasses RLS
3. **Edit member page** - Update debt amounts
4. **Quick Add form** - Adds/updates customers by phone

---

## 🧪 How to Test (Simple Flow):

### 1. ADD A TEST USER
1. Go to: `Payment Recovery` page
2. Fill in the form:
   - Phone: `+447454440408` (or your test number)
   - Name: `Test User`
   - Email: `test@test.com` (optional)
   - Amount: `1000`
3. Click **"✅ Add Member"**
4. Click "Yes" to go to Members page

### 2. VIEW THE USER
1. You're now on Members page
2. You should see "Test User" at the top (newest first)
3. Check the box next to them

### 3. DELETE THE USER
1. With user checked, click **"Delete Selected (1)"** button (red)
2. Confirm deletion
3. User should disappear

### 4. EDIT A USER (Add More Debt)
1. Go to Members page
2. Click **"Edit"** button on any user
3. Click **"Edit"** button at top
4. Change "Overdue Amount" to a new value
5. Click **"Save Changes"**
6. Done!

---

## 🐛 If Delete Still Doesn't Work:

**Check console errors:**
1. Press F12 → Console tab
2. Click Delete button
3. Look for errors

**Most common issue:** Service role key not loaded
- Server needs to be restarted after adding env vars
- Your server IS running on port 3000 now ✅

---

## 🗑️ Nuclear Option - Delete via SQL:

If button still fails, go to Supabase SQL Editor and run:

```sql
-- Delete specific user
DELETE FROM users WHERE email = 'test@test.com';

-- Or delete all test customers
DELETE FROM users WHERE user_type = 'customer' AND email LIKE '%test%';
```

---

## 📝 Current Status:

✅ Service role key is in .env.local
✅ Dev server restarted on port 3000
✅ Members page shows all customers
✅ Delete API uses admin client
✅ Edit page created with update function

**Now test the flow above and let me know which step fails (if any).**
