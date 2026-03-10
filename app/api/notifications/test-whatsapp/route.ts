import twilio from 'twilio';
import { NextRequest, NextResponse } from 'next/server';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    const { to_phone, customer_name, overdue_amount, days_overdue, payment_link, business_name } = await request.json();

    if (!to_phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Format WhatsApp message
    const message = getWhatsAppMessage(days_overdue || 14, {
      customer_name: customer_name || 'there',
      overdue_amount: overdue_amount || 0,
      payment_link: payment_link || 'https://pay.stripe.com/test',
      business_name: business_name || 'Your Academy',
      business_phone: '+971 50 123 4567',
    });

    // Send WhatsApp message via Twilio
    const twilioMessage = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
      to: `whatsapp:${to_phone}`,
      body: message,
    });

    return NextResponse.json({ 
      success: true, 
      message_sid: twilioMessage.sid,
      status: twilioMessage.status 
    });

  } catch (error: any) {
    console.error('Test WhatsApp error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test WhatsApp' },
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
    return `⚠️ PAYMENT REMINDER

Hi ${customer_name},

Your account with ${business_name} is ${days_overdue} days overdue.

Amount due: *AED ${overdue_amount}*

Please pay now to avoid service interruption:
${payment_link}

Questions? Contact us.

Thank you!
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
