import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      business_id, 
      to_phone, 
      customer_name, 
      overdue_amount, 
      days_overdue,
      template_early,
      template_medium,
      template_urgent
    } = body;

    if (!business_id || !to_phone || !customer_name || !overdue_amount || !days_overdue) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user has access to this business
    const { data: staff } = await supabase
      .from('business_staff')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', business_id)
      .single();

    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized for this business' }, { status: 403 });
    }

    // Select appropriate template based on days overdue
    let template = template_early;
    if (days_overdue > 14) {
      template = template_urgent;
    } else if (days_overdue > 7) {
      template = template_medium;
    }

    // Replace variables
    const firstName = customer_name.split(' ')[0];
    const message = template
      .replace(/\{name\}/g, firstName)
      .replace(/\{amount\}/g, overdue_amount.toString())
      .replace(/\{days\}/g, days_overdue.toString())
      .replace(/\{payment_link\}/g, 'https://pay.stripe.com/test_demo_link');

    // Send WhatsApp message
    await sendWhatsAppMessage(business_id, to_phone, message);

    // Log activity
    await supabase
      .from('payment_activity_log')
      .insert({
        business_id,
        action: 'template_test_sent',
        details: {
          to_phone,
          days_overdue,
          template_used: days_overdue > 14 ? 'urgent' : days_overdue > 7 ? 'medium' : 'early',
          sent_via: 'whatsapp',
        },
        actor_type: 'user',
        user_id: user.id,
      });

    return NextResponse.json({ 
      success: true,
      message: 'Test message sent successfully'
    });

  } catch (error: any) {
    console.error('Test template error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test message' },
      { status: 500 }
    );
  }
}
