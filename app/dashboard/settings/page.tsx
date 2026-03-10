import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingsContent from './SettingsContent'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: staffLinks } = await supabase
    .from('business_staff')
    .select(`
      business_id,
      businesses(
        id,
        slug,
        name,
        business_type,
        description,
        phone,
        email,
        address,
        city,
        country,
        is_active,
        stripe_account_id,
        stripe_account_status,
        stripe_charges_enabled
      )
    `)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .limit(1)

  if (!staffLinks || staffLinks.length === 0) {
    redirect('/dashboard')
  }

  const business = staffLinks[0].businesses as any

  return <SettingsContent business={business} />
}
