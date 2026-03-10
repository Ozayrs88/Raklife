import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PlansContent from './PlansContent';

export default async function PlansPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: staff } = await supabase
    .from('business_staff')
    .select('business_id')
    .eq('user_id', user.id)
    .single();

  if (!staff) redirect('/onboarding');

  return <PlansContent businessId={staff.business_id} />;
}
