# Project Folder Structure

## 📁 Monorepo Layout

```
raklife/
├── README.md
├── ARCHITECTURE.md
├── DATABASE.sql
├── MVP-CHECKLIST.md
├── .gitignore
├── package.json (optional - for monorepo tools)
│
├── customer-app/              # Expo mobile app
├── business-dashboard/        # Next.js web app
├── supabase/                  # Backend config
└── shared/                    # Shared code
```

---

## 📱 Customer App (Expo)

```
customer-app/
├── app/                       # Expo Router (file-based routing)
│   ├── _layout.tsx            # Root layout
│   ├── index.tsx              # Entry point → redirect to (tabs)
│   │
│   ├── (auth)/                # Auth group (no tabs)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)/                # Main app (with bottom tabs)
│   │   ├── _layout.tsx        # Tab navigator
│   │   ├── index.tsx          # Home - Browse businesses
│   │   ├── explore.tsx        # Search & filters
│   │   ├── bookings.tsx       # My bookings
│   │   └── profile.tsx        # User profile
│   │
│   ├── business/
│   │   └── [slug].tsx         # Business detail page
│   │
│   ├── service/
│   │   └── [id].tsx           # Service detail & schedule
│   │
│   ├── booking/
│   │   ├── select-time.tsx    # Time slot picker
│   │   ├── select-child.tsx   # Child selector
│   │   ├── confirm.tsx        # Booking summary
│   │   ├── checkout.tsx       # Payment screen
│   │   └── success.tsx        # Confirmation
│   │
│   └── children/
│       ├── index.tsx          # List children
│       └── add.tsx            # Add child form
│
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── BottomSheet.tsx
│   │
│   ├── BusinessCard.tsx       # Business list item
│   ├── ServiceCard.tsx        # Service list item
│   ├── BookingCard.tsx        # Booking list item
│   ├── ScheduleGrid.tsx       # Weekly schedule display
│   ├── TimeSlotPicker.tsx     # Time selection
│   ├── ChildSelector.tsx      # Child selection
│   └── CategoryFilter.tsx     # Category chips
│
├── lib/
│   ├── supabase.ts            # Supabase client config
│   ├── stripe.ts              # Stripe helpers
│   └── api.ts                 # API helper functions
│
├── hooks/
│   ├── useAuth.ts             # Auth state & functions
│   ├── useBusinesses.ts       # Fetch businesses
│   ├── useServices.ts         # Fetch services
│   ├── useBookings.ts         # Fetch/create bookings
│   └── useNotifications.ts    # Push notifications
│
├── utils/
│   ├── notifications.ts       # Expo Push setup
│   ├── formatters.ts          # Date/time/currency formatters
│   └── validators.ts          # Form validation
│
├── constants/
│   ├── Colors.ts              # Theme colors
│   └── Config.ts              # App config
│
├── types/
│   └── index.ts               # TypeScript types
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── app.json                   # Expo config
├── package.json
├── tsconfig.json
├── .env.example
└── .env                       # Environment variables
```

---

## 💼 Business Dashboard (Next.js)

```
business-dashboard/
├── app/
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Landing page (redirect to login or dashboard)
│   │
│   ├── (auth)/                # Auth pages (no dashboard layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── onboarding/        # Setup wizard
│   │       ├── page.tsx       # Step 1: Business info
│   │       ├── services/
│   │       ├── schedule/
│   │       ├── payment/
│   │       └── complete/
│   │
│   └── (dashboard)/           # Main dashboard (with sidebar)
│       ├── layout.tsx         # Dashboard layout
│       ├── page.tsx           # Overview/stats
│       │
│       ├── services/
│       │   ├── page.tsx       # List all services
│       │   ├── new/
│       │   │   └── page.tsx   # Create service
│       │   └── [id]/
│       │       └── edit/
│       │           └── page.tsx
│       │
│       ├── schedule/
│       │   └── page.tsx       # Weekly schedule builder
│       │
│       ├── bookings/
│       │   ├── page.tsx       # All bookings
│       │   └── [id]/
│       │       └── page.tsx   # Booking detail
│       │
│       ├── customers/
│       │   ├── page.tsx       # Customer list
│       │   └── [id]/
│       │       └── page.tsx   # Customer detail
│       │
│       ├── plans/
│       │   ├── page.tsx       # List plans
│       │   └── new/
│       │       └── page.tsx
│       │
│       ├── payments/
│       │   └── page.tsx       # Payment history
│       │
│       ├── staff/
│       │   ├── page.tsx       # Manage staff
│       │   └── invite/
│       │       └── page.tsx
│       │
│       └── settings/
│           ├── page.tsx       # Business settings
│           ├── profile/
│           ├── billing/
│           └── notifications/
│
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── ... (other shadcn components)
│   │
│   ├── layout/
│   │   ├── DashboardLayout.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   │
│   ├── forms/
│   │   ├── ServiceForm.tsx
│   │   ├── ScheduleForm.tsx
│   │   ├── PlanForm.tsx
│   │   └── BusinessInfoForm.tsx
│   │
│   ├── ServiceCard.tsx
│   ├── BookingTable.tsx
│   ├── CustomerTable.tsx
│   ├── ScheduleCalendar.tsx   # Weekly calendar view
│   ├── StatsCard.tsx          # Dashboard stats
│   └── OnboardingWizard.tsx
│
├── lib/
│   ├── supabase.ts            # Supabase client
│   ├── utils.ts               # Utility functions (cn, etc)
│   └── api.ts                 # API helpers
│
├── hooks/
│   ├── useAuth.ts
│   ├── useBusiness.ts
│   ├── useServices.ts
│   ├── useBookings.ts
│   └── useStats.ts
│
├── types/
│   └── index.ts
│
├── public/
│   ├── images/
│   └── icons/
│
├── styles/
│   └── globals.css            # Tailwind + custom styles
│
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── .env.local.example
└── .env.local
```

---

## 🗄️ Supabase

```
supabase/
├── migrations/
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240102000000_add_waitlist.sql
│   └── ...
│
├── functions/                 # Edge Functions
│   ├── process-payment/
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── send-notification/
│   │   ├── index.ts
│   │   └── package.json
│   │
│   ├── cancel-booking/
│   │   ├── index.ts
│   │   └── package.json
│   │
│   └── check-capacity/
│       ├── index.ts
│       └── package.json
│
├── seed.sql                   # Sample data for development
├── config.toml                # Supabase CLI config
└── .env.example
```

---

## 🔗 Shared (Optional)

```
shared/
├── types/
│   ├── database.ts            # Database types (auto-generated)
│   ├── api.ts                 # API response types
│   └── index.ts
│
├── constants/
│   ├── business-types.ts      # Enums
│   ├── service-types.ts
│   └── booking-status.ts
│
└── utils/
    ├── date-helpers.ts        # Shared date utilities
    ├── formatters.ts          # Currency, phone, etc
    └── validators.ts          # Validation schemas
```

---

## 🔧 Root Config Files

```
raklife/
├── .gitignore
├── .env.example               # Template for all env vars
├── README.md
├── ARCHITECTURE.md
├── DATABASE.sql
├── MVP-CHECKLIST.md
└── package.json               # Optional: monorepo scripts
```

### Example `.gitignore`

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env.local
.env.production.local
*.local

# Next.js
.next/
out/
build/

# Expo
.expo/
dist/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# Misc
.DS_Store
*.log
*.swp
.vscode/
.idea/

# Supabase
supabase/.branches
supabase/.temp
```

### Example `.env.example`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 📦 Dependencies

### Customer App (package.json)

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-router": "~3.5.0",
    "react": "18.2.0",
    "react-native": "0.74.0",
    "@supabase/supabase-js": "^2.38.0",
    "@stripe/stripe-react-native": "^0.37.0",
    "expo-notifications": "~0.28.0",
    "expo-linking": "~6.3.0",
    "expo-constants": "~16.0.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.45",
    "typescript": "^5.3.0"
  }
}
```

### Business Dashboard (package.json)

```json
{
  "dependencies": {
    "next": "14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.0.10",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "recharts": "^2.12.0",
    "date-fns": "^3.3.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "typescript": "^5",
    "eslint": "^8",
    "eslint-config-next": "14.2.0"
  }
}
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
# Clone repo
git clone <repo-url>
cd raklife

# Install customer app
cd customer-app
npm install

# Install business dashboard
cd ../business-dashboard
npm install
```

### 2. Setup Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 3. Configure Environment

```bash
# Copy .env templates
cp .env.example .env

# Fill in your Supabase & Stripe keys
```

### 4. Run Development

```bash
# Terminal 1: Customer app
cd customer-app
npx expo start

# Terminal 2: Business dashboard
cd business-dashboard
npm run dev
```

---

**This structure keeps everything organized and scalable. Start simple, add complexity only when needed.**
