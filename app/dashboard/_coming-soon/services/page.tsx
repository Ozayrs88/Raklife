import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ServicesContent from './ServicesContent'

export default async function ServicesPage() {
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
    .order('created_at', { ascending: false })

  return <ServicesContent business={business} services={services || []} />
}
