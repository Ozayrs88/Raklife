import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      business_id, 
      chase_schedule, // Array of { days_overdue: number, action: 'whatsapp' }
      auto_chase_enabled 
    } = body;

    if (!business_id || !chase_schedule) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify user has access to this business
    const { data: staff } = await supabase
      .from('business_staff')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('business_id', business_id)
      .single();

    if (!staff || (staff.role !== 'owner' && staff.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update business with chase schedule
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        payment_chase_schedule: chase_schedule,
        auto_chase_enabled: auto_chase_enabled,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      message: 'Chase schedule updated successfully',
    });

  } catch (error: any) {
    console.error('Schedule chase error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update chase schedule' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessId = request.nextUrl.searchParams.get('business_id');
    if (!businessId) {
      return NextResponse.json({ error: 'Missing business_id' }, { status: 400 });
    }

    // Verify access
    const { data: staff } = await supabase
      .from('business_staff')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .single();

    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get business chase schedule
    const { data: business } = await supabase
      .from('businesses')
      .select('payment_chase_schedule, auto_chase_enabled')
      .eq('id', businessId)
      .single();

    return NextResponse.json({
      chase_schedule: business?.payment_chase_schedule || [],
      auto_chase_enabled: business?.auto_chase_enabled || false,
    });

  } catch (error: any) {
    console.error('Get chase schedule error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get chase schedule' },
      { status: 500 }
    );
  }
}
