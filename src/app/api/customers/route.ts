import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const nationality = searchParams.get('nationality') || '';
    const malayali = searchParams.get('malayali'); // 'true' or 'false'
    const isRepeat = searchParams.get('isRepeat'); // 'true' or 'false'
    const behavior = searchParams.get('behavior') || '';
    const spending = searchParams.get('spending') || ''; // 'High', 'Medium', 'Low'

    let query = supabase
      .from('customers')
      .select(`
        *,
        financial_records(*)
      `)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,number.ilike.%${search}%`);
    }
    if (nationality) {
      query = query.ilike('nationality', `%${nationality}%`);
    }
    if (malayali === 'true') {
      query = query.eq('ethnicity_category', 'Malayali');
    } else if (malayali === 'false') {
      query = query.neq('ethnicity_category', 'Malayali');
    }
    if (isRepeat === 'true') {
      query = query.eq('is_repeat', true);
    }
    if (behavior) {
      query = query.eq('behavior', behavior);
    }

    const { data: customers, error } = await query;

    if (error) throw error;

    // Map financial records back to the flat format the UI expects
    let formattedCustomers = (customers || []).map(c => {
      const records = c.financial_records || [];
      const total_paid_amount = records.filter((r: { type: string, amount: string | number }) => r.type === 'Earning').reduce((sum: number, r: { amount: string | number }) => sum + Number(r.amount), 0);
      const amount_paid_to_staff = records.filter((r: { type: string, amount: string | number }) => r.type === 'Commission').reduce((sum: number, r: { amount: string | number }) => sum + Number(r.amount), 0);
      
      const staff_name = records.find((r: { type: string, staff_name: string }) => r.type === 'Commission')?.staff_name || null;

      return {
        ...c,
        total_paid_amount,
        amount_paid_to_staff,
        staff_name
      };
    });

    // Post-aggregation spending filter
    if (spending) {
      formattedCustomers = formattedCustomers.filter(c => {
        if (spending === 'High') return c.total_paid_amount >= 10000;
        if (spending === 'Medium') return c.total_paid_amount >= 2500 && c.total_paid_amount < 10000;
        if (spending === 'Low') return c.total_paid_amount < 2500;
        return true;
      });
    }

    return NextResponse.json(formattedCustomers);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Also get the user's custom persona name
    const { data: profile } = await supabase.from('profiles').select('custom_persona_name').eq('id', user.id).single();
    const customPersonaName = profile?.custom_persona_name || 'Deepa';

    const body = await request.json();
    const { 
      name, number, staff_name, total_paid_amount, amount_paid_to_staff,
      nationality, age, body_size, behavior, ethnicity_category, 
      appointment_date_time, is_repeat, call_notification 
    } = body;

    if (!name || !number) {
      return NextResponse.json({ error: 'Name and number are required' }, { status: 400 });
    }

    // 1. Insert Customer (Shared Pool)
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        name, number, 
        nationality, age: parseInt(age) || null, body_size, behavior,
        ethnicity_category, appointment_date_time: appointment_date_time || null, 
        is_repeat: is_repeat || false, call_notification
      }])
      .select()
      .single();

    if (customerError) throw customerError;

    // 2. Insert Financial Records (Private Silos)
    const isSpecialPersona = staff_name === customPersonaName;
    const earningAmount = parseFloat(total_paid_amount) || 0;
    const commissionAmount = parseFloat(amount_paid_to_staff) || 0;

    const recordsToInsert = [];

    if (earningAmount > 0) {
      recordsToInsert.push({
        user_id: user.id,
        customer_id: newCustomer.id,
        type: 'Earning',
        amount: earningAmount,
        staff_name: staff_name || null,
        is_special_persona: isSpecialPersona
      });
    }

    if (commissionAmount > 0) {
      recordsToInsert.push({
        user_id: user.id,
        customer_id: newCustomer.id,
        type: 'Commission',
        amount: commissionAmount,
        staff_name: staff_name || null,
        is_special_persona: isSpecialPersona
      });
    }

    if (recordsToInsert.length > 0) {
      const { error: finError } = await supabase.from('financial_records').insert(recordsToInsert);
      if (finError) throw finError;
    }

    return NextResponse.json({ ...newCustomer, total_paid_amount: earningAmount, amount_paid_to_staff: commissionAmount, staff_name });
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, name, number, staff_name, total_paid_amount, amount_paid_to_staff } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // We skip full PUT logic for financial records to avoid complexity, just update customer details
    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update({ name, number })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Failed to update customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    // Financial records cascade delete automatically
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
