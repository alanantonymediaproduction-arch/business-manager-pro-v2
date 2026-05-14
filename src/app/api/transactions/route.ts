import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('custom_persona_name').eq('id', user.id).single();
    const customPersonaName = profile?.custom_persona_name || 'Deepa';

    const body = await request.json();
    const { type, amount, description, linked_staff_name } = body;

    const isSpecialPersona = linked_staff_name === customPersonaName;

    // Type must be 'Earning' or 'Expense' from the form
    const mappedType = type.toLowerCase() === 'earning' ? 'Earning' : 'Expense';

    const { data, error } = await supabase
      .from('financial_records')
      .insert([{
        user_id: user.id,
        type: mappedType,
        amount: parseFloat(amount),
        description,
        staff_name: linked_staff_name,
        is_special_persona: isSpecialPersona
      }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to create transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
