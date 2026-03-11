import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MemberDetailContent from './MemberDetailContent';

export default async function MemberDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  const { data: staff } = await supabase
    .from('business_staff')
    .select('business_id')
    .eq('user_id', user.id)
    .single();

  if (!staff) {
    redirect('/onboarding');
  }

  return <MemberDetailContent businessId={staff.business_id} memberId={params.id} />;
}
