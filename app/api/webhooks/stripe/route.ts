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
}
