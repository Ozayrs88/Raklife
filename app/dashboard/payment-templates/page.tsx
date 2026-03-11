import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import PaymentTemplatesEditor from './PaymentTemplatesEditor';

export default async function PaymentTemplatesPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user's business
  const { data: staffRecord } = await supabase
    .from('business_staff')
    .select('business_id, businesses(id, name, phone)')
    .eq('user_id', user.id)
    .single();

  if (!staffRecord) {
    redirect('/dashboard');
  }

  const businessId = staffRecord.business_id;
  const businessName = (staffRecord.businesses as any)?.name || 'Your Business';
  const businessPhone = (staffRecord.businesses as any)?.phone || '';

  return (
    <PaymentTemplatesEditor 
      businessId={businessId} 
      businessName={businessName}
      businessPhone={businessPhone}
    />
  );
}
