# 🧪 Test the Complete System - Step by Step

## Prerequisites
✅ All SQL migrations run (`RUN-THESE-SQL-SCRIPTS.md`)  
✅ Business dashboard running  
✅ Customer app running (Expo)

---

## 🏢 Part 1: Business Setup (10 minutes)

### A. Create Business & Service
1. Login to business dashboard
2. If first time, create business:
   - Name: "Little Stars Dance Academy"
   - Category: "Kids Sports Academy"
   - Click "Create Business"
3. Go to **Services** page
4. Click "Add Service"
   - Name: "Ballet Classes"
   - Description: "Fun ballet for ages 4-8"
   - Duration: 60 minutes
   - Price: 50 AED (drop-in)
   - Capacity: 15
   - Auto-confirm: ✅ (optional)
5. Click "Create Service"

### B. Set Schedule
1. Go to **Schedule** page
2. Click "Add Schedule" (or calendar icon)
3. Add 3 schedules:
   
   **Monday:**
   - Service: Ballet Classes
   - Day: Monday
   - Start: 16:00
   - End: 17:00
   - Capacity: 15
   
   **Wednesday:**
   - Service: Ballet Classes
   - Day: Wednesday
   - Start: 16:00
   - End: 17:00
   - Capacity: 15
   
   **Friday:**
   - Service: Ballet Classes
   - Day: Friday
   - Start: 16:00
   - End: 17:00
   - Capacity: 15

4. Save all 3 schedules

### C. Create Pricing Package
1. Go to **Pricing** page
2. Click "Add Pricing Plan"
3. **Quick Setup Dialog Opens:**
   
   **Service:** Ballet Classes
   
   **Monthly Package:**
   - ✅ Create Monthly Package
   - Option 1: 1 session/week, Discount: 0%, Price: 300
   - Option 2: 2 sessions/week, Discount: 0%, Price: 350
   - Click "+ Add Another Option"
   - Option 3: 3 sessions/week, Discount: 0%, Price: 450
   
   **Term Package:**
   - ✅ Create Term Package
   - Duration: 12 weeks
   - Option 1: 2 sessions/week, Discount: 0%, Price: 800
   
   **Sibling Discount:**
   - ✅ Create sibling discount plans
   - Discount: 10%

4. Click "Create All Plans"
5. **Verify:** Should see 4 plans created:
   - Monthly Package (1x, 2x, 3x options)
   - Term Package (12 weeks, 2x option)
   - Monthly Package - Sibling discount
   - Term Package - Sibling discount

---

## 📱 Part 2: Customer Enrollment (5 minutes)

### A. Browse & Find Service
1. Open customer app
2. Login/create account
3. Go to **Browse** tab
4. See "Little Stars Dance Academy"
5. Tap on it
6. See "Ballet Classes" with description
7. Tap "Enroll" or "Book"

### B. Select Days & Package
**Booking Modal Opens:**

1. **See Schedule Section:**
   ```
   Pick Your Days
   
   ☐ Monday 16:00 - 17:00
   ☐ Wednesday 16:00 - 17:00
   ☐ Friday 16:00 - 17:00
   ```

2. **Select 2 days:** Check ✅ Monday and ✅ Wednesday

3. **See Pricing Options:**
   ```
   Choose Package
   You selected 2 days per week
   
   Monthly Package
   4 weeks • 2x per week
   AED 350
   ~44/class
   
   Monthly Package - Sibling discount
   4 weeks • 2x per week • 10% sibling discount
   AED 315
   ~39/class
   
   Term Package (12 weeks)
   12 weeks • 2x per week
   AED 800
   ~33/class
   ```

4. **Select:** Monthly Package (AED 350)

5. **Review Summary:**
   ```
   Your Enrollment
   Service: Ballet Classes
   Days: Monday, Wednesday
   Time: 16:00
   Package: Monthly Package
   Total Sessions: 8
   Total Price: AED 350
   ```

6. **Click:** "Enroll Now • AED 350"

### C. Confirmation
**Should see:**
```
🎉 Enrollment Complete!
You're enrolled in Ballet Classes!

Monday & Wednesday @ 16:00

2x per week • 4 weeks

Your classes are now in your calendar!
```

7. Tap "Got it!"

---

## ✅ Part 3: Verify Everything Works

### Customer App Verification

#### A. Calendar Tab
1. Go to **Calendar** tab
2. **Should see:** Week view with dots on Mon & Wed
3. **Tap Monday:** See "Ballet Classes" session at 16:00
4. **Tap Wednesday:** See "Ballet Classes" session at 16:00
5. **Scroll forward:** See 4 weeks of Mon/Wed sessions (8 total)

#### B. Bookings Tab
1. Go to **Bookings** tab
2. **Should see:** All 8 upcoming sessions listed
3. **Each showing:**
   - Ballet Classes
   - Little Stars Dance Academy
   - Date & time
   - Status: Confirmed (if auto_confirm enabled)

---

### Business Dashboard Verification

#### A. Main Dashboard
1. Go to **Dashboard** (home)
2. **Should see updated metrics:**
   - Active Enrollments: **1**
   - This Week's Sessions: **2** (if today is Mon-Sun)
   - Attendance Rate: **0%** (no sessions completed yet)
   - Monthly Revenue: **AED 350**
   - Capacity: **~5%** (2 out of ~60 weekly spots)

#### B. Bookings Page - Enrollments Tab
1. Go to **Bookings** page
2. **Active Enrollments tab should show:**
   
   **Card displaying:**
   - Customer name
   - Email
   - Ballet Classes
   - Days: Mon, Wed
   - Frequency: 2x/week
   - Duration: 4 weeks
   - Price: AED 350
   - Progress: 0/8 sessions
   - Status: Active
   - Actions: Pause, Cancel

#### C. Bookings Page - Sessions Tab
1. Click **"Upcoming Sessions" tab**
2. **Should see:** 8 individual sessions listed
3. **Each session showing:**
   - Customer name
   - Ballet Classes
   - Date (next Monday)
   - Time (16:00)
   - Status: Confirmed
   - Actions: "Attended" & "No Show" buttons

---

## 🎭 Part 4: Test Attendance Tracking

### Mark First Class as Attended
1. Business dashboard → **Bookings** → **Upcoming Sessions**
2. Find first Monday session
3. Click **"Attended"** button
4. **Verify:**
   - Session shows "✓ Attended" badge
   - Status changes to "Completed"

### Check Progress Updated
1. Go to **"Active Enrollments"** tab
2. **Should see:** Progress bar updated to **1/8 sessions**

### Check Metrics Updated
1. Go to **Dashboard** (home)
2. **Attendance Rate** should update (might take a moment)

---

## 🧪 Part 5: Test Enrollment Management

### Pause Enrollment
1. Business dashboard → **Bookings** → **Active Enrollments**
2. Click **"Pause"** button on enrollment
3. **Verify:** Status changes to "Paused"
4. **Check customer app:** Sessions still visible (existing bookings remain)

### Resume Enrollment
1. Click **"Resume"** button
2. **Verify:** Status back to "Active"

### Cancel Enrollment
1. Click **"Cancel"** button
2. **Verify:** Status changes to "Cancelled"
3. **Check dashboard metrics:** Active Enrollments decreases to 0

---

## 🎉 Expected Results

### ✅ Customer Experience
- [x] Simple 3-step enrollment (pick days → pick package → done)
- [x] All classes appear in calendar automatically
- [x] Can view all upcoming sessions
- [x] Clear status for each session

### ✅ Business Experience
- [x] See all active enrollments in one place
- [x] Track progress (sessions used out of total)
- [x] Mark attendance easily
- [x] Pause/cancel memberships
- [x] View upcoming sessions separately
- [x] Dashboard shows real metrics

### ✅ System Behavior
- [x] Enrollment creates subscription record
- [x] Auto-generates 8 bookings (4 weeks × 2 days)
- [x] Bookings link to subscription
- [x] Attendance updates progress
- [x] Metrics calculate correctly

---

## 🐛 Troubleshooting

### "No schedules found"
- Business hasn't created schedules yet
- Go to Schedule page and add Mon/Wed/Fri classes

### "No packages available"
- Business hasn't created pricing for selected frequency
- Go to Pricing page and add package with matching sessions/week

### Booking modal doesn't show schedules
- Check browser console / React Native debugger for errors
- Verify `schedules` table has data
- Check RLS policies allow reading schedules

### Enrollments don't show in dashboard
- Check `subscriptions` table has record
- Verify RLS policies allow business staff to read
- Check `business_id` matches

### Sessions not auto-generated
- Check `bookings` table after enrollment
- Should have 8 records (4 weeks × 2 days)
- Check browser/app console for errors

### Metrics show 0
- Wait a moment for calculations
- Refresh page
- Check queries in page.tsx are running

---

## 📊 Database Verification

If something doesn't work, check database directly:

```sql
-- Check enrollment was created
SELECT 
  id,
  customer_id,
  service_id,
  schedule_days,
  status,
  start_date,
  end_date
FROM subscriptions
ORDER BY created_at DESC
LIMIT 1;

-- Check sessions were generated
SELECT 
  id,
  subscription_id,
  scheduled_date,
  start_time,
  status
FROM bookings
WHERE subscription_id = 'YOUR_SUBSCRIPTION_ID'
ORDER BY scheduled_date;

-- Should see 8 bookings (4 weeks × 2 days)

-- Check pricing plans
SELECT 
  pp.name,
  po.sessions_per_week,
  po.price
FROM pricing_plans pp
JOIN pricing_options po ON pp.id = po.pricing_plan_id
WHERE pp.service_id = 'YOUR_SERVICE_ID'
ORDER BY pp.name, po.sessions_per_week;
```

---

## 🎊 Success Criteria

**System is working perfectly when:**

1. ✅ Customer can enroll in 3 taps (select days, select package, enroll)
2. ✅ Calendar auto-populates with all sessions
3. ✅ Business sees enrollment with progress tracking
4. ✅ Business can mark attendance
5. ✅ Dashboard metrics update correctly
6. ✅ Can pause/resume/cancel enrollments
7. ✅ Everything is fast and responsive

**If all above work → System complete! 🚀**
