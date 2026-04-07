import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { Pet } from '@/lib/types';

// GET /api/pets - Get current user's pets
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: pets, error } = await supabase
      .from('pets')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching pets:', error);
      return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 });
    }

    return NextResponse.json({ pets: pets as Pet[] });
  } catch (error) {
    console.error('Error in GET /api/pets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
