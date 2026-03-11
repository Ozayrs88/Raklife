import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { business_id, templates } = body;

    if (!business_id || !templates) {
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

    // Save templates to business settings
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        payment_templates: templates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', business_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Templates saved successfully'
    });

  } catch (error: any) {
    console.error('Save templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save templates' },
      { status: 500 }
    );
  }
}

// GET endpoint to load templates
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const business_id = searchParams.get('business_id');

    if (!business_id) {
      return NextResponse.json({ error: 'Missing business_id' }, { status: 400 });
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

    // Get templates from business settings
    const { data: business, error } = await supabase
      .from('businesses')
      .select('payment_templates')
      .eq('id', business_id)
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      templates: business?.payment_templates || null
    });

  } catch (error: any) {
    console.error('Load templates error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load templates' },
      { status: 500 }
    );
  }
}
