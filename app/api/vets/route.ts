import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const city = searchParams.get('city');
    const service = searchParams.get('service');
    
    let query = supabase
      .from('emergency_vet_clinics')
      .select('*')
      .eq('is_active', true)
      .order('city', { ascending: true })
      .order('name', { ascending: true });
    
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    
    if (service) {
      query = query.contains('services', [service]);
    }
    
    const { data: clinics, error } = await query;
    
    if (error) {
      console.error('Error fetching vet clinics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch vet clinics' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      clinics: clinics || [],
      count: clinics?.length || 0 
    });
    
  } catch (error) {
    console.error('Error in /api/vets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
