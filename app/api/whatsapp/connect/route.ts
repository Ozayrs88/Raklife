import { NextRequest, NextResponse } from 'next/server';
import { initWhatsAppConnection, getQRCode, getConnectionStatus } from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
  try {
    const { business_id } = await request.json();

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    console.log('🔌 Initializing WhatsApp connection for business:', business_id);

    // Start connection (non-blocking)
    await initWhatsAppConnection(business_id);
    
    // Return immediately, frontend will poll for QR code
    return NextResponse.json({
      status: 'initializing',
      message: 'Connection started, poll /api/whatsapp/connect with GET to check status',
    });

  } catch (error: any) {
    console.error('❌ Error initializing WhatsApp:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initialize WhatsApp' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const business_id = searchParams.get('business_id');

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    const status = await getConnectionStatus(business_id);
    const qr_code = await getQRCode(business_id);

    return NextResponse.json({
      status,
      qr_code,
    });

  } catch (error: any) {
    console.error('❌ Error getting WhatsApp status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get WhatsApp status' },
      { status: 500 }
    );
  }
}
