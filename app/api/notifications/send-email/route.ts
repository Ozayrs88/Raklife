import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      .select('email, full_name')
      .eq('id', customer_id)
      .single();

    if (!customer || !customer.email) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get business details
    const { data: business } = await supabase
      .from('businesses')
      .select('name, email')
      .eq('id', business_id)
      .single();

    // Select email template based on days overdue
    const template = getEmailTemplate(days_overdue, {
      customer_name: customer.full_name,
      overdue_amount,
      payment_link: payment_link_url,
      business_name: business?.name || 'Your Academy',
    });

    // Send email
    const { data, error } = await resend.emails.send({
      from: business?.email || 'payments@raklife.app',
      to: customer.email,
      subject: template.subject,
      html: template.html,
    });

    if (error) {
      throw error;
    }

    // Log activity
    await supabase
      .from('payment_activity_log')
      .insert({
        business_id,
        customer_id,
        action: 'email_sent',
        details: {
          days_overdue,
          email_id: data?.id,
          subject: template.subject,
        },
        actor_type: 'system',
      });

    return NextResponse.json({ success: true, email_id: data?.id });

  } catch (error: any) {
    console.error('Send email error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}

function getEmailTemplate(days_overdue: number, data: any) {
  const { customer_name, overdue_amount, payment_link, business_name } = data;

  if (days_overdue <= 7) {
    return {
      subject: `Friendly Reminder: Payment Due - ${business_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${customer_name},</h2>
          <p>This is a friendly reminder that your account has an outstanding balance:</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0; color: #dc3545;">Amount Due: AED ${overdue_amount}</h3>
          </div>

          <p>To make payment easy, we've created a secure link for you:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${payment_link}" style="background: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Pay Now
            </a>
          </div>

          <p>If you've already paid, please disregard this message.</p>

          <p>Best regards,<br>${business_name} Team</p>
        </div>
      `,
    };
  } else if (days_overdue <= 14) {
    return {
      subject: `Important: Outstanding Balance - AED ${overdue_amount}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Hi ${customer_name},</h2>
          <p>We noticed your account still has an outstanding balance:</p>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h3 style="margin: 0; color: #856404;">Amount Due: AED ${overdue_amount}</h3>
            <p style="margin: 10px 0 0 0; color: #856404;">Overdue: ${days_overdue} days</p>
          </div>

          <p>Please settle your balance today to avoid any service interruption:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${payment_link}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Pay Now
            </a>
          </div>

          <p>If you're experiencing financial difficulties, please reach out - we can discuss flexible payment options.</p>

          <p>Thank you,<br>${business_name} Team</p>
        </div>
      `,
    };
  } else {
    return {
      subject: `URGENT: Final Notice - AED ${overdue_amount} Overdue`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">URGENT: Final Notice</h2>
          <p>Hi ${customer_name},</p>
          <p>Your account requires immediate attention.</p>
          
          <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3 style="margin: 0; color: #721c24;">Amount Due: AED ${overdue_amount}</h3>
            <p style="margin: 10px 0 0 0; color: #721c24;"><strong>Overdue: ${days_overdue} days</strong></p>
          </div>

          <p><strong>Please settle your balance immediately to avoid:</strong></p>
          <ul style="color: #721c24;">
            <li>Service suspension</li>
            <li>Late fees</li>
            <li>Account deactivation</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${payment_link}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              PAY NOW
            </a>
          </div>

          <p>If you need to arrange a payment plan, please contact us immediately.</p>

          <p>${business_name} Billing Department</p>
        </div>
      `,
    };
  }
}
