import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sendWhatsAppMessage } from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { business_id, customer_ids } = body;

    if (!business_id || !customer_ids || customer_ids.length === 0) {
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

    // Get business Stripe account
    const { data: business } = await supabase
      .from('businesses')
      .select('stripe_account_id, stripe_secret_key, name')
      .eq('id', business_id)
      .single();

    if (!business || !business.stripe_secret_key) {
      return NextResponse.json(
        { error: 'Please add your Stripe API keys in Settings first' },
        { status: 400 }
      );
    }

    // Initialize Stripe with business's secret key
    const stripe = new Stripe(business.stripe_secret_key, {
      apiVersion: '2026-02-25.clover',
    });

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ customer_id: string; error: string }>,
    };

    // Process each customer
    for (const customerId of customer_ids) {
      try {
        // Get customer details
        const { data: customer } = await supabase
          .from('users')
          .select('id, email, full_name, phone, overdue_amount, stripe_customer_id')
          .eq('id', customerId)
          .single();

        if (!customer || customer.overdue_amount <= 0) {
          results.failed++;
          results.errors.push({
            customer_id: customerId,
            error: 'No overdue amount or customer not found',
          });
          continue;
        }

        // Create or get Stripe customer
        let stripeCustomerId = customer.stripe_customer_id;
        
        if (!stripeCustomerId) {
          // Validate email before sending to Stripe
          const isValidEmail = customer.email && customer.email.includes('@') && customer.email.includes('.');
          
          const stripeCustomer = await stripe.customers.create({
            email: isValidEmail ? customer.email : undefined, // Skip invalid emails
            name: customer.full_name,
            phone: customer.phone,
            metadata: {
              supabase_user_id: customer.id,
              business_id: business_id,
            },
          });

          stripeCustomerId = stripeCustomer.id;

          // Update user with Stripe customer ID
          await supabase
            .from('users')
            .update({ stripe_customer_id: stripeCustomerId })
            .eq('id', customer.id);
        }

        // Create Stripe Payment Link
        const paymentLink = await stripe.paymentLinks.create({
          line_items: [{
            price_data: {
              currency: 'aed',
              product_data: {
                name: `Overdue Payment - ${business.name}`,
                description: `Outstanding balance payment`,
                // Add your logo here (must be publicly accessible URL)
                // images: ['https://your-domain.com/logo.png'],
              },
              unit_amount: Math.round(customer.overdue_amount * 100),
            },
            quantity: 1,
          }],
          metadata: {
            customer_id: customer.id,
            business_id: business_id,
            purpose: 'overdue_recovery',
          },
          after_completion: {
            type: 'hosted_confirmation',
            hosted_confirmation: {
              custom_message: 'Thank you for your payment! Your account has been updated.',
            },
          },
        });

        const paymentUrl = paymentLink.url;

        // Save payment link to database
        const { data: paymentLinkRecord } = await supabase
          .from('payment_links')
          .insert({
            business_id: business_id,
            customer_id: customer.id,
            stripe_payment_link_id: paymentLink.id,
            stripe_payment_link_url: paymentUrl || '',
            amount: customer.overdue_amount,
            currency: 'AED',
            purpose: 'overdue_payment',
            description: `Outstanding balance: AED ${customer.overdue_amount}`,
            status: 'sent',
            sent_at: new Date().toISOString(),
            sent_via: 'whatsapp',
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          })
          .select()
          .single();

        // Send WhatsApp notification with payment link
        if (customer.phone) {
          try {
            console.log(`📱 Attempting WhatsApp to ${customer.phone}...`);
            
            // Calculate days overdue
            const daysOverdue = 7;
            
            // Build WhatsApp message
            const message = `⚠️ PAYMENT REMINDER

Hi ${customer.full_name?.split(' ')[0] || 'there'},

Your account with ${business.name} is ${daysOverdue} days overdue.

Amount due: *AED ${customer.overdue_amount}*

👉 Pay securely now:
${paymentUrl}

Questions? Contact us.

Thank you!
${business.name}`;
            
            // Send WhatsApp via WhatsApp Web.js
            await sendWhatsAppMessage(business_id, customer.phone, message);
            
            console.log(`✅ WhatsApp sent to ${customer.phone}!`);
          } catch (whatsappError: any) {
            console.error(`❌ Failed to send WhatsApp to ${customer.phone}:`, whatsappError.message);
            // Don't fail the whole process if WhatsApp fails
          }
        } else {
          console.log(`⚠️ No phone number for ${customer.full_name}, skipping WhatsApp`);
        }

        results.successful++;
      } catch (error: any) {
        results.failed++;
        results.errors.push({
          customer_id: customerId,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });

  } catch (error: any) {
    console.error('Bulk payment links error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create payment links' },
      { status: 500 }
    );
  }
}
