import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

// Configure route to handle raw body for webhook signature verification
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('🔔 Webhook endpoint hit!');
  
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('❌ No signature in webhook request');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // We'll need to get the correct Stripe instance for the business
    // For now, we'll use environment variable as fallback
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-02-25.clover',
    });

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('✅ Webhook received:', event.type);

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Processing checkout completion:', session.id);
  
  // Use service role to bypass RLS
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // Get customer and business IDs from metadata
  const customerId = session.metadata?.customer_id;
  const businessId = session.metadata?.business_id;
  
  if (!customerId || !businessId) {
    console.error('❌ Missing customer_id or business_id in session metadata');
    return;
  }

  // Get customer details for thank you notification
  const { data: customer } = await supabase
    .from('users')
    .select('full_name, email, phone, overdue_amount')
    .eq('id', customerId)
    .single();

  // Get business details
  const { data: business } = await supabase
    .from('businesses')
    .select('name, phone, email')
    .eq('id', businessId)
    .single();

  const amountPaid = session.amount_total ? (session.amount_total / 100) : 0;

  // Update user payment status
  const { error: updateError } = await supabase
    .from('users')
    .update({
      payment_status: 'paid',
      overdue_amount: 0,
      last_payment_date: new Date().toISOString(),
    })
    .eq('id', customerId);

  if (updateError) {
    console.error('❌ Failed to update user:', updateError);
    return;
  }

  // Update payment link status
  const { error: linkError } = await supabase
    .from('payment_links')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      stripe_payment_intent_id: session.payment_intent as string,
    })
    .eq('customer_id', customerId)
    .eq('status', 'sent')
    .order('created_at', { ascending: false })
    .limit(1);

  if (linkError) {
    console.error('❌ Failed to update payment link:', linkError);
  }

  console.log(`✅ Payment processed for customer ${customerId}`);

  // Send thank you notifications (WhatsApp + Email)
  await sendPaymentConfirmation({
    customer,
    business,
    amountPaid,
    businessId,
    customerId,
    supabase,
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('💰 Payment succeeded:', paymentIntent.id);
  
  // Use service role to bypass RLS
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // Get customer and business IDs from metadata
  const customerId = paymentIntent.metadata?.customer_id;
  const businessId = paymentIntent.metadata?.business_id;
  
  if (!customerId || !businessId) {
    console.log('⚠️ No metadata found, payment might be from checkout.session.completed');
    return;
  }

  // Get customer details for thank you notification
  const { data: customer } = await supabase
    .from('users')
    .select('full_name, email, phone')
    .eq('id', customerId)
    .single();

  // Get business details
  const { data: business } = await supabase
    .from('businesses')
    .select('name, phone')
    .eq('id', businessId)
    .single();

  const amountPaid = paymentIntent.amount ? (paymentIntent.amount / 100) : 0;

  // Update user payment status
  const { error: updateError } = await supabase
    .from('users')
    .update({
      payment_status: 'paid',
      overdue_amount: 0,
      last_payment_date: new Date().toISOString(),
    })
    .eq('id', customerId);

  if (updateError) {
    console.error('❌ Failed to update user:', updateError);
    return;
  }

  console.log(`✅ Payment confirmed for customer ${customerId}`);

  // Send thank you notification via WhatsApp
  await sendPaymentConfirmation({
    customer,
    business,
    amountPaid,
    businessId,
    customerId,
    supabase,
  });
}

async function sendPaymentConfirmation(data: {
  customer: any;
  business: any;
  amountPaid: number;
  businessId: string;
  customerId: string;
  supabase: any;
}) {
  const { customer, business, amountPaid, businessId, customerId, supabase } = data;

  if (!customer || !customer.phone) {
    console.log('⚠️ No phone number found for customer, skipping WhatsApp confirmation');
    return;
  }

  try {
    // Import WhatsApp client
    const { sendWhatsAppMessage } = await import('@/lib/whatsapp/client');

    // Create thank you message
    const customerName = customer.full_name?.split(' ')[0] || 'there';
    const businessName = business?.name || 'Your Academy';
    const businessPhone = business?.phone || '';

    const thankYouMessage = `✅ Payment Received!

Hi ${customerName},

Thank you for your payment of *AED ${amountPaid.toFixed(2)}*! 

Your account is now up to date. We appreciate your prompt payment.

If you have any questions, feel free to contact us at ${businessPhone}.

${businessName}
🙏 Thank you!`;

    // Send WhatsApp message
    await sendWhatsAppMessage(businessId, customer.phone, thankYouMessage);

    console.log(`✅ Thank you WhatsApp sent to ${customer.phone}`);

    // Log activity
    await supabase
      .from('payment_activity_log')
      .insert({
        business_id: businessId,
        customer_id: customerId,
        action: 'payment_confirmation_sent',
        details: {
          amount_paid: amountPaid,
          sent_via: 'whatsapp',
          phone: customer.phone,
        },
      });

  } catch (error) {
    console.error('❌ Failed to send payment confirmation WhatsApp:', error);
    // Don't throw error - we don't want to fail the webhook if notification fails
  }
}
