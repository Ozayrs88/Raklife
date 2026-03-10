import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CalendarContent from './CalendarContent'

export default async function CalendarPage() {
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

  // Get services with their schedules
  const { data: services } = await supabase
    .from('services')
    .select(`
      id,
      name,
      schedules(
        id,
        day_of_week,
        start_time,
        end_time,
        capacity
      )
    `)
    .eq('business_id', business.id)

  // Get this week's bookings
  const now = new Date()
  const dayOfWeek = now.getDay()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - dayOfWeek)
  startOfWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 7)

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      scheduled_date,
      status,
      attended,
      services!inner(id, name),
      users!inner(full_name)
    `)
    .eq('business_id', business.id)
    .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
    .lt('scheduled_date', endOfWeek.toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })

  return <CalendarContent 
    business={business} 
    services={services || []}
    bookings={bookings || []}
  />
}
