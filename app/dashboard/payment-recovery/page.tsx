import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PaymentRecoveryContent from './PaymentRecoveryContent';

export const metadata = {
  title: 'Payment Recovery | Dashboard',
  description: 'Automated payment recovery and chasing system',
};

export default async function PaymentRecoveryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user's business
  const { data: staffRecord } = await supabase
    .from('business_staff')
    .select('business_id, role')
    .eq('user_id', user.id)
    .single();

  if (!staffRecord) {
    redirect('/onboarding');
  }

  return <PaymentRecoveryContent businessId={staffRecord.business_id} />;
}
