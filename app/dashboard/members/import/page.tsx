import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ImportMembersContent from './ImportMembersContent';

export default async function ImportMembersPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: staff } = await supabase
    .from('business_staff')
    .select('business_id')
    .eq('user_id', user.id)
    .single();

  if (!staff) redirect('/onboarding');

  return <ImportMembersContent businessId={staff.business_id} />;
}
