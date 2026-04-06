import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const city = searchParams.get('city');
    const is24h = searchParams.get('is24h');
    
    let query = supabase
      .from('emergency_vet_clinics')
      .select('*')
      .eq('is_active', true)
      .order('city', { ascending: true })
      .order('name', { ascending: true });
    
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    
    if (is24h === 'true') {
      query = query.eq('is_24h', true);
    }
    
    const { data: clinics, error } = await query;
    
    if (error) {
      console.error('Error fetching emergency vet clinics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch emergency vet clinics' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ clinics });
  } catch (error) {
    console.error('Error in emergency-vets API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
