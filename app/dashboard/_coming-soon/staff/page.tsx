import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StaffContent from './StaffContent'

export default async function StaffPage() {
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

  // Get all staff members for this business
  const { data: staff } = await supabase
    .from('business_staff')
    .select(`
      id,
      role,
      created_at,
      users!inner(id, full_name, email, phone)
    `)
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  return <StaffContent business={business} staff={staff || []} currentUserId={user.id} />
}
