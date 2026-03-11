import { NextRequest, NextResponse } from 'next/server';
import { disconnectWhatsApp, forceStopConnection } from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
  try {
    const { business_id, force } = await request.json();

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    if (force) {
      forceStopConnection(business_id);
      return NextResponse.json({
        success: true,
        message: 'Connection force stopped',
      });
    }

    await disconnectWhatsApp(business_id);

    return NextResponse.json({
      success: true,
      message: 'Disconnected successfully',
    });

  } catch (error: any) {
    console.error('❌ Error disconnecting WhatsApp:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to disconnect' },
      { status: 500 }
    );
  }
}
