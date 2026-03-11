# RAKlife - Lean Multi-Tenant Booking Platform

## 🎯 Core Philosophy

**Keep it simple. Ship fast. Scale when needed.**

## 💡 Platform Vision

This is **not just a booking marketplace** - it's a **full member management SaaS** where:

- Businesses get a complete club management system
- Members get their own portal within each club they join
- Communication flows between coaches, members, and parents
- Progress is tracked and celebrated
- Communities are built around shared activities

Think: **TeamSnap + ClassPass + Glofox** but simpler and UAE-focused.

---

## 🏗️ System Architecture

```
┌─────────────────┐
│  Customer App   │ (Expo/React Native)
│  (iOS/Android)  │
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼─────────────────────────────────┐
│           Supabase Backend               │
│  ┌──────────────────────────────────┐   │
│  │  PostgreSQL Database             │   │
│  │  (multi-tenant with RLS)         │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Auth (built-in)                 │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Storage (images/docs)           │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  Edge Functions (payments, etc)  │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
         │
         │
┌────────▼────────┐
│ Business Portal │ (Next.js)
│   (Web Only)    │
└─────────────────┘

External Services:
├── Stripe (payments)
├── Expo Push (notifications)
└── SendGrid (email - optional for MVP)
```

---

## 📊 Database Schema (Lean Core)

### Core Tables

```sql
-- Multi-tenant anchor
businesses
  id (uuid)
  name
  type (enum: sports, fitness, beauty, wellness, education)
  slug (unique)
  phone, email, logo_url, location
  settings (jsonb)
  stripe_account_id
  is_active

-- Users (both customers and business staff)
users
  id (uuid) -- matches Supabase auth.users
  email, full_name, phone, avatar_url
  user_type (enum: customer, business_owner, staff)

-- Link staff to businesses
business_staff
  id, business_id (fk), user_id (fk)
  role (enum: owner, admin, coach, staff)

-- Children profiles (linked to parent users)
children
  id, parent_id (fk → users)
  first_name, last_name, date_of_birth
  medical_notes

-- Core service offerings
services
  id, business_id (fk)
  name, description
  service_type (enum: class, appointment, event, membership)
  duration_minutes, capacity, price
  image_url, is_active

-- Recurring schedules for classes
schedules
  id, service_id (fk)
  day_of_week (0-6), start_time, end_time
  staff_id (fk → users, nullable)
  capacity_override, is_active

-- Programs/Plans (e.g. "2 sessions per week")
plans
  id, business_id (fk), service_id (fk)
  name (e.g. "2x per week")
  sessions_per_week, total_sessions
  billing_cycle (enum: weekly, monthly, term, annual, one_time)
  term_weeks, price, is_active

-- Subscriptions (active memberships)
subscriptions
  id, business_id (fk), plan_id (fk)
  customer_id (fk), child_id (fk, nullable)
  status (enum: active, paused, cancelled, expired)
  start_date, end_date
  sessions_used
  stripe_subscription_id

-- All bookings (classes, appointments, events)
bookings
  id, business_id (fk), service_id (fk)
  schedule_id (fk), customer_id (fk)
  child_id (fk, nullable), subscription_id (fk, nullable)
  scheduled_date, start_time, end_time
  status (enum: confirmed, cancelled, completed, no_show)
  booking_type (enum: single, recurring)
  parent_booking_id (fk)
  attended (boolean), notes

-- Payments
payments
  id, business_id (fk), customer_id (fk)
  booking_id (fk), subscription_id (fk)
  amount, currency (default: AED)
  stripe_payment_id, stripe_payment_intent_id
  status (enum: pending, completed, failed, refunded)
  payment_date

-- Waitlist (when classes are full)
waitlist
  id, business_id (fk), service_id (fk)
  schedule_id (fk), customer_id (fk)
  child_id (fk), requested_date
  status (enum: waiting, notified, booked, expired)
```

### Member Portal Tables

```sql
-- Announcements (business → members)
announcements
  id, business_id (fk), author_id (fk)
  title, content
  target_audience (enum: all_members, specific_service, specific_members)
  service_id (fk, nullable)
  is_pinned, send_push, send_email
  published_at

-- Announcement recipients (tracking)
announcement_recipients
  id, announcement_id (fk), user_id (fk)
  is_read, read_at

-- Direct messages (1-on-1 communication)
messages
  id, business_id (fk)
  sender_id (fk), recipient_id (fk)
  message, is_read, read_at

-- Coach notes (private feedback)
member_notes
  id, business_id (fk)
  member_id (fk), child_id (fk, nullable)
  coach_id (fk), booking_id (fk, nullable)
  note, is_visible_to_parent

-- Check-ins (attendance with timestamp)
check_ins
  id, booking_id (fk)
  checked_in_by (fk), check_in_time
  check_out_time, notes

-- Achievements/Badges (gamification)
achievements
  id, business_id (fk)
  name, description, icon_url
  criteria (jsonb), is_active

-- Member achievements (earned)
member_achievements
  id, achievement_id (fk)
  member_id (fk), child_id (fk, nullable)
  earned_at

-- Skills (progress tracking)
skills
  id, business_id (fk), service_id (fk, nullable)
  name, description
  difficulty_level (enum: beginner, intermediate, advanced)
  sort_order, is_active

-- Member skill progress
member_skills
  id, member_id (fk), child_id (fk, nullable)
  skill_id (fk)
  proficiency (0-100)
  last_assessed_at, assessed_by (fk)
  notes
```

### Multi-Tenant Security

**Use Supabase Row Level Security (RLS):**

```sql
-- Example RLS policy
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see only their business data"
ON bookings
FOR ALL
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
  OR customer_id = auth.uid()
);
```

**Every table has `business_id` - this is your tenant isolation.**

---

## 🔌 API Structure (Supabase Client SDK)

No custom REST API needed - use Supabase client directly:

```typescript
// Customer App & Business Portal both use:

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Examples:
// Get services for a business
const { data } = await supabase
  .from('services')
  .select('*')
  .eq('business_id', businessId)
  .eq('is_active', true)

// Create a booking
const { data } = await supabase
  .from('bookings')
  .insert({
    business_id: businessId,
    service_id: serviceId,
    customer_id: userId,
    child_id: childId,
    scheduled_date: date,
    start_time: startTime,
    end_time: endTime,
    status: 'confirmed'
  })
```

### Edge Functions (only when needed)

```
/supabase/functions/
  process-payment/     # Stripe integration
  send-notification/   # Push notifications
  check-capacity/      # Booking validation
  generate-report/     # Business analytics (future)
```

---

## 📱 Customer App (Expo)

### Tech Stack
- **Expo** (React Native)
- **Expo Router** (file-based routing)
- **Supabase JS** (data + auth)
- **Stripe React Native SDK**
- **Expo Notifications**

### Folder Structure

```
/customer-app/
  app/
    (tabs)/
      index.tsx          # Home - Browse businesses (marketplace)
      my-clubs.tsx       # My active memberships → member portals
      explore.tsx        # Search & filter
      messages.tsx       # All communications
      profile.tsx        # Profile & children
    club/
      [businessId]/
        _layout.tsx      # Club member portal layout
        index.tsx        # Club home
        schedule.tsx     # My schedule (calendar)
        register.tsx     # Register for classes
        progress.tsx     # Attendance & skills
        messages.tsx     # Club messages
        settings.tsx     # Membership settings
    business/
      [slug].tsx         # Business detail page (discovery)
    service/
      [id].tsx           # Service detail & booking
    booking/
      select-time.tsx
      select-child.tsx
      confirm.tsx
      checkout.tsx
      success.tsx
    auth/
      login.tsx
      signup.tsx
  components/
    BusinessCard.tsx
    ServiceCard.tsx
    BookingCard.tsx
    ChildSelector.tsx
    ScheduleCalendar.tsx
    ProgressChart.tsx
    AnnouncementCard.tsx
    MessageThread.tsx
  lib/
    supabase.ts          # Supabase client
    stripe.ts            # Stripe helper
  utils/
    notifications.ts
```

### Key Screens (Updated)

**Discovery Mode (Non-Members):**
1. **Home** - Featured businesses, categories
2. **Business Profile** - Services, schedule, about
3. **Service Detail** - Description, times, book button
4. **Booking Flow** - Select child → select time → confirm → pay

**Member Mode (Active Subscriptions):**
1. **My Clubs** - List of active memberships
2. **Club Home** - Quick access to schedule, register, progress
3. **My Schedule** - Weekly calendar view with upcoming classes
4. **Register for Classes** - Book classes within plan limits
5. **My Progress** - Attendance, coach notes, skills, achievements
6. **Club Messages** - Announcements + direct messages with coaches
7. **Membership Settings** - Change plan, pause, cancel

**Shared:**
1. **Profile** - Manage children, payment methods, account settings
2. **Messages Hub** - All communications across all clubs

---

## 💼 Business Dashboard (Next.js)

### Tech Stack
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **shadcn/ui** (component library)
- **Supabase JS**
- **Recharts** (simple charts)

### Folder Structure

```
/business-dashboard/
  app/
    (auth)/
      login/
      signup/
    (dashboard)/
      layout.tsx         # Dashboard shell
      page.tsx           # Overview/stats
      services/
        page.tsx         # List services
        new/
        [id]/edit/
      schedule/
        page.tsx         # Weekly calendar
      bookings/
        page.tsx         # All bookings
      customers/
        page.tsx         # Customer list
      plans/
        page.tsx         # Pricing plans
      settings/
        page.tsx         # Business settings
  components/
    ServiceForm.tsx
    ScheduleCalendar.tsx
    BookingTable.tsx
    StatsCard.tsx
  lib/
    supabase.ts
```

### Key Features

**Core Management:**
1. **Dashboard** - Today's bookings, revenue, quick stats, recent activity
2. **Services** - CRUD for classes/appointments
3. **Schedule** - Drag-drop weekly schedule builder
4. **Bookings** - List view, mark attendance, cancel, class roster
5. **Members** - Contact info, booking history, attendance rate, progress
6. **Plans** - Create session packages and memberships
7. **Settings** - Business info, payment setup

**Member Engagement:**
8. **Communication Center** - Send announcements, direct messages
9. **Check-in System** - QR code or manual check-in, track attendance
10. **Progress Tracking** - Add coach notes, track skills, award achievements
11. **Automated Messages** - Set up reminders, follow-ups, welcome emails
12. **Reports** - Revenue, attendance trends, member retention

---

## 🎨 Simplified Booking Models

### Model 1: Drop-in Classes
- Service = "Parkour Beginners"
- Schedule = Mon 4:15, Tue 6:00, Fri 5:00
- Customer books individual sessions
- Pay per session or buy a plan (e.g. "4 sessions bundle")

### Model 2: Recurring Plans
- Customer buys "2 sessions per week" plan
- They can book any 2 from available schedule
- System tracks usage: `bookings_used / sessions_per_week`
- Renews monthly

### Model 3: Appointments
- Service = "Personal Training"
- Staff has availability slots
- Customer books 1-on-1 time
- Pay per appointment

### Model 4: Events/Camps
- One-time service with fixed date
- Example: "Summer Camp Aug 1-5"
- Single payment, multiple days

**MVP: Start with Model 1 only. Add others later.**

---

## 💳 Payment Flow (Stripe)

```typescript
// Simple flow:

1. Customer selects service + time
2. Create booking (status: pending)
3. Call Edge Function: process-payment
   - Create Stripe Payment Intent
   - Charge customer
4. On success: Update booking (status: confirmed)
5. Send confirmation notification
```

**Stripe Connect** for multi-tenant payouts:
- Each business has `stripe_account_id`
- Platform takes commission (optional)
- Automatic payouts to business bank accounts

**MVP: Use simple one-time payments. Add subscriptions later.**

---

## 🚀 MVP Roadmap (Updated)

### Phase 1: Core Booking (Week 1-4)
**Business Dashboard:**
- ✅ Business signup + onboarding
- ✅ Create services (name, price, capacity)
- ✅ Create weekly schedule
- ✅ View bookings list
- ✅ Stripe Connect setup

**Customer App:**
- ✅ Browse businesses (discovery)
- ✅ View services + schedule
- ✅ Create account + add children
- ✅ Book a single class
- ✅ Pay with Stripe
- ✅ View my bookings
- ✅ Cancel booking

**Backend:**
- ✅ Supabase schema
- ✅ RLS policies
- ✅ Auth flows
- ✅ Payment edge function

### Phase 2: Member Portal (Week 5-7)
**Customer App:**
- ✅ My Clubs screen (list active memberships)
- ✅ Member portal home
- ✅ My Schedule (weekly calendar)
- ✅ Register for classes (with session limits)
- ✅ Basic progress view (attendance tracking)

**Business Dashboard:**
- ✅ Member list with attendance rates
- ✅ Class roster view
- ✅ Manual check-in system
- ✅ View member details & booking history

**Backend:**
- ✅ Subscriptions table
- ✅ Check-ins table
- ✅ Session limit validation

### Phase 3: Communication (Week 8-9)
**Customer App:**
- ✅ Announcements feed
- ✅ Direct messaging with coaches
- ✅ Push notifications for messages
- ✅ Email notifications

**Business Dashboard:**
- ✅ Communication center
- ✅ Send announcements (to all or specific groups)
- ✅ Reply to member messages
- ✅ Automated message templates

**Backend:**
- ✅ Announcements + recipients tables
- ✅ Messages table
- ✅ Notification edge functions

### Phase 4: Engagement & Progress (Week 10-11)
**Customer App:**
- ✅ Detailed progress view
- ✅ Coach notes (visible to parents)
- ✅ Skills progress tracking
- ✅ Achievements/badges earned

**Business Dashboard:**
- ✅ Add coach notes after class
- ✅ Track member skills & proficiency
- ✅ Create & award achievements
- ✅ Member progress reports

**Backend:**
- ✅ Member notes table
- ✅ Skills + member_skills tables
- ✅ Achievements + member_achievements tables

### Phase 5: Polish & Launch (Week 12)
- ✅ Search & filters
- ✅ Business analytics/reports
- ✅ Booking limits (max per week)
- ✅ Performance optimization
- ✅ Testing with 3-5 pilot businesses
- ✅ Bug fixes
- ✅ App store submission

---

## 📈 Scalability Strategy

### How It Scales

**10 businesses → 10,000 businesses:**
- Same codebase, zero changes
- Multi-tenant by design (business_id everywhere)
- Supabase scales PostgreSQL automatically
- RLS handles security at database level

**Performance optimizations (when needed):**
```sql
-- Add indexes on hot queries
CREATE INDEX idx_bookings_business_date 
ON bookings(business_id, scheduled_date);

CREATE INDEX idx_services_business_active 
ON services(business_id, is_active);
```

**Database partitioning (at scale):**
- Partition bookings by date (future)
- Separate read replicas for analytics

**Cost optimization:**
- Supabase scales with usage
- Start on Pro plan (~$25/mo)
- Grows to Team/Enterprise as needed

---

## 🎯 Business Onboarding Flow

### Simple 5-Step Wizard

```
Step 1: Tell us about your business
  - Business name
  - Category (sports/fitness/beauty/etc)
  - Location
  - Contact info

Step 2: What do you offer?
  - Service type: Group Classes / Appointments / Events
  - Add first service (name, duration, price, capacity)

Step 3: Set your schedule
  - Pick days/times for your service
  - Assign capacity per session

Step 4: Payment setup
  - Connect Stripe account
  - Set currency (AED default)

Step 5: Launch! 🎉
  - Review booking page
  - Share link with customers
  - Start accepting bookings
```

**After onboarding:**
- Business gets unique URL: `raklife.ae/book/{business-slug}`
- Customers can book immediately

---

## 🔐 Multi-Tenant Security

### Simple Rules

1. **Every table has `business_id`**
2. **RLS enforces data isolation**
3. **Auth checks on every query**

```sql
-- Example: Staff can only see their business
CREATE POLICY "Staff access own business"
ON services
FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);

-- Example: Customers see only their bookings
CREATE POLICY "Customers see own bookings"
ON bookings
FOR SELECT
USING (customer_id = auth.uid());
```

**No complex middleware needed - database handles it.**

---

## 🛠️ Tech Decisions (Keep It Simple)

| Decision | Why |
|----------|-----|
| **Supabase** | Database + Auth + Storage + Functions in one |
| **Expo** | Fast mobile dev, works for iOS + Android |
| **Next.js** | Best React framework, great DX |
| **Tailwind + shadcn** | Fast UI dev, looks professional |
| **Stripe** | Standard for payments, UAE supported |
| **PostgreSQL** | Proven, scales forever, great for relational data |

**What we're NOT using (to stay lean):**
- ❌ Microservices (overkill)
- ❌ GraphQL (REST is fine)
- ❌ Docker/K8s (not needed with Supabase)
- ❌ Redux (React Context is enough)
- ❌ Complex state management

---

## 📁 Monorepo Structure

```
/raklife/
  customer-app/          # Expo mobile app
    app/
    components/
    lib/
    package.json
    
  business-dashboard/    # Next.js web app
    app/
    components/
    lib/
    package.json
    
  supabase/              # Backend
    migrations/          # SQL migrations
    functions/           # Edge functions
    seed.sql             # Sample data
    
  shared/                # Shared types/utils
    types.ts             # TypeScript types
    constants.ts         # Enums, configs
    
  package.json           # Root (if using monorepo)
  README.md
  ARCHITECTURE.md        # This file
```

---

## 🌍 Future Expansion

### When you're ready to scale globally:

**Localization:**
- Add `locale` column to businesses
- Translate UI strings
- Support multiple currencies

**Multi-city:**
- Add `city` filter to businesses table
- Location-based search in app
- City-specific landing pages

**Franchises:**
- Add `parent_business_id` for chains
- Shared branding, separate data

**Marketplace Features:**
- Reviews & ratings
- Featured listings
- Discovery algorithms
- In-app messaging

**Advanced Business Tools:**
- Inventory management
- Staff scheduling
- Marketing tools
- Custom branded apps

---

## 💡 Key Principles

1. **Start with one booking model** - Add complexity later
2. **Use Supabase features** - Don't reinvent auth, storage, etc
3. **RLS is your friend** - Security at database level
4. **Mobile-first UX** - Most customers book on phones
5. **Simple dashboard** - Business owners aren't technical
6. **Test with real businesses** - Get feedback early

---

## ✅ Success Metrics

**MVP Success:**
- 5 businesses onboarded
- 100 bookings processed
- Zero security incidents
- <2 second load times
- 99% uptime

**Scale Success:**
- 100+ businesses
- 10,000+ bookings/month
- Multi-city presence
- Profitable unit economics

---

## 🎬 Getting Started

### 1. Setup Supabase Project
```bash
# Create project at supabase.com
# Run migrations
supabase db push
```

### 2. Start Customer App
```bash
cd customer-app
npm install
npx expo start
```

### 3. Start Business Dashboard
```bash
cd business-dashboard
npm install
npm run dev
```

### 4. Configure Stripe
- Create Stripe account
- Enable Stripe Connect
- Add webhook endpoints

---

**This is your foundation. Build it lean, launch fast, iterate based on real feedback.**
