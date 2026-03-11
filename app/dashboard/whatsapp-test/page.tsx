import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import WhatsAppTestContent from './WhatsAppTestContent';

export default async function WhatsAppTestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get business ID
  const { data: staff } = await supabase
    .from('business_staff')
    .select('business_id')
    .eq('user_id', user.id)
    .single();

  if (!staff) {
    return <div className="p-8 text-center">No business associated with your account</div>;
  }

  return <WhatsAppTestContent businessId={staff.business_id} />;
}
