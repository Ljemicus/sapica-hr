import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import {
  getGroomerById as mockGetGroomer,
  getGroomers as mockGetGroomers,
  getGroomerReviews as mockGetGroomerReviews,
} from '@/lib/mock-data';
import type { Groomer, GroomingServiceType } from '@/lib/types';

interface GroomerFilters {
  city?: string;
  service?: GroomingServiceType;
}

interface GroomerReview {
  id: string;
  groomer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

export async function getGroomers(filters?: GroomerFilters): Promise<Groomer[]> {
  if (!isSupabaseConfigured()) {
    return mockGetGroomers(filters ? { city: filters.city, service: filters.service } : undefined);
  }
  try {
    const supabase = await createClient();
    let query = supabase.from('groomers').select('*');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    const { data, error } = await query;
    if (error || !data) return mockGetGroomers(filters ? { city: filters.city, service: filters.service } : undefined);

    let results = data as Groomer[];

    if (filters?.service) {
      results = results.filter(
        (g) => Array.isArray(g.services) && g.services.includes(filters.service!)
      );
    }

    results.sort((a, b) => b.rating - a.rating);
    return results;
  } catch {
    return mockGetGroomers(filters ? { city: filters.city, service: filters.service } : undefined);
  }
}

export async function getGroomer(id: string): Promise<Groomer | null> {
  if (!isSupabaseConfigured()) {
    return mockGetGroomer(id) ?? null;
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('groomers').select('*').eq('id', id).single();
    if (error || !data) return mockGetGroomer(id) ?? null;
    return data as Groomer;
  } catch {
    return mockGetGroomer(id) ?? null;
  }
}

export async function getGroomerReviews(groomerId: string): Promise<GroomerReview[]> {
  if (!isSupabaseConfigured()) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockGetGroomerReviews(groomerId) as any[];
  }
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('groomer_reviews')
      .select('*')
      .eq('groomer_id', groomerId)
      .order('created_at', { ascending: false });
    if (error || !data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return mockGetGroomerReviews(groomerId) as any[];
    }
    return data as GroomerReview[];
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return mockGetGroomerReviews(groomerId) as any[];
  }
}
