# 🎨 RAKlife Design System

Inspired by **bestdubai.com** - A modern, clean, and professional lifestyle booking platform.

---

## 🎯 Design Philosophy

Following bestdubai.com's aesthetic:
- **Clean & Minimal** - White space, clear hierarchy
- **Card-Based Layout** - Everything in organized cards
- **Modern Typography** - Clear, readable fonts
- **Professional Colors** - Subtle, sophisticated palette
- **Smooth Interactions** - Polished animations and transitions
- **Mobile-First** - Responsive and touch-friendly

---

## 🎨 Visual Style

### Color Palette
```
Primary: Slate/Blue tones (professional, trustworthy)
Accent: Subtle highlights for CTAs
Background: Clean whites and light grays
Text: Dark grays for readability
Success: Green for confirmations
Warning: Amber for alerts
Error: Red for critical actions
```

### Typography
```
Headings: Bold, clear hierarchy
Body: Readable 14-16px
Labels: 12-14px, subtle colors
Monospace: For codes/numbers
```

### Spacing
```
Cards: Generous padding (16-24px)
Sections: Clear separation (32-48px)
Components: Consistent gaps (8-16px)
```

---

## 🧩 shadcn Components Installed

### ✅ Layout Components
- **Card** - Primary container for content
- **Separator** - Divides sections elegantly
- **Sheet** - Side panels and drawers
- **Tabs** - Organize related content

### ✅ Data Display
- **Table** - Clean data presentation
- **Badge** - Status indicators
- **Avatar** - User profiles
- **Skeleton** - Loading states

### ✅ Interactive
- **Button** - Multiple variants (default, outline, ghost)
- **Input** - Clean form fields
- **Select** - Dropdown selections
- **Dialog** - Modal interactions
- **Alert Dialog** - Important confirmations
- **Dropdown Menu** - Context menus

### ✅ Feedback
- **Progress** - Visual progress bars
- **Sonner** - Toast notifications
- **Label** - Form labels

---

## 📱 Business Dashboard Design

### Homepage/Dashboard
```tsx
Grid Layout:
├─ Metrics Cards (4 columns)
│  ├─ Active Enrollments
│  ├─ This Week's Sessions
│  ├─ Monthly Revenue
│  └─ Attendance Rate
│
├─ Recent Activity (Table)
└─ Quick Actions (Buttons)
```

### Services Page
```tsx
Card Grid:
├─ Service Card
│  ├─ Avatar/Icon
│  ├─ Title & Description
│  ├─ Badge (Active/Inactive)
│  └─ Actions (Edit/View)
```

### Bookings Page
```tsx
Tabs Layout:
├─ Active Enrollments Tab
│  └─ Table with status badges
│
└─ Upcoming Sessions Tab
   └─ Calendar-style cards
```

### Customers Page
```tsx
Table Layout:
├─ Avatar + Name
├─ Email
├─ Enrollments Count
├─ Total Spent
└─ Actions (Dropdown Menu)
```

---

## 📱 Mobile App Design (React Native)

### shadcn-inspired Components for RN

Since shadcn is web-only, we'll use these React Native alternatives:

#### Component Mapping
```
shadcn (Web)          →  React Native Alternative
─────────────────────────────────────────────────────
Card                  →  Custom Card component (View + Shadow)
Button                →  Pressable with variants
Badge                 →  View with rounded corners
Avatar                →  Image with border radius
Table                 →  FlatList with custom rows
Tabs                  →  React Native Tab View
Sheet                 →  Bottom Sheet (gorhom/bottom-sheet)
Dialog                →  Modal (react-native)
Input                 →  TextInput with styling
Select                →  Picker or custom dropdown
Skeleton              →  Animated placeholder
Toast                 →  React Native Toast Message
```

#### Libraries to Install
```bash
# Bottom Sheet (Sheet alternative)
npm install @gorhom/bottom-sheet

# Toast (Sonner alternative)
npm install react-native-toast-message

# Icons (Lucide alternative)
npm install @expo/vector-icons

# Date Picker
npm install react-native-date-picker
```

---

## 🎨 Component Examples

### Business Dashboard - Metric Card
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Active Enrollments
    </CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">24</div>
    <p className="text-xs text-muted-foreground mt-1">
      <span className="text-green-600">+12%</span> from last month
    </p>
  </CardContent>
</Card>
```

### Business Dashboard - Data Table
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Customer</TableHead>
      <TableHead>Service</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarFallback>SA</AvatarFallback>
          </Avatar>
          Sarah Ahmed
        </div>
      </TableCell>
      <TableCell>Ballet Classes</TableCell>
      <TableCell>
        <Badge variant="success">Active</Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Contact</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Cancel Enrollment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Customer App - Service Card
```tsx
<Pressable style={styles.card}>
  <View style={styles.cardHeader}>
    <Image source={{ uri: icon }} style={styles.avatar} />
    <View style={styles.cardInfo}>
      <Text style={styles.cardTitle}>Ballet Classes</Text>
      <Text style={styles.cardSubtitle}>Little Stars Academy</Text>
    </View>
    <View style={[styles.badge, styles.badgeSuccess]}>
      <Text style={styles.badgeText}>Active</Text>
    </View>
  </View>
  <View style={styles.cardContent}>
    <Text style={styles.description}>
      Professional ballet classes for children ages 4-12
    </Text>
  </View>
  <View style={styles.cardFooter}>
    <Text style={styles.price}>From AED 350/month</Text>
    <Pressable style={styles.button}>
      <Text style={styles.buttonText}>Book Now</Text>
    </Pressable>
  </View>
</Pressable>
```

---

## 🎯 Implementation Checklist

### Business Dashboard (Next.js)
- [x] Install shadcn components
- [x] Create components.json config
- [ ] Update Dashboard with metric cards
- [ ] Add Table to Bookings page
- [ ] Add Tabs to Bookings page
- [ ] Add Dropdown menus to actions
- [ ] Add Avatar to customer lists
- [ ] Add Badges for statuses
- [ ] Add Skeleton loaders
- [ ] Add Sheet for side panels
- [ ] Polish with animations

### Customer App (React Native)
- [ ] Install bottom-sheet library
- [ ] Install toast-message library
- [ ] Create custom Card component
- [ ] Create custom Badge component
- [ ] Create custom Avatar component
- [ ] Update BookingModal with sheet
- [ ] Add toast notifications
- [ ] Add skeleton loading states
- [ ] Polish animations
- [ ] Update tab navigation styling

---

## 🚀 Quick Start

### Install Components (Business Dashboard)
```bash
cd business-dashboard
npx shadcn@latest add [component-name]
```

### Available Components
```
accordion, alert, alert-dialog, aspect-ratio, avatar, badge,
breadcrumb, button, calendar, card, carousel, checkbox,
collapsible, command, context-menu, dialog, drawer,
dropdown-menu, form, hover-card, input, label, menubar,
navigation-menu, pagination, popover, progress, radio-group,
resizable, scroll-area, select, separator, sheet, skeleton,
slider, sonner, switch, table, tabs, textarea, toast,
toggle, toggle-group, tooltip
```

### Use Components
```tsx
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
```

---

## 📐 Layout Patterns

### Dashboard Grid (4 columns)
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <MetricCard />
  <MetricCard />
  <MetricCard />
  <MetricCard />
</div>
```

### Two Column Layout
```tsx
<div className="grid gap-6 lg:grid-cols-2">
  <LeftPanel />
  <RightPanel />
</div>
```

### Full Width with Sidebar
```tsx
<div className="flex gap-6">
  <Sidebar className="w-64" />
  <MainContent className="flex-1" />
</div>
```

---

## 🎨 Color Tokens (Tailwind)

### Background Colors
```
bg-background      - Main background
bg-card           - Card background
bg-muted          - Subtle background
bg-accent         - Highlighted areas
```

### Text Colors
```
text-foreground        - Primary text
text-muted-foreground  - Secondary text
text-accent-foreground - Accent text
text-destructive       - Error text
```

### Border Colors
```
border            - Default border
border-input      - Input borders
border-destructive - Error borders
```

---

## 🔄 Animation Classes

### Transitions
```tsx
className="transition-all duration-200 hover:scale-105"
className="transition-colors hover:bg-accent"
```

### Entrance Animations
```tsx
className="animate-in fade-in-0 zoom-in-95"
className="animate-in slide-in-from-bottom-4"
```

---

## 📞 Resources

- **shadcn/ui Docs**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev
- **React Native**: https://reactnative.dev

---

## 🎉 Result

A **premium, modern booking platform** with:
- Clean, professional design
- Consistent component library
- Smooth interactions
- Mobile-responsive layout
- Production-ready code

**Inspired by bestdubai.com, built for RAKlife!**
