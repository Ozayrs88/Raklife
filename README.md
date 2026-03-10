# RAKlife Business Dashboard

Business management dashboard for RAKlife - built with Next.js 14 and Supabase.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account (optional for now)

### Installation

1. **Navigate to the dashboard folder:**
   ```bash
   cd business-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Copy `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📋 Features

### ✅ Completed
- **Authentication** - Login/Signup with Supabase Auth
- **Onboarding Wizard** - 5-step business setup:
  1. Business information
  2. Create first service
  3. Add schedule (placeholder)
  4. Connect Stripe (placeholder)
  5. Review and launch
- **Dashboard** - View services, bookings, and revenue
- **Protected Routes** - Middleware authentication

### 🚧 Coming Soon
- Services management (CRUD)
- Schedule builder (weekly calendar)
- Bookings list with filters
- Stripe Connect integration
- Customer management
- Analytics & reports
- Settings page
- Image uploads

## 🗂️ Project Structure

```
business-dashboard/
├── app/
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── onboarding/         # Onboarding wizard
│   ├── dashboard/          # Main dashboard
│   │   ├── page.tsx        # Server component
│   │   └── DashboardContent.tsx # Client component
│   └── page.tsx            # Home (redirects to login)
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   ├── server.ts       # Server client
│   │   └── middleware.ts   # Auth middleware
│   └── utils.ts            # Utility functions
├── components/
│   └── ui/                 # shadcn UI components
├── middleware.ts           # Next.js middleware
└── .env.local              # Environment variables
```

## 🔑 How It Works

1. **User signs up** → Creates auth user in Supabase
2. **Redirected to onboarding** → Completes 5-step wizard
3. **Business created** → Data stored in Supabase `businesses` table
4. **Service created** → Data stored in Supabase `services` table
5. **Redirected to dashboard** → View business overview

## 📊 Database Tables Used

- `businesses` - Business profiles
- `services` - Services offered by businesses
- `bookings` - Customer bookings (read-only for now)
- `users` - Auth users (Supabase Auth)

## 🎨 UI Components

Built with **shadcn/ui** and **Tailwind CSS**:
- Card
- Button
- Input
- Label
- Select
- Progress
- Dialog
- Sonner (toasts)

## 🔐 Authentication Flow

```
/ → /login (if not authenticated)
/login → /onboarding (after signup)
/onboarding → /dashboard (after completion)
/dashboard → (protected, requires auth)
```

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **TypeScript:** Full type safety

## 📝 Next Steps

1. Add services management page
2. Build schedule builder
3. Add bookings list view
4. Integrate Stripe Connect
5. Add image upload for business logo
6. Create settings page
7. Build analytics dashboard

## 🆘 Troubleshooting

**Port already in use:**
```bash
kill -9 $(lsof -ti:3000)
npm run dev
```

**Supabase connection error:**
- Check your `.env.local` file
- Verify Supabase project is running
- Check RLS policies are set correctly

**Build errors:**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

## 📖 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
