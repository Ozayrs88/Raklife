import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PricingContent from './PricingContent'

export default async function PricingPage() {
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
    .order('name')

  const { data: pricingPlans } = await supabase
    .from('pricing_plans')
    .select(`
      *,
      services(name),
      pricing_options(
        id,
        sessions_per_week,
        price
      )
    `)
    .in('service_id', services?.map(s => s.id) || [])
    .order('created_at', { ascending: false })
  
  // Sort pricing_options by sessions_per_week for each plan
  const plansWithSortedOptions = pricingPlans?.map(plan => ({
    ...plan,
    pricing_options: plan.pricing_options?.sort((a: any, b: any) => 
      (a.sessions_per_week || 0) - (b.sessions_per_week || 0)
    ) || []
  })) || []

  return <PricingContent business={business} services={services || []} pricingPlans={plansWithSortedOptions} />
}
