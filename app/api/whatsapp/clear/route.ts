import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { business_id } = await request.json();

    if (!business_id) {
      return NextResponse.json({ error: 'business_id is required' }, { status: 400 });
    }

    const WHATSAPP_SERVICE_URL = process.env.WHATSAPP_SERVICE_URL || 'http://localhost:3001';

    // Call Railway service to disconnect
    await fetch(`${WHATSAPP_SERVICE_URL}/api/whatsapp/disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId: business_id }),
    });

    // Also clear from Supabase
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    
    await supabase
      .from('whatsapp_sessions')
      .delete()
      .eq('business_id', business_id);

    return NextResponse.json({
      success: true,
      message: 'WhatsApp connection cleared. You can now connect a different number.',
    });

  } catch (error: any) {
    console.error('❌ Error clearing WhatsApp:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear WhatsApp' },
      { status: 500 }
    );
  }
}
