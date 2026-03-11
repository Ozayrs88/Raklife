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
    const { business_id, customer_ids, message, image_url } = body;

    if (!business_id || !customer_ids || customer_ids.length === 0 || !message) {
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

    // Get business details
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', business_id)
      .single();

    const results = {
      successful: 0,
      failed: 0,
      errors: [] as Array<{ customer_id: string; error: string }>,
    };

    // Send message to each customer
    for (const customerId of customer_ids) {
      try {
        // Get customer details
        const { data: customer } = await supabase
          .from('users')
          .select('id, full_name, phone')
          .eq('id', customerId)
          .single();

        if (!customer || !customer.phone) {
          results.failed++;
          results.errors.push({
            customer_id: customerId,
            error: 'Customer phone not found',
          });
          continue;
        }

        // Build message with customer name
        const customerName = customer.full_name?.split(' ')[0] || 'there';
        let finalMessage = message;

        // Replace placeholders if they exist
        finalMessage = finalMessage
          .replace(/\{name\}/g, customerName)
          .replace(/\{first_name\}/g, customerName)
          .replace(/\{business\}/g, business?.name || '');

        // Add image URL if provided (for WhatsApp Web.js with media support)
        let messageToSend = finalMessage;
        if (image_url) {
          messageToSend = `${finalMessage}\n\n${image_url}`;
        }

        // Send WhatsApp message
        await sendWhatsAppMessage(business_id, customer.phone, messageToSend);

        // Log activity
        await supabase
          .from('payment_activity_log')
          .insert({
            business_id,
            customer_id: customerId,
            action: 'custom_message_sent',
            details: {
              message_preview: message.substring(0, 100),
              has_image: !!image_url,
              sent_via: 'whatsapp',
            },
            actor_type: 'user',
            user_id: user.id,
          });

        results.successful++;
      } catch (error: any) {
        console.error(`Failed to send to customer ${customerId}:`, error);
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
    console.error('Send custom messages error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send messages' },
      { status: 500 }
    );
  }
}
