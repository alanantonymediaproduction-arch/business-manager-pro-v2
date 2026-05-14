import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: customers, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(customers || []);
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, number, staff_name, total_paid_amount, amount_paid_to_staff,
      nationality, age, body_size, behavior, ethnicity_category, 
      appointment_date_time, is_repeat, call_notification 
    } = body;

    if (!name || !number) {
      return NextResponse.json({ error: 'Name and number are required' }, { status: 400 });
    }

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert([{
        name, number, staff_name, 
        total_paid_amount: parseFloat(total_paid_amount) || 0,
        amount_paid_to_staff: parseFloat(amount_paid_to_staff) || 0,
        nationality, age: parseInt(age) || null, body_size, behavior,
        ethnicity_category, appointment_date_time: appointment_date_time || null, 
        is_repeat: is_repeat || false, call_notification
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newCustomer);
  } catch (error) {
    console.error('Failed to create customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, name, number, staff_name, total_paid_amount, amount_paid_to_staff } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update({
        name, number, staff_name,
        total_paid_amount: parseFloat(total_paid_amount) || 0,
        amount_paid_to_staff: parseFloat(amount_paid_to_staff) || 0
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

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
