import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(supabase, session);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(supabase, paymentIntent);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(supabase, paymentIntent);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(supabase, subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(supabase, subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(supabase: any, session: Stripe.Checkout.Session) {
  const customerId = session.metadata?.customer_id;
  const businessId = session.metadata?.business_id;
  const purpose = session.metadata?.purpose;

  if (!customerId || !businessId) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Create payment transaction
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .insert({
      business_id: businessId,
      customer_id: customerId,
      stripe_payment_intent_id: session.payment_intent,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency?.toUpperCase() || 'AED',
      payment_type: purpose === 'overdue_recovery' ? 'overdue_recovery' : 'one_time',
      status: 'succeeded',
      paid_at: new Date().toISOString(),
      metadata: {
        session_id: session.id,
        purpose: purpose,
      },
    })
    .select()
    .single();

  console.log('Payment transaction created:', transaction?.id);
}

async function handlePaymentSucceeded(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  // Get customer from metadata
  const customerId = paymentIntent.metadata?.customer_id;
  const businessId = paymentIntent.metadata?.business_id;

  if (!customerId || !businessId) {
    console.error('Missing metadata in payment intent');
    return;
  }

  // Update existing transaction or create new one
  const { data: existingTransaction } = await supabase
    .from('payment_transactions')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (existingTransaction) {
    await supabase
      .from('payment_transactions')
      .update({
        status: 'succeeded',
        paid_at: new Date(paymentIntent.created * 1000).toISOString(),
      })
      .eq('id', existingTransaction.id);
  } else {
    await supabase
      .from('payment_transactions')
      .insert({
        business_id: businessId,
        customer_id: customerId,
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        payment_type: 'overdue_recovery',
        status: 'succeeded',
        paid_at: new Date(paymentIntent.created * 1000).toISOString(),
      });
  }

  console.log('Payment intent succeeded:', paymentIntent.id);
}

async function handlePaymentFailed(supabase: any, paymentIntent: Stripe.PaymentIntent) {
  const customerId = paymentIntent.metadata?.customer_id;
  const businessId = paymentIntent.metadata?.business_id;

  if (!customerId || !businessId) {
    return;
  }

  await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
      failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
    })
    .eq('stripe_payment_intent_id', paymentIntent.id);

  console.log('Payment intent failed:', paymentIntent.id);
}

async function handleSubscriptionUpdate(supabase: any, subscription: Stripe.Subscription) {
  const customerId = subscription.metadata?.customer_id;
  const businessId = subscription.metadata?.business_id;

  if (!customerId || !businessId) {
    return;
  }

  // Update or create subscription record
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  const subscriptionData = {
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
  };

  if (existingSub) {
    await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existingSub.id);
  } else {
    await supabase
      .from('subscriptions')
      .insert({
        ...subscriptionData,
        business_id: businessId,
        customer_id: customerId,
      });
  }

  console.log('Subscription updated:', subscription.id);
}

async function handleSubscriptionDeleted(supabase: any, subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  console.log('Subscription cancelled:', subscription.id);
}
