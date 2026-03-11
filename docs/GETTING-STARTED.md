# Getting Started - RAKlife Development

## 🎯 What We're Building

A **full-stack member management SaaS** where:
- Businesses manage their club operations
- Members get their own portal within each club
- Everyone communicates seamlessly
- Progress is tracked and celebrated

---

## 📋 Pre-Development Checklist

### 1. Accounts & Setup (Day 1)

**Create these accounts:**
- [ ] **Supabase** - Database, auth, storage, edge functions
  - Go to [supabase.com](https://supabase.com)
  - Create new project
  - Choose region (closest to UAE)
  - Save: `Project URL`, `anon public key`, `service_role key`

- [ ] **Stripe** - Payment processing
  - Go to [stripe.com](https://stripe.com)
  - Create account
  - Enable Stripe Connect (for multi-tenant payouts)
  - Save: `Publishable key`, `Secret key`
  - Set up webhooks later

- [ ] **Expo** - Mobile app development
  - Go to [expo.dev](https://expo.dev)
  - Create account
  - Install Expo CLI: `npm install -g expo-cli`

- [ ] **Vercel** (optional) - Dashboard hosting
  - Go to [vercel.com](https://vercel.com)
  - Sign up with GitHub

### 2. Development Tools

**Install these:**
```bash
# Node.js (v18 or higher)
# Download from nodejs.org

# Git
# Download from git-scm.com

# VS Code (recommended)
# Download from code.visualstudio.com

# Supabase CLI
npm install -g supabase

# Expo CLI
npm install -g expo-cli

# Yarn (optional, faster than npm)
npm install -g yarn
```

**VS Code Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Expo Tools

---

## 🏗️ Project Setup (Day 1-2)

### Step 1: Initialize Project Structure

```bash
# Create main directory
mkdir raklife
cd raklife

# Initialize git
git init

# Create documentation (already done!)
# - ARCHITECTURE.md
# - DATABASE.sql
# - MEMBER-PORTAL-FEATURES.md
# - MVP-CHECKLIST.md
# - FOLDER-STRUCTURE.md

# Create .gitignore
cat > .gitignore << EOF
node_modules/
.env
.env.local
*.log
.DS_Store
.expo/
.next/
dist/
build/
EOF
```

### Step 2: Setup Supabase Backend

```bash
# Link to your Supabase project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Create migrations folder
mkdir -p supabase/migrations

# Copy your DATABASE.sql to migrations
cp DATABASE.sql supabase/migrations/20240301000000_initial_schema.sql

# Push to Supabase
supabase db push

# Verify tables were created
supabase db status
```

**Alternative: Manual Setup**
1. Go to Supabase Dashboard
2. Click "SQL Editor"
3. Paste entire `DATABASE.sql` contents
4. Run query
5. Verify tables in "Table Editor"

### Step 3: Initialize Customer App (Expo)

```bash
# Create Expo app with TypeScript
npx create-expo-app customer-app --template expo-template-blank-typescript

cd customer-app

# Install core dependencies
npx expo install @supabase/supabase-js
npx expo install @stripe/stripe-react-native
npx expo install expo-router
npx expo install expo-notifications
npx expo install expo-constants
npx expo install expo-linking
npx expo install expo-secure-store
npx expo install react-native-safe-area-context
npx expo install react-native-screens

# Install UI/utility libraries
npm install date-fns
npm install react-hook-form
npm install zod

# Create environment file
cat > .env << EOF
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
EOF

# Update app.json for Expo Router
```

**Configure `app.json`:**
```json
{
  "expo": {
    "name": "RAKlife",
    "slug": "raklife",
    "version": "1.0.0",
    "scheme": "raklife",
    "platforms": ["ios", "android"],
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ]
  }
}
```

### Step 4: Initialize Business Dashboard (Next.js)

```bash
cd ..
npx create-next-app@latest business-dashboard --typescript --tailwind --app --no-src-dir

cd business-dashboard

# Install dependencies
npm install @supabase/supabase-js
npm install @supabase/ssr
npm install stripe
npm install date-fns
npm install recharts
npm install react-hook-form
npm install zod

# Install shadcn/ui
npx shadcn-ui@latest init

# Add core shadcn components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add form
npx shadcn-ui@latest add select
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add toast

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key
STRIPE_SECRET_KEY=your-stripe-secret
EOF
```

### Step 5: Setup Supabase Edge Functions

```bash
cd ..

# Create edge functions folder
mkdir -p supabase/functions

# Create process-payment function
supabase functions new process-payment

# Create send-notification function
supabase functions new send-notification

# Create cancel-booking function
supabase functions new cancel-booking
```

---

## 🔨 Development Workflow (Day 3+)

### Run Everything Locally

**Terminal 1: Customer App**
```bash
cd customer-app
npx expo start
# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Scan QR code for physical device
```

**Terminal 2: Business Dashboard**
```bash
cd business-dashboard
npm run dev
# Opens at http://localhost:3000
```

**Terminal 3: Supabase Local (Optional)**
```bash
supabase start
# Runs local Supabase instance for testing
```

---

## 📱 Build Order (Follow MVP Checklist)

### Week 1-2: Foundation

**Backend:**
1. ✅ Database schema deployed
2. Test RLS policies
3. Create seed data for testing

**Customer App:**
1. Create Supabase client (`lib/supabase.ts`)
2. Build auth screens (login/signup)
3. Test authentication flow
4. Create basic navigation structure

**Business Dashboard:**
1. Create Supabase client (`lib/supabase.ts`)
2. Build auth screens (login/signup)
3. Create dashboard layout (sidebar, header)
4. Test authentication flow

### Week 3-4: Core Booking

**Business Dashboard:**
1. Onboarding wizard
   - Business info form
   - Create first service
   - Add weekly schedule
   - Connect Stripe
2. Services CRUD
3. Schedule builder
4. Bookings list view

**Customer App:**
1. Browse businesses (home screen)
2. Business detail page
3. Service detail page
4. Booking flow:
   - Select date/time
   - Select child
   - Confirm booking
   - Stripe payment
5. My bookings list

**Backend:**
1. Edge function: `process-payment`
2. Edge function: `cancel-booking`
3. Webhook handlers

### Week 5-7: Member Portal

**Customer App:**
1. My Clubs screen
2. Club member portal layout
3. My Schedule (weekly view)
4. Register for classes
5. Basic progress view (attendance)

**Business Dashboard:**
1. Member list with filters
2. Member detail view
3. Class roster
4. Check-in system (manual)

### Week 8-9: Communication

**Customer App:**
1. Announcements feed
2. Messages screen
3. Push notifications setup

**Business Dashboard:**
1. Communication center
2. Send announcements
3. Reply to messages
4. Automated message templates

**Backend:**
1. Edge function: `send-notification`
2. Set up push notification service

### Week 10-11: Progress & Engagement

**Customer App:**
1. Detailed progress page
2. Coach notes display
3. Skills progress
4. Achievements/badges

**Business Dashboard:**
1. Add coach notes
2. Track member skills
3. Create & award achievements
4. Progress reports

### Week 12: Polish & Launch

1. Bug fixes
2. Performance optimization
3. Testing with pilot businesses
4. App store preparation
5. Deployment

---

## 🧪 Testing Strategy

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up as customer
- [ ] Sign up as business
- [ ] Login/logout
- [ ] Password reset

**Booking Flow (Customer):**
- [ ] Browse businesses
- [ ] View service details
- [ ] Book a class
- [ ] Pay with test Stripe card
- [ ] View booking confirmation
- [ ] Cancel booking
- [ ] Join waitlist (when full)

**Membership Flow:**
- [ ] Subscribe to plan
- [ ] View My Clubs
- [ ] Register for class within plan limits
- [ ] View schedule
- [ ] Check progress

**Business Management:**
- [ ] Complete onboarding
- [ ] Create service
- [ ] Add schedule
- [ ] View bookings
- [ ] Check in member
- [ ] Send announcement
- [ ] Add coach note

### Test Data

Create test accounts:
- **Customer 1:** john@test.com (with 2 children)
- **Customer 2:** sarah@test.com (with 1 child)
- **Business 1:** parkour@test.com (RAK Parkour Academy)
- **Business 2:** fitness@test.com (Fitness Studio)

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

---

## 🚀 Deployment

### Customer App (Expo)

```bash
# Build for iOS
cd customer-app
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Business Dashboard (Vercel)

```bash
cd business-dashboard

# Connect to Vercel
vercel

# Set environment variables in Vercel dashboard
# Deploy
vercel --prod
```

### Supabase Edge Functions

```bash
# Deploy all functions
supabase functions deploy process-payment
supabase functions deploy send-notification
supabase functions deploy cancel-booking
```

---

## 📊 Monitoring & Analytics

### Setup These Services:

**Error Tracking:**
- Sentry (for both mobile and web)
- Track crashes and errors

**Analytics:**
- Mixpanel or PostHog
- Track user behavior
- Funnel analysis
- Retention metrics

**Performance:**
- Supabase Dashboard (database performance)
- Vercel Analytics (dashboard performance)
- Expo Performance (mobile app performance)

---

## 🎯 Success Metrics

### Week 4 Goal:
- 1 test business fully onboarded
- 10 test bookings processed
- Payment flow working end-to-end

### Week 8 Goal:
- 3 pilot businesses using platform
- Members actively using portal
- Communication system in use

### Week 12 Goal (Launch):
- 5-10 real businesses
- 100+ bookings processed
- <2s load times
- Zero security issues
- App store approved

---

## 🆘 Troubleshooting

### Common Issues:

**Supabase RLS:**
- Test policies using SQL Editor
- Use `auth.uid()` for current user
- Check business_id relationships

**Expo Build Errors:**
- Clear cache: `npx expo start -c`
- Reinstall: `rm -rf node_modules && npm install`
- Check `app.json` configuration

**Stripe Webhooks:**
- Use Stripe CLI for local testing
- Verify webhook signing secret
- Check webhook delivery in Stripe dashboard

**Next.js Client/Server:**
- Use `'use client'` directive for client components
- Server Components for data fetching
- Check Supabase SSR setup

---

## 📚 Resources

**Documentation:**
- [Supabase Docs](https://supabase.com/docs)
- [Expo Docs](https://docs.expo.dev)
- [Next.js Docs](https://nextjs.org/docs)
- [Stripe Connect Docs](https://stripe.com/docs/connect)

**Learning:**
- Supabase YouTube Channel
- Expo YouTube Channel
- Next.js YouTube Channel

**Community:**
- Supabase Discord
- Expo Discord
- r/reactnative
- r/nextjs

---

## ✅ What To Do Right Now

1. **Today:**
   - [ ] Create Supabase account
   - [ ] Create Stripe account
   - [ ] Create Expo account
   - [ ] Run database migration
   - [ ] Initialize customer-app
   - [ ] Initialize business-dashboard

2. **This Week:**
   - [ ] Build auth screens for both apps
   - [ ] Test authentication flow
   - [ ] Create basic navigation
   - [ ] Create Supabase helper functions

3. **Next Week:**
   - [ ] Start onboarding wizard
   - [ ] Build service creation form
   - [ ] Build booking flow
   - [ ] Integrate Stripe

**Let's start building! 🚀**

---

**Need help with any specific part? I can:**
- Generate the exact code for auth setup
- Create the Supabase client configuration
- Build specific screens/components
- Write Edge Functions
- Set up Stripe integration
- Debug issues
