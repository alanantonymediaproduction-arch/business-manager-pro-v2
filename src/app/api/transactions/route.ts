import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, amount, description, linked_staff_name } = body;

    if (!amount || isNaN(amount)) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (type === 'earning') {
      const { error } = await supabase.from('earnings').insert([{ 
        amount, 
        description: description || 'New Earning',
        linked_staff_name: linked_staff_name || null 
      }]);
      if (error) throw error;
    } else if (type === 'expense') {
      const { error } = await supabase.from('expenses').insert([{ 
        amount, 
        category: 'General', 
        description: description || 'New Expense' 
      }]);
      if (error) throw error;
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
