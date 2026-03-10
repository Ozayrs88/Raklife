import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// This endpoint should be called by a cron job (e.g., Vercel Cron, GitHub Actions)
// Add this to vercel.json:
// {
//   "crons": [{
//     "path": "/api/payment-recovery/auto-chase",
//     "schedule": "0 9 * * *"
//   }]
// }

export async function GET() {
  try {
    const supabase = await createClient();

    // Get all businesses with auto chase enabled
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, name, payment_chase_schedule, stripe_account_id')
      .eq('auto_chase_enabled', true)
      .not('payment_chase_schedule', 'is', null);

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No businesses with auto chase enabled' 
      });
    }

    const results = {
      businesses_processed: 0,
      customers_chased: 0,
      errors: [] as Array<{ business_id: string; error: string }>,
    };

    for (const business of businesses) {
      try {
        // Get all overdue customers for this business
        const { data: bookings } = await supabase
          .from('bookings')
          .select('customer_id')
          .eq('business_id', business.id);

        if (!bookings || bookings.length === 0) continue;

        const customerIds = [...new Set(bookings.map(b => b.customer_id))];

        const { data: overdueCustomers } = await supabase
          .from('users')
          .select('id, email, full_name, phone, overdue_amount, last_payment_date')
          .in('id', customerIds)
          .gt('overdue_amount', 0);

        if (!overdueCustomers || overdueCustomers.length === 0) continue;

        const today = new Date();

        // Process each overdue customer
        for (const customer of overdueCustomers) {
          if (!customer.last_payment_date) continue;

          const lastPaymentDate = new Date(customer.last_payment_date);
          const daysOverdue = Math.floor((today.getTime() - lastPaymentDate.getTime()) / (1000 * 60 * 60 * 24));

          // Check if we should send a chase based on schedule
          const chaseSchedule = business.payment_chase_schedule as Array<{
            days_overdue: number;
            action: 'email' | 'sms' | 'both';
          }>;

          const matchingSchedule = chaseSchedule.find(
            schedule => schedule.days_overdue === daysOverdue
          );

          if (matchingSchedule) {
            // Check if we already sent a chase for this customer today
            const { data: existingChase } = await supabase
              .from('payment_activity_log')
              .select('id')
              .eq('business_id', business.id)
              .eq('customer_id', customer.id)
              .eq('action', 'payment_chase_sent')
              .gte('created_at', new Date(today.setHours(0, 0, 0, 0)).toISOString())
              .single();

            if (existingChase) {
              continue; // Already sent chase today
            }

            // Create or get payment link
            const { data: existingLink } = await supabase
              .from('payment_links')
              .select('id, stripe_payment_link_url')
              .eq('business_id', business.id)
              .eq('customer_id', customer.id)
              .eq('status', 'sent')
              .eq('purpose', 'overdue_payment')
              .single();

            let paymentLinkUrl = existingLink?.stripe_payment_link_url;

            if (!paymentLinkUrl) {
              // Create new payment link (you'd need to implement this)
              // For now, we'll skip creating new links in auto-chase
              continue;
            }

            // Send chase notification
            if (matchingSchedule.action === 'email' || matchingSchedule.action === 'both') {
              try {
                await fetch('/api/notifications/send-email', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customer_id: customer.id,
                    business_id: business.id,
                    payment_link_url: paymentLinkUrl,
                    overdue_amount: customer.overdue_amount,
                    days_overdue: daysOverdue,
                  }),
                });
              } catch (error) {
                console.error('Email send error:', error);
              }
            }

            if (matchingSchedule.action === 'sms' || matchingSchedule.action === 'both') {
              try {
                await fetch('/api/notifications/send-whatsapp', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customer_id: customer.id,
                    business_id: business.id,
                    payment_link_url: paymentLinkUrl,
                    overdue_amount: customer.overdue_amount,
                    days_overdue: daysOverdue,
                  }),
                });
              } catch (error) {
                console.error('WhatsApp send error:', error);
              }
            }

            // Log activity
            await supabase
              .from('payment_activity_log')
              .insert({
                business_id: business.id,
                customer_id: customer.id,
                action: 'payment_chase_sent',
                details: {
                  days_overdue: daysOverdue,
                  overdue_amount: customer.overdue_amount,
                  chase_method: matchingSchedule.action,
                  payment_link: paymentLinkUrl,
                },
                actor_type: 'system',
              });

            results.customers_chased++;
          }
        }

        results.businesses_processed++;
      } catch (error: any) {
        results.errors.push({
          business_id: business.id,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });

  } catch (error: any) {
    console.error('Auto chase error:', error);
    return NextResponse.json(
      { error: error.message || 'Auto chase failed' },
      { status: 500 }
    );
  }
}
