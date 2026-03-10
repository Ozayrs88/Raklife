import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2026-02-25.clover',
});

// Step 1: Create Stripe Connect account link
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { business_id } = await request.json();

    // Verify user owns this business
    const { data: staff } = await supabase
      .from('business_staff')
      .select('id, role')
      .eq('user_id', user.id)
      .eq('business_id', business_id)
      .single();

    if (!staff || (staff.role !== 'owner' && staff.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get business details
    const { data: business } = await supabase
      .from('businesses')
      .select('id, name, email, stripe_account_id')
      .eq('id', business_id)
      .single();

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    let accountId = business.stripe_account_id;

    // Create Stripe Connect account if doesn't exist
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'standard',
        email: business.email,
        metadata: {
          business_id: business.id,
          business_name: business.name,
        },
      });

      accountId = account.id;

      // Save account ID
      await supabase
        .from('businesses')
        .update({
          stripe_account_id: accountId,
          stripe_account_status: 'pending',
        })
        .eq('id', business.id);
    }

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?stripe_refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?stripe_connected=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({
      url: accountLink.url,
      account_id: accountId,
    });

  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Stripe Connect link' },
      { status: 500 }
    );
  }
}

// Get account status
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

    // Get business
    const { data: business } = await supabase
      .from('businesses')
      .select('stripe_account_id, stripe_account_status, stripe_charges_enabled')
      .eq('id', businessId)
      .single();

    if (!business?.stripe_account_id) {
      return NextResponse.json({
        connected: false,
        status: 'not_connected',
      });
    }

    // Check Stripe account status
    const account = await stripe.accounts.retrieve(business.stripe_account_id);

    // Update database with latest status
    await supabase
      .from('businesses')
      .update({
        stripe_account_status: account.charges_enabled ? 'connected' : 'pending',
        stripe_charges_enabled: account.charges_enabled,
      })
      .eq('id', businessId);

    return NextResponse.json({
      connected: account.charges_enabled,
      status: account.charges_enabled ? 'connected' : 'pending',
      charges_enabled: account.charges_enabled,
      details_submitted: account.details_submitted,
      account_id: business.stripe_account_id,
    });

  } catch (error: any) {
    console.error('Get Stripe status error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get Stripe status' },
      { status: 500 }
    );
  }
}
