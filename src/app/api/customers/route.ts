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
    const isRepeat = searchParams.get('isRepeat');
    const isMallu = searchParams.get('isMallu');
    const behavior = searchParams.get('behavior') || '';
    const spending = searchParams.get('spending') || '';
    const sort = searchParams.get('sort') || 'latest';

    let query = supabase
      .from('customers')
      .select(`
        *,
        financial_records(*)
      `);

    if (sort === 'latest') {
      query = query.order('created_at', { ascending: false });
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,number.ilike.%${search}%`);
    }
    if (nationality) {
      query = query.ilike('nationality', `%${nationality}%`);
    }
    if (isMallu === 'true') {
      query = query.eq('is_mallu', true);
    }
    if (isRepeat === 'true') {
      query = query.eq('is_repeat', true);
    }
    if (behavior) {
      query = query.eq('behavior', behavior);
    }

    const { data: customers, error } = await query;
    if (error) throw error;

    let formattedCustomers = (customers || []).map(c => {
      const records = c.financial_records || [];
      const total_paid_amount = records.filter((r: { type: string; amount: string | number }) => r.type === 'Earning').reduce((sum: number, r: { amount: string | number }) => sum + Number(r.amount), 0);
      const amount_paid_to_staff = records.filter((r: { type: string; amount: string | number }) => r.type === 'Commission').reduce((sum: number, r: { amount: string | number }) => sum + Number(r.amount), 0);
      const staff_name = records.find((r: { type: string; staff_name: string }) => r.type === 'Commission')?.staff_name || null;

      return { ...c, total_paid_amount, amount_paid_to_staff, staff_name };
    });

    // Post-aggregation spending filter
    if (spending === 'High') formattedCustomers = formattedCustomers.filter(c => c.total_paid_amount >= 10000);
    else if (spending === 'Medium') formattedCustomers = formattedCustomers.filter(c => c.total_paid_amount >= 2500 && c.total_paid_amount < 10000);
    else if (spending === 'Low') formattedCustomers = formattedCustomers.filter(c => c.total_paid_amount < 2500);

    // Sort by highest amount
    if (sort === 'highest') {
      formattedCustomers.sort((a, b) => b.total_paid_amount - a.total_paid_amount);
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

    const { data: profile } = await supabase.from('profiles').select('custom_persona_name').eq('id', user.id).single();
    const customPersonaName = profile?.custom_persona_name || 'Deepa';

    const body = await request.json();
    const { 
      name, number, staff_name, total_paid_amount, amount_paid_to_staff,
      nationality, age, body_size, behavior, room_number,
      meeting_duration, appointment_date_time, is_repeat, is_mallu, repeat_count
    } = body;

    if (!name || !number) {
      return NextResponse.json({ error: 'Name and number are required' }, { status: 400 });
    }

    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert([{
        name, number, nationality,
        age: parseInt(age) || null,
        body_size: body_size || null,
        behavior: behavior || null,
        room_number: room_number || null,
        meeting_duration: meeting_duration || null,
        appointment_date_time: appointment_date_time || null,
        is_repeat: is_repeat || false,
        is_mallu: is_mallu || false,
        repeat_count: parseInt(repeat_count) || 0
      }])
      .select()
      .single();

    if (customerError) throw customerError;

    const isSpecialPersona = staff_name === customPersonaName;
    const earningAmount = parseFloat(total_paid_amount) || 0;
    const commissionAmount = parseFloat(amount_paid_to_staff) || 0;
    const recordsToInsert = [];

    if (earningAmount > 0) {
      recordsToInsert.push({
        user_id: user.id, customer_id: newCustomer.id,
        type: 'Earning', amount: earningAmount,
        staff_name: staff_name || null, is_special_persona: isSpecialPersona
      });
    }
    if (commissionAmount > 0) {
      recordsToInsert.push({
        user_id: user.id, customer_id: newCustomer.id,
        type: 'Commission', amount: commissionAmount,
        staff_name: staff_name || null, is_special_persona: isSpecialPersona
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
    const { id, name, number, nationality, age, body_size, behavior, room_number, meeting_duration, appointment_date_time, is_repeat, is_mallu, repeat_count } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update({
        name, number, nationality,
        age: parseInt(age) || null,
        body_size: body_size || null,
        behavior: behavior || null,
        room_number: room_number || null,
        meeting_duration: meeting_duration || null,
        appointment_date_time: appointment_date_time || null,
        is_repeat: is_repeat || false,
        is_mallu: is_mallu || false,
        repeat_count: parseInt(repeat_count) || 0
      })
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

    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
