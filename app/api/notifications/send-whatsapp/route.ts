import twilio from 'twilio';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customer_id, business_id, payment_link_url, overdue_amount, days_overdue } = await request.json();

    // Get customer details
    const { data: customer } = await supabase
      .from('users')
      .select('phone, full_name')
      .eq('id', customer_id)
      .single();

    if (!customer || !customer.phone) {
      return NextResponse.json({ error: 'Customer phone not found' }, { status: 404 });
    }

    // Get business details
    const { data: business } = await supabase
      .from('businesses')
      .select('name, phone')
      .eq('id', business_id)
      .single();

    // Shorten URL for WhatsApp (optional - use a URL shortener)
    const shortLink = payment_link_url; // TODO: Use bit.ly or similar if needed

    // Select WhatsApp template based on days overdue
    const message = getWhatsAppMessage(days_overdue, {
      customer_name: customer.full_name?.split(' ')[0] || 'there',
      overdue_amount,
      payment_link: shortLink,
      business_name: business?.name || 'Your Academy',
      business_phone: business?.phone,
    });

    // Send WhatsApp message via Twilio
    const twilioMessage = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      to: `whatsapp:${customer.phone}`,
      body: message,
    });

    // Log activity
    await supabase
      .from('payment_activity_log')
      .insert({
        business_id,
        customer_id,
        action: 'whatsapp_sent',
        details: {
          days_overdue,
          message_sid: twilioMessage.sid,
          status: twilioMessage.status,
        },
        actor_type: 'system',
      });

    return NextResponse.json({ 
      success: true, 
      message_sid: twilioMessage.sid,
      status: twilioMessage.status 
    });

  } catch (error: any) {
    console.error('Send WhatsApp error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send WhatsApp' },
      { status: 500 }
    );
  }
}

function getWhatsAppMessage(days_overdue: number, data: any) {
  const { customer_name, overdue_amount, payment_link, business_name, business_phone } = data;

  if (days_overdue <= 7) {
    return `Hi ${customer_name},

Friendly reminder from ${business_name}:

Your account has an outstanding balance of *AED ${overdue_amount}*.

Pay securely here:
${payment_link}

Questions? Reply to this message or call ${business_phone}.

Thank you! 🙏`;
  } else if (days_overdue <= 14) {
    return `Hi ${customer_name},

Your account balance is now *${days_overdue} days overdue*.

⚠️ Amount Due: *AED ${overdue_amount}*

Please pay today:
${payment_link}

Need help? Contact us: ${business_phone}

${business_name}`;
  } else {
    return `🚨 URGENT - ${customer_name}

Your account is *${days_overdue} days overdue*.

Amount: *AED ${overdue_amount}*

PAY NOW to avoid service interruption:
${payment_link}

Need payment plan? Call ${business_phone} IMMEDIATELY.

${business_name} Billing`;
  }
}
