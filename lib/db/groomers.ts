import { createClient } from '@/lib/supabase/server';
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
  try {
    const supabase = await createClient();
    let query = supabase.from('groomers').select('*');

    if (filters?.city) {
      query = query.eq('city', filters.city);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let results = data as Groomer[];

    // Filter JSONB services in JS
    if (filters?.service) {
      results = results.filter(
        (g) => Array.isArray(g.services) && g.services.includes(filters.service!)
      );
    }

    // Sort by rating descending
    results.sort((a, b) => b.rating - a.rating);

    return results;
  } catch {
    return [];
  }
}

export async function getGroomer(id: string): Promise<Groomer | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('groomers').select('*').eq('id', id).single();
    if (error || !data) return null;
    return data as Groomer;
  } catch {
    return null;
  }
}

export async function getGroomerReviews(groomerId: string): Promise<GroomerReview[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('groomer_reviews')
      .select('*')
      .eq('groomer_id', groomerId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as GroomerReview[];
  } catch {
    return [];
  }
}
