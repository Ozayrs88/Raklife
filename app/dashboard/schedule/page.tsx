import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ScheduleContent from './ScheduleContent'

export default async function SchedulePage() {
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

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', business.id)
    .eq('is_active', true)

  const { data: schedules } = await supabase
    .from('schedules')
    .select('*, services(name)')
    .in('service_id', services?.map(s => s.id) || [])
    .order('day_of_week')
    .order('start_time')

  return <ScheduleContent business={business} services={services || []} schedules={schedules || []} />
}
