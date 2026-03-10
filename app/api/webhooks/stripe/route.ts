import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature')!;

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
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object as Stripe.Checkout.Session, supabase);
        break;

      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSuccess(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice, supabase);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object as Stripe.Subscription, supabase);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription, supabase);
        break;

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

async function handleCheckoutComplete(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const metadata = session.metadata;
  if (!metadata) return;

  const { business_id, customer_id, payment_link_id } = metadata;

  // Create payment transaction record
  await supabase.from('payment_transactions').insert({
    business_id,
    customer_id,
    payment_link_id: payment_link_id || null,
    stripe_payment_intent_id: session.payment_intent as string,
    amount: session.amount_total! / 100, // Convert from cents
    currency: session.currency?.toUpperCase() || 'AED',
    payment_type: 'one_time',
    status: 'succeeded',
    paid_at: new Date().toISOString(),
  });
}

async function handlePaymentSuccess(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  const metadata = paymentIntent.metadata;
  if (!metadata || !metadata.customer_id) return;

  // Update or create transaction
  const { data: existing } = await supabase
    .from('payment_transactions')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (!existing) {
    await supabase.from('payment_transactions').insert({
      business_id: metadata.business_id,
      customer_id: metadata.customer_id,
      payment_link_id: metadata.payment_link_id || null,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_charge_id: paymentIntent.latest_charge as string,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      payment_type: metadata.payment_type || 'one_time',
      status: 'succeeded',
      paid_at: new Date(paymentIntent.created * 1000).toISOString(),
    });
  } else {
    await supabase
      .from('payment_transactions')
      .update({
        status: 'succeeded',
        paid_at: new Date(paymentIntent.created * 1000).toISOString(),
        stripe_charge_id: paymentIntent.latest_charge as string,
      })
      .eq('id', existing.id);
  }
}

async function handlePaymentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: any
) {
  const metadata = paymentIntent.metadata;
  if (!metadata) return;

  // Update transaction status
  const { data: existing } = await supabase
    .from('payment_transactions')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single();

  if (existing) {
    await supabase
      .from('payment_transactions')
      .update({
        status: 'failed',
        failure_reason: paymentIntent.last_payment_error?.message || 'Payment failed',
      })
      .eq('id', existing.id);
  }
}

async function handleInvoicePaymentSuccess(
  invoice: Stripe.Invoice,
  supabase: any
) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const metadata = subscription.metadata;
  
  if (!metadata) return;

  // Record subscription payment
  await supabase.from('payment_transactions').insert({
    business_id: metadata.business_id,
    customer_id: metadata.customer_id,
    subscription_id: metadata.subscription_id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    stripe_invoice_id: invoice.id,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency.toUpperCase(),
    payment_type: 'subscription_recurring',
    status: 'succeeded',
    paid_at: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
  });

  // Update subscription
  await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      last_payment_date: new Date(invoice.status_transitions.paid_at! * 1000).toISOString(),
      failed_payment_count: 0,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
  const metadata = subscription.metadata;
  
  if (!metadata) return;

  // Increment failed payment count
  await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
      failed_payment_count: supabase.rpc('increment', { x: 1 }),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const metadata = subscription.metadata;
  if (!metadata) return;

  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', subscription.id)
    .single();

  const subscriptionData = {
    business_id: metadata.business_id,
    customer_id: metadata.customer_id,
    membership_plan_id: metadata.membership_plan_id,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: subscription.customer as string,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    next_payment_date: new Date(subscription.current_period_end * 1000).toISOString(),
  };

  if (existing) {
    await supabase
      .from('subscriptions')
      .update(subscriptionData)
      .eq('id', existing.id);
  } else {
    await supabase
      .from('subscriptions')
      .insert(subscriptionData);
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  supabase: any
) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}
