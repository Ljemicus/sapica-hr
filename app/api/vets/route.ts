import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { withCache, cacheKey, CacheTTL, CachePrefix } from '@/lib/cache';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const service = searchParams.get('service');

    // Generate cache key based on query params
    const cacheK = cacheKey(CachePrefix.VET, 'list', city || 'all', service || 'all');

    // Try to get from cache
    const result = await withCache(async () => {
      const supabase = await createClient();

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
        throw error;
      }

      return {
        clinics: clinics || [],
        count: clinics?.length || 0,
      };
    }, cacheK, { ttl: CacheTTL.VETERINARIANS });

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in /api/vets:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
