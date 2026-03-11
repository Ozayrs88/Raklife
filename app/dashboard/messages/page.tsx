import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CustomMessageComposer from './CustomMessageComposer';

export default async function CustomMessagesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user's business
  const { data: staffRecord } = await supabase
    .from('business_staff')
    .select('business_id, businesses(id, name)')
    .eq('user_id', user.id)
    .single();

  if (!staffRecord) {
    redirect('/dashboard');
  }

  const businessId = staffRecord.business_id;

  return <CustomMessageComposer businessId={businessId} />;
}
