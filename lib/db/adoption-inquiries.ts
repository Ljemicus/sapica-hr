import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';

export interface AdoptionInquiry {
  id: string;
  listing_id: string;
  publisher_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  has_experience: boolean;
  has_yard: boolean;
  created_at: string;
}

interface CreateInquiryInput {
  listing_id: string;
  publisher_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  has_experience: boolean;
  has_yard: boolean;
}

export async function createAdoptionInquiry(input: CreateInquiryInput): Promise<AdoptionInquiry | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('adoption_inquiries')
      .insert(input)
      .select('*')
      .single();
    if (error || !data) return null;
    return data as AdoptionInquiry;
  } catch {
    return null;
  }
}

export async function getInquiriesByPublisher(publisherId: string): Promise<AdoptionInquiry[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('adoption_inquiries')
      .select('*')
      .eq('publisher_id', publisherId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as AdoptionInquiry[];
  } catch {
    return [];
  }
}

export async function getInquiriesByListing(listingId: string): Promise<AdoptionInquiry[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('adoption_inquiries')
      .select('*')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false });
    if (error || !data) return [];
    return data as AdoptionInquiry[];
  } catch {
    return [];
  }
}
