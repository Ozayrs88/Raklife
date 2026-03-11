# RAKlife - Quick Reference

## 📁 Project Structure

```
raklife/
├── ARCHITECTURE.md              ← Full system design
├── DATABASE.sql                 ← Complete database schema
├── MEMBER-PORTAL-FEATURES.md    ← Member portal specifications
├── MVP-CHECKLIST.md             ← Week-by-week tasks
├── FOLDER-STRUCTURE.md          ← Detailed file organization
├── GETTING-STARTED.md           ← Setup instructions
├── README.md                    ← This file
│
├── customer-app/                ← Expo mobile app
├── business-dashboard/          ← Next.js web app
├── supabase/                    ← Backend & edge functions
└── shared/                      ← Shared types (optional)
```

---

## 🎯 What Is This?

**RAKlife** is a full-stack member management SaaS for local service businesses:
- Kids sports academies
- Fitness studios
- Salons & beauty
- Tutors & education
- Wellness clinics
- Workshops & camps

**Two modes:**
1. **Discovery** - Browse and book activities (like ClassPass)
2. **Member Portal** - Manage your club membership (like TeamSnap)

---

## 🏗️ Tech Stack

| Component | Technology | Why |
|-----------|------------|-----|
| Mobile App | Expo (React Native) | Fast dev, cross-platform |
| Dashboard | Next.js 14 + Tailwind | Best React framework |
| Backend | Supabase (PostgreSQL) | Database + Auth + Storage all-in-one |
| Payments | Stripe Connect | Standard, UAE supported |
| Hosting | Vercel + Expo EAS | Simple deployment |

---

## 🚀 Quick Start

### 1. Setup (Day 1)
```bash
# Create accounts
- Supabase.com (database)
- Stripe.com (payments)
- Expo.dev (mobile app)

# Install tools
npm install -g supabase expo-cli

# Clone/setup project
mkdir raklife && cd raklife
```

### 2. Database (Day 1)
```bash
# In Supabase Dashboard → SQL Editor
# Copy/paste DATABASE.sql
# Run query
# Verify tables created
```

### 3. Customer App (Day 2)
```bash
npx create-expo-app customer-app --template expo-template-blank-typescript
cd customer-app
npx expo install @supabase/supabase-js @stripe/stripe-react-native
npx expo start
```

### 4. Business Dashboard (Day 2)
```bash
npx create-next-app business-dashboard --typescript --tailwind --app
cd business-dashboard
npm install @supabase/supabase-js @supabase/ssr
npm run dev
```

---

## 📊 Database Overview

**Core Tables:**
- `businesses` - Service providers (multi-tenant anchor)
- `users` - Customers & staff
- `services` - What businesses offer
- `schedules` - Weekly recurring times
- `plans` - Membership packages (1x, 2x, 3x per week)
- `subscriptions` - Active memberships
- `bookings` - All reservations
- `payments` - Stripe transactions

**Member Portal Tables:**
- `announcements` - Business → member communications
- `messages` - Direct messaging
- `member_notes` - Coach feedback
- `check_ins` - Attendance tracking
- `achievements` - Gamification badges
- `skills` + `member_skills` - Progress tracking

**Security:** Row Level Security (RLS) on every table - database enforces multi-tenant isolation.

---

## 🎨 Key Features

### Customer App
**Discovery:**
- Browse businesses
- Search & filters
- View services/schedules
- Book & pay (one-time)

**Member Portal:**
- My Clubs (active memberships)
- My Schedule (weekly calendar)
- Register for classes (within plan limits)
- Progress tracking (attendance, skills, achievements)
- Messages (announcements + direct chat)
- Membership management

### Business Dashboard
**Core Management:**
- Onboarding wizard
- Services & schedule builder
- Bookings & roster management
- Member directory
- Plans & pricing

**Engagement:**
- Communication center (announcements, messages)
- Check-in system
- Coach notes
- Skills & progress tracking
- Achievements/badges
- Analytics & reports

---

## 📱 App Navigation

### Customer App (Bottom Tabs)
```
┌─────────┬──────────┬─────────┬─────────┬─────────┐
│  Home   │ My Clubs │ Explore │Messages │ Profile │
└─────────┴──────────┴─────────┴─────────┴─────────┘
```

### Member Portal (Inside Club)
```
┌─────────────────────────────────────┐
│  ← RAK Parkour Academy              │
├─────────────────────────────────────┤
│  📅 My Schedule                     │
│  📝 Register                        │
│  📊 Progress                        │
│  💬 Messages                        │
│  ⚙️  Settings                       │
└─────────────────────────────────────┘
```

---

## 🗺️ Roadmap

### Phase 1: Core Booking (Week 1-4)
- Auth, services, schedule, basic booking flow

### Phase 2: Member Portal (Week 5-7)
- My Clubs, schedule, register, check-ins

### Phase 3: Communication (Week 8-9)
- Announcements, messages, notifications

### Phase 4: Progress (Week 10-11)
- Coach notes, skills, achievements

### Phase 5: Launch (Week 12)
- Polish, testing, deployment

**Total: 12 weeks to MVP**

---

## 💡 Key Design Decisions

### Why Supabase?
- PostgreSQL (proven, scales forever)
- Built-in auth (no custom JWT logic)
- Row Level Security (database-level multi-tenancy)
- Edge Functions (serverless)
- Storage (file uploads)
- Real-time (websockets)
- All in one platform = less complexity

### Why Expo?
- Fast development (hot reload)
- Cross-platform (iOS + Android from one codebase)
- Over-the-air updates
- Built-in navigation (Expo Router)
- EAS Build (cloud building)
- Simpler than bare React Native

### Why Not Microservices?
- Overkill for MVP
- Adds complexity with no benefit at this scale
- Supabase + Edge Functions = serverless microservices when needed

### Why Not GraphQL?
- REST is simpler
- Supabase client is REST-based
- Less overhead, faster development

---

## 🔒 Security

**Multi-Tenant Isolation:**
- Every table has `business_id`
- Row Level Security (RLS) enforces data access
- Policies check: "Does this user belong to this business?"

**Example RLS Policy:**
```sql
CREATE POLICY "Staff can view own business bookings"
ON bookings FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM business_staff 
    WHERE user_id = auth.uid()
  )
);
```

**No custom security code needed - database handles it.**

---

## 💰 Pricing Model

**For Businesses:**
- Commission on bookings (e.g., 5-10%)
- OR flat monthly fee per business
- OR hybrid (small fee + commission)

**Stripe Connect:** Automatic payouts to business bank accounts

**For Customers:**
- Free to browse
- Pay per booking or membership
- Platform commission included in price

---

## 📈 Scalability

**How it scales:**
- 10 businesses → Same code
- 100 businesses → Same code
- 10,000 businesses → Same code + database optimization

**Optimizations (when needed):**
- Add database indexes
- Connection pooling
- Read replicas for analytics
- CDN for images
- Caching layer

**Supabase automatically scales PostgreSQL.**

---

## 🧪 Testing

**Test with Stripe:**
- Card: `4242 4242 4242 4242`
- Any future expiry, any CVC

**Test Accounts:**
- Customer: `test-customer@raklife.ae`
- Business: `test-business@raklife.ae`

**Test Scenarios:**
1. Customer books a class
2. Customer subscribes to plan
3. Business creates schedule
4. Business sends announcement
5. Coach marks attendance
6. Coach adds note

---

## 🆘 Need Help?

**Read these first:**
- `GETTING-STARTED.md` - Setup instructions
- `ARCHITECTURE.md` - System design
- `MEMBER-PORTAL-FEATURES.md` - Feature specs
- `MVP-CHECKLIST.md` - What to build when

**Common Issues:**
- RLS policies blocking queries → Check `auth.uid()` matches
- Expo build failing → Clear cache with `npx expo start -c`
- Stripe webhook failing → Verify signing secret

**Resources:**
- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)

---

## ✅ Next Steps

1. **Read GETTING-STARTED.md** for detailed setup
2. **Run DATABASE.sql** in Supabase
3. **Initialize customer-app** and **business-dashboard**
4. **Follow MVP-CHECKLIST.md** week by week

**Focus on Phase 1 first:** Get booking flow working end-to-end.

---

## 🎯 Success Criteria

**MVP is ready when:**
- ✅ A business can onboard in <10 minutes
- ✅ A customer can book in <3 taps
- ✅ Payment processing works flawlessly
- ✅ Members can use their portal daily
- ✅ Communication flows smoothly
- ✅ 5 businesses actively using it
- ✅ 100+ successful bookings

---

## 📝 Notes

**Keep it lean:**
- Build only what's in the MVP checklist
- Don't add features early
- Test with real users ASAP
- Iterate based on feedback

**Prioritize:**
1. Booking flow (must be perfect)
2. Payment processing (must be reliable)
3. Member portal (differentiation)
4. Communication (retention)

**Remember:**
- Ship fast, iterate
- Perfect is the enemy of done
- Real users > perfect code

---

**Let's build this! 🚀**
