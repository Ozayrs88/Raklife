import { NextRequest, NextResponse } from 'next/server';
import { forceStopConnection } from '@/lib/whatsapp/client';

// Force stop a specific business connection (for debugging)
export async function POST(request: NextRequest) {
  try {
    const { business_id } = await request.json();

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    forceStopConnection(business_id);

    return NextResponse.json({
      success: true,
      message: 'Connection force stopped',
    });

  } catch (error: any) {
    console.error('❌ Error force stopping:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to force stop' },
      { status: 500 }
    );
  }
}
