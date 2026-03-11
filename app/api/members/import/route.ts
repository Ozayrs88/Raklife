import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const businessId = formData.get('business_id') as string;

    if (!file || !businessId) {
      return NextResponse.json({ error: 'Missing file or business_id' }, { status: 400 });
    }

    // Verify user has access to this business
    const { data: staff } = await supabase
      .from('business_staff')
      .select('id')
      .eq('user_id', user.id)
      .eq('business_id', businessId)
      .single();

    if (!staff) {
      return NextResponse.json({ error: 'Unauthorized for this business' }, { status: 403 });
    }

    // Parse CSV
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);

    // Create import record
    const { data: importRecord } = await supabase
      .from('member_imports')
      .insert({
        business_id: businessId,
        file_name: file.name,
        total_rows: rows.length,
        status: 'processing',
        uploaded_by: user.id,
      })
      .select()
      .single();

    let successful = 0;
    let failed = 0;
    const errors: Array<{ row: number; error: string }> = [];

    // Process each row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const values = row.split(',').map(v => v.trim());
      const rowData: any = {};
      
      headers.forEach((header, idx) => {
        rowData[header] = values[idx] || '';
      });

      try {
        // Validate required fields
        if (!rowData.parent_email || !rowData.parent_name) {
          throw new Error('Missing required fields: parent_email or parent_name');
        }

        // Check if user exists
        let { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('email', rowData.parent_email)
          .single();

        let userId: string;

        if (existingUser) {
          // Update existing user
          userId = existingUser.id;
          await supabase
            .from('users')
            .update({
              full_name: rowData.parent_name,
              phone: rowData.phone || null,
              overdue_amount: parseFloat(rowData.overdue_amount) || 0,
              payment_status: parseFloat(rowData.overdue_amount) > 0 ? 'overdue' : 'current',
              last_payment_date: rowData.last_payment_date || null,
            })
            .eq('id', userId);
          
          // Check if booking exists for this business
          const { data: existingBooking } = await supabase
            .from('bookings')
            .select('id')
            .eq('customer_id', userId)
            .eq('business_id', businessId)
            .single();
          
          // Create booking if it doesn't exist
          if (!existingBooking) {
            await supabase
              .from('bookings')
              .insert({
                business_id: businessId,
                customer_id: userId,
                booking_date: new Date().toISOString(),
                status: 'active',
                notes: 'Imported from CSV',
              });
          }
        } else {
          // Create new user
          const { data: newUser, error: userError } = await supabase
            .from('users')
            .insert({
              email: rowData.parent_email,
              full_name: rowData.parent_name,
              phone: rowData.phone || null,
              user_type: 'customer',
              overdue_amount: parseFloat(rowData.overdue_amount) || 0,
              payment_status: parseFloat(rowData.overdue_amount) > 0 ? 'overdue' : 'current',
              last_payment_date: rowData.last_payment_date || null,
            })
            .select()
            .single();

          if (userError || !newUser) {
            throw new Error('Failed to create user');
          }
          userId = newUser.id;
          
          // Create booking for new user
          await supabase
            .from('bookings')
            .insert({
              business_id: businessId,
              customer_id: userId,
              booking_date: new Date().toISOString(),
              status: 'active',
              notes: 'Imported from CSV',
            });
        }

        // Create or update child if provided
        if (rowData.child_name) {
          const { data: existingChild } = await supabase
            .from('children')
            .select('id')
            .eq('parent_id', userId)
            .eq('first_name', rowData.child_name)
            .single();

          if (!existingChild) {
            await supabase
              .from('children')
              .insert({
                parent_id: userId,
                first_name: rowData.child_name,
                last_name: '',
                date_of_birth: rowData.child_age ? 
                  new Date(new Date().getFullYear() - parseInt(rowData.child_age), 0, 1).toISOString().split('T')[0] : 
                  null,
              });
          }
        }

        successful++;
      } catch (error: any) {
        failed++;
        errors.push({
          row: i + 2, // +2 because of header and 0-indexing
          error: error.message,
        });
      }
    }

    // Update import record
    await supabase
      .from('member_imports')
      .update({
        processed_rows: rows.length,
        successful_rows: successful,
        failed_rows: failed,
        status: 'completed',
        error_log: errors,
      })
      .eq('id', importRecord.id);

    return NextResponse.json({
      total_rows: rows.length,
      successful,
      failed,
      errors: errors.slice(0, 20), // Return first 20 errors
    });

  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
