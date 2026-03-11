import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, getConnectionStatus } from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
  try {
    const { business_id, phone_number, message } = await request.json();

    if (!business_id || !phone_number || !message) {
      return NextResponse.json(
        { error: 'business_id, phone_number, and message are required' },
        { status: 400 }
      );
    }

    // Check if connected
    const status = await getConnectionStatus(business_id);
    if (status !== 'connected') {
      return NextResponse.json(
        { error: 'WhatsApp not connected. Please scan QR code first.' },
        { status: 400 }
      );
    }

    console.log('📤 Sending WhatsApp message to', phone_number);

    await sendWhatsAppMessage(business_id, phone_number, message);

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });

  } catch (error: any) {
    console.error('❌ Error sending WhatsApp message:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
