import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

// GET /api/contests — list active contests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const limit = parseInt(searchParams.get('limit') || '10');

    const supabase = await createClient();
    
    let query = supabase
      .from('photo_contests')
      .select('*')
      .order('start_date', { ascending: false })
      .limit(limit);
    
    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data: contests, error: _error } = await query;

    if (_error) {
      return NextResponse.json({ error: 'Failed to fetch contests' }, { status: 500 });
    }

    return NextResponse.json({ contests });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

// POST /api/contests — create contest (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createClient();

    const { data: contest, error } = await supabase
      .from('photo_contests')
      .insert({
        ...body,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create contest' }, { status: 500 });
    }

    return NextResponse.json({ contest }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
