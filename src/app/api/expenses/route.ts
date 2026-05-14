import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: expenses, error } = await supabase
      .from('financial_records')
      .select('*')
      .eq('type', 'Expense')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(expenses || []);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { amount, category, description } = body;

    const { data, error } = await supabase
      .from('financial_records')
      .insert([{
        user_id: user.id,
        type: 'Expense',
        amount: parseFloat(amount),
        description: `[${category}] ${description}`,
        is_special_persona: false
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}
