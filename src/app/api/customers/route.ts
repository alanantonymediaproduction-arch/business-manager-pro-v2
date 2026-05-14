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
      name, number, nationality, age, body_size, behavior, 
      ethnicity_category, appointment_date_time, is_repeat, call_notification 
    } = body;

    if (!name || !number) {
      return NextResponse.json({ error: 'Name and number are required' }, { status: 400 });
    }

    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert([{
        name, number, nationality, age: parseInt(age) || null, body_size, behavior,
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
