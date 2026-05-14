import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    let profile = profileData;

    // If profile doesn't exist, create it (auto-provisioning)
    if (error && error.code === 'PGRST116') {
      const { data: newProfile, error: insertError } = await supabase.from('profiles').insert([
        { id: user.id, full_name: user.user_metadata?.full_name || user.email, custom_persona_name: 'Deepa' }
      ]).select().single();
      
      if (insertError) throw insertError;
      profile = newProfile;
    } else if (error) {
      throw error;
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { custom_persona_name, admin_pin } = body;

    const updateData: Record<string, string> = {};
    if (custom_persona_name !== undefined) updateData.custom_persona_name = custom_persona_name;
    if (admin_pin !== undefined) updateData.admin_pin = admin_pin;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
