import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MembersContent from './MembersContent';

export default async function MembersPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get business_id from staff relationship
  const { data: staff } = await supabase
    .from('business_staff')
    .select('business_id, businesses(id, name, stripe_account_id)')
    .eq('user_id', user.id)
    .single();

  if (!staff) redirect('/onboarding');

  const businessId = staff.business_id;

  return <MembersContent businessId={businessId} />;
}
