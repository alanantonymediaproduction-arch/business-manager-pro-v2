import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    let customPersonaName = 'Deepa';
    
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('custom_persona_name').eq('id', user.id).single();
      if (profile?.custom_persona_name) {
        customPersonaName = profile.custom_persona_name;
      }
    }

    const { data: staff, error } = await supabase
      .from('staff')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const staffList = staff || [];
    
    // Add the dynamic persona to the staff list if not present
    if (!staffList.find(s => s.name === customPersonaName)) {
      staffList.unshift({
        id: 'special-persona',
        name: customPersonaName,
        role: 'Special Persona',
        nationality: null,
        created_at: new Date().toISOString()
      });
    }

    return NextResponse.json(staffList);
  } catch (error) {
    console.error('Failed to fetch staff:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { name, role, nationality } = body;

    if (!name || !role) {
      return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
    }

    const { data: newStaff, error } = await supabase
      .from('staff')
      .insert([{ name, role, nationality }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newStaff);
  } catch (error) {
    console.error('Failed to create staff:', error);
    return NextResponse.json({ error: 'Failed to create staff' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, name, role, nationality } = body;

    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });

    const { data: updatedStaff, error } = await supabase
      .from('staff')
      .update({ name, role, nationality })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(updatedStaff);
  } catch (error) {
    console.error('Failed to update staff:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
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

    const { error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete staff:', error);
    return NextResponse.json({ error: 'Failed to delete staff' }, { status: 500 });
  }
}
