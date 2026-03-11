import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { customer_ids } = await request.json();

    if (!customer_ids || !Array.isArray(customer_ids) || customer_ids.length === 0) {
      return NextResponse.json(
        { error: 'customer_ids array is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🗑️ Attempting to delete customers:', customer_ids);

    // Use admin client to bypass RLS
    let adminClient;
    try {
      adminClient = createAdminClient();
      console.log('✅ Admin client created successfully');
    } catch (error: any) {
      console.error('❌ Failed to create admin client:', error.message);
      return NextResponse.json(
        { error: 'Server configuration error: ' + error.message },
        { status: 500 }
      );
    }

    // Delete related records first (prevents foreign key errors)
    console.log('Deleting payment links...');
    const { error: linksError } = await adminClient
      .from('payment_links')
      .delete()
      .in('customer_id', customer_ids);

    if (linksError) {
      console.warn('Warning deleting payment links:', linksError);
    }

    console.log('Deleting bookings...');
    const { error: bookingsError } = await adminClient
      .from('bookings')
      .delete()
      .in('customer_id', customer_ids);

    if (bookingsError) {
      console.warn('Warning deleting bookings:', bookingsError);
    }

    console.log('Deleting children...');
    const { error: childrenError } = await adminClient
      .from('children')
      .delete()
      .in('parent_id', customer_ids);

    if (childrenError) {
      console.warn('Warning deleting children:', childrenError);
    }

    // Now delete the users
    console.log('Deleting users...');
    const { data, error } = await adminClient
      .from('users')
      .delete()
      .in('id', customer_ids)
      .select();

    if (error) {
      console.error('❌ Delete error:', error);
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log('✅ Successfully deleted users:', data);

    return NextResponse.json({
      success: true,
      deleted_count: customer_ids.length,
      deleted_users: data,
      message: `Successfully deleted ${customer_ids.length} user(s)`
    });

  } catch (error: any) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', stack: error.stack },
      { status: 500 }
    );
  }
}
