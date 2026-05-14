import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const tab = searchParams.get('tab') || 'active';
    const search = searchParams.get('search') || '';

    // Fetch customers (physical)
    let custQuery = supabase.from('customers').select('*').order('created_at', { ascending: false });
    // Fetch online services
    let onlineQuery = supabase.from('online_services').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

    if (search) {
      custQuery = custQuery.or(`name.ilike.%${search}%,number.ilike.%${search}%`);
      onlineQuery = onlineQuery.or(`customer_name.ilike.%${search}%,phone_number.ilike.%${search}%`);
    }

    const [custResult, onlineResult] = await Promise.all([custQuery, onlineQuery]);

    if (custResult.error) throw custResult.error;
    if (onlineResult.error) throw onlineResult.error;

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Normalize into unified items
    type UnifiedItem = {
      id: string; name: string; phone: string; channel: string;
      service_status: string; staff_name: string | null; notes: string | null;
      follow_up_agreed: boolean; last_contact_date: string | null;
      created_at: string; source_table: string; follow_up_due: boolean;
      amount: number; extra: Record<string, unknown>;
    };

    const unified: UnifiedItem[] = [];

    for (const c of (custResult.data || [])) {
      unified.push({
        id: c.id, name: c.name, phone: c.number,
        channel: 'Physical',
        service_status: c.service_status || 'Active',
        staff_name: null, notes: c.notes,
        follow_up_agreed: c.follow_up_agreed || false,
        last_contact_date: c.last_contact_date,
        created_at: c.created_at,
        source_table: 'customers',
        follow_up_due: c.follow_up_agreed && c.last_contact_date && new Date(c.last_contact_date) <= thirtyDaysAgo,
        amount: 0,
        extra: { nationality: c.nationality, room_number: c.room_number, behavior: c.behavior, body_size: c.body_size, is_mallu: c.is_mallu, is_repeat: c.is_repeat }
      });
    }

    for (const o of (onlineResult.data || [])) {
      unified.push({
        id: o.id, name: o.customer_name, phone: o.phone_number,
        channel: 'Online',
        service_status: o.service_status || 'Active',
        staff_name: null, notes: o.notes,
        follow_up_agreed: o.follow_up_agreed || false,
        last_contact_date: o.last_contact_date,
        created_at: o.created_at,
        source_table: 'online_services',
        follow_up_due: o.follow_up_agreed && o.last_contact_date && new Date(o.last_contact_date) <= thirtyDaysAgo,
        amount: Number(o.amount) || 0,
        extra: { service_type: o.service_type, payment_method: o.payment_method, session_time: o.session_time }
      });
    }

    // Filter by tab
    let filtered: UnifiedItem[];

    if (tab === 'active') {
      filtered = unified.filter(i => ['Active', 'Pending', 'In Progress', 'Scheduled'].includes(i.service_status));
    } else if (tab === 'completed') {
      // Completed: status = Completed, but NOT yet in Deserve territory
      // Physical: goes to Deserve immediately, so physical completed = 0 in this tab
      // Online: stays in Completed for 24h, then goes to Deserve
      filtered = unified.filter(i => {
        if (i.service_status !== 'Completed') return false;
        if (i.channel === 'Physical') return false; // Physical goes directly to Deserve
        // Online: show here only if completed within last 24h
        if (i.last_contact_date && new Date(i.last_contact_date) > twentyFourHoursAgo) return true;
        return false;
      });
    } else if (tab === 'deserve') {
      filtered = unified.filter(i => {
        if (i.service_status !== 'Completed') return false;
        if (i.channel === 'Physical') return true; // Physical goes here immediately
        // Online: only after 24h
        if (i.last_contact_date && new Date(i.last_contact_date) <= twentyFourHoursAgo) return true;
        return false;
      });
    } else {
      filtered = unified;
    }

    // Counts for tab badges
    const activeCt = unified.filter(i => ['Active', 'Pending', 'In Progress', 'Scheduled'].includes(i.service_status)).length;
    const completedCt = unified.filter(i => {
      if (i.service_status !== 'Completed') return false;
      if (i.channel === 'Physical') return false;
      if (i.last_contact_date && new Date(i.last_contact_date) > twentyFourHoursAgo) return true;
      return false;
    }).length;
    const deserveCt = unified.filter(i => {
      if (i.service_status !== 'Completed') return false;
      if (i.channel === 'Physical') return true;
      if (i.last_contact_date && new Date(i.last_contact_date) <= twentyFourHoursAgo) return true;
      return false;
    }).length;
    const followUpCt = unified.filter(i => i.follow_up_due).length;

    return NextResponse.json({
      items: filtered,
      counts: { active: activeCt, completed: completedCt, deserve: deserveCt, followUp: followUpCt }
    });
  } catch (error) {
    console.error('Failed to fetch lifecycle data:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PATCH: Update status / mark as contacted
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, source_table, service_status, last_contact_date, notes } = body;

    if (!id || !source_table) return NextResponse.json({ error: 'ID and source_table required' }, { status: 400 });

    const updateData: Record<string, unknown> = {};
    if (service_status !== undefined) updateData.service_status = service_status;
    if (last_contact_date !== undefined) updateData.last_contact_date = last_contact_date;
    if (notes !== undefined) updateData.notes = notes;

    let query;
    if (source_table === 'customers') {
      query = supabase.from('customers').update(updateData).eq('id', id).select().single();
    } else {
      query = supabase.from('online_services').update(updateData).eq('id', id).eq('user_id', user.id).select().single();
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to update lifecycle:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
