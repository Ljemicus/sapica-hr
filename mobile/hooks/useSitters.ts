import { useCallback, useState } from 'react';
import { supabase } from '../lib/supabase';
import { SitterProfile } from '../types/database';

interface SitterFilters {
  service?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
}

export function useSitters() {
  const [sitters, setSitters] = useState<SitterProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const searchSitters = useCallback(async (filters?: SitterFilters) => {
    setLoading(true);
    let query = supabase
      .from('sitter_profiles')
      .select('*, user:users(*)')
      .order('rating_avg', { ascending: false });

    if (filters?.service) {
      query = query.contains('services', [filters.service]);
    }
    if (filters?.maxPrice) {
      query = query.lte('hourly_rate', filters.maxPrice);
    }
    if (filters?.minPrice) {
      query = query.gte('hourly_rate', filters.minPrice);
    }

    const { data } = await query;
    const results = (data ?? []).map((item: Record<string, unknown>) => ({
      ...item,
      user: item.user,
    })) as SitterProfile[];

    if (filters?.city) {
      const filtered = results.filter(
        s => s.user?.city?.toLowerCase().includes(filters.city!.toLowerCase())
      );
      setSitters(filtered);
    } else {
      setSitters(results);
    }

    setLoading(false);
  }, []);

  const getSitter = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('sitter_profiles')
      .select('*, user:users(*)')
      .eq('user_id', userId)
      .single();
    return data as SitterProfile | null;
  }, []);

  const getFeaturedSitters = useCallback(async () => {
    const { data } = await supabase
      .from('sitter_profiles')
      .select('*, user:users(*)')
      .gte('rating_avg', 4)
      .eq('verified', true)
      .order('rating_avg', { ascending: false })
      .limit(10);
    return (data ?? []) as SitterProfile[];
  }, []);

  return { sitters, loading, searchSitters, getSitter, getFeaturedSitters };
}
