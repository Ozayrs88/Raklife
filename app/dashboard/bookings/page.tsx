import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BookingsContent from './BookingsContent'

export default async function BookingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: staffLinks } = await supabase
    .from('business_staff')
    .select('business_id, businesses(*)')
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .limit(1)

  if (!staffLinks || staffLinks.length === 0) {
    redirect('/dashboard')
  }

  const business = staffLinks[0].businesses as any

  // Fetch enrollments (active subscriptions)
  const { data: enrollments } = await supabase
    .from('subscriptions')
    .select(`
      *,
      services(name),
      users!subscriptions_customer_id_fkey(full_name, email, phone),
      pricing_plans(name, type, duration_weeks, sibling_discount_percent),
      pricing_options(sessions_per_week, price)
    `)
    .eq('business_id', business.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Fetch upcoming sessions
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      services(name, price, duration_minutes),
      users!bookings_customer_id_fkey(full_name, email, phone),
      subscriptions(id)
    `)
    .eq('business_id', business.id)
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .limit(50)

  return <BookingsContent 
    business={business} 
    enrollments={enrollments || []} 
    bookings={bookings || []} 
  />
}
