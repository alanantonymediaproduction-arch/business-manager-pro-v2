import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const paymentMethod = searchParams.get('paymentMethod') || '';
    const serviceType = searchParams.get('serviceType') || '';
    const status = searchParams.get('status') || '';

    let query = supabase
      .from('online_services')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`customer_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }
    if (paymentMethod) {
      query = query.eq('payment_method', paymentMethod);
    }
    if (serviceType) {
      query = query.eq('service_type', serviceType);
    }
    if (status) {
      query = query.eq('service_status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Failed to fetch online services:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { customer_name, phone_number, amount, session_time, payment_method, service_type, service_status, notes, follow_up_agreed } = body;

    if (!customer_name || !phone_number || !amount) {
      return NextResponse.json({ error: 'Name, phone, and amount are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('online_services')
      .insert([{
        user_id: user.id,
        customer_name, phone_number,
        amount: parseFloat(amount),
        session_time: session_time || null,
        payment_method: payment_method || null,
        service_type: service_type || null,
        service_status: service_status || 'Active',
        notes: notes || null,
        follow_up_agreed: follow_up_agreed || false,
        last_contact_date: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create online service:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, customer_name, phone_number, amount, session_time, payment_method, service_type, service_status, notes, follow_up_agreed } = body;
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { data, error } = await supabase
      .from('online_services')
      .update({
        customer_name, phone_number,
        amount: parseFloat(amount),
        session_time: session_time || null,
        payment_method: payment_method || null,
        service_type: service_type || null,
        service_status: service_status || 'Active',
        notes: notes || null,
        follow_up_agreed: follow_up_agreed || false,
        last_contact_date: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const { error } = await supabase.from('online_services').delete().eq('id', id).eq('user_id', user.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
