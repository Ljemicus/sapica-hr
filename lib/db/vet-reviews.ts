'use server';

import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { VetReview, VetReviewStats, VetServiceType } from '@/lib/types/vet-reviews';

export async function getVetReviews(
  vetId: string,
  options?: {
    limit?: number;
    offset?: number;
    serviceType?: VetServiceType;
    verifiedOnly?: boolean;
  }
): Promise<VetReview[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('vet_reviews')
      .select(`
        *,
        user:user_id(id, name, avatar_url)
      `)
      .eq('vet_id', vetId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (options?.serviceType) {
      query = query.eq('service_type', options.serviceType);
    }
    if (options?.verifiedOnly) {
      query = query.eq('is_verified', true);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []) as VetReview[];
  } catch {
    return [];
  }
}

export async function getVetReviewStats(vetId: string): Promise<VetReviewStats | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc('get_vet_review_stats', { p_vet_id: vetId });

    if (error || !data) return null;
    return data as VetReviewStats;
  } catch {
    return null;
  }
}

export async function createVetReview(
  reviewData: Omit<VetReview, 'id' | 'created_at' | 'updated_at' | 'helpful_count' | 'flag_count' | 'status' | 'is_verified' | 'user'>
): Promise<VetReview | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    
    // Check if user has a completed booking to mark as verified
    const { data: bookingData } = await supabase
      .from('bookings')
      .select('id')
      .eq('owner_id', reviewData.user_id)
      .eq('status', 'completed')
      .limit(1)
      .maybeSingle();
    
    const isVerified = !!bookingData;
    
    const { data, error } = await supabase
      .from('vet_reviews')
      .insert({
        ...reviewData,
        is_verified: isVerified,
        status: 'active',
        helpful_count: 0,
        flag_count: 0,
      })
      .select('*, user:user_id(id, name, avatar_url)')
      .single();

    if (error) throw error;
    
    // Update vet rating stats
    await supabase.rpc('update_vet_rating', { p_vet_id: reviewData.vet_id });
    
    return data as VetReview;
  } catch {
    return null;
  }
}

export async function updateVetReview(
  reviewId: string,
  userId: string,
  updates: Partial<Pick<VetReview, 'rating' | 'comment' | 'service_type' | 'price_paid' | 'visit_date'>>
): Promise<VetReview | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('vet_reviews')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .eq('user_id', userId)
      .select('*, user:user_id(id, name, avatar_url)')
      .single();

    if (error) throw error;
    
    // Update vet rating stats
    const review = data as VetReview;
    await supabase.rpc('update_vet_rating', { p_vet_id: review.vet_id });
    
    return review;
  } catch {
    return null;
  }
}

export async function deleteVetReview(reviewId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    
    // Get vet_id before deleting for rating update
    const { data: review } = await supabase
      .from('vet_reviews')
      .select('vet_id')
      .eq('id', reviewId)
      .eq('user_id', userId)
      .single();
    
    if (!review) return false;
    
    const { error } = await supabase
      .from('vet_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', userId);

    if (error) throw error;
    
    // Update vet rating stats
    await supabase.rpc('update_vet_rating', { p_vet_id: review.vet_id });
    
    return true;
  } catch {
    return false;
  }
}

export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('increment_review_helpful', { p_review_id: reviewId });
    return !error;
  } catch {
    return false;
  }
}

export async function flagReview(reviewId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc('flag_review', { 
      p_review_id: reviewId,
      p_user_id: userId 
    });
    return !error;
  } catch {
    return false;
  }
}

export async function getUserVetReview(vetId: string, userId: string): Promise<VetReview | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('vet_reviews')
      .select('*, user:user_id(id, name, avatar_url)')
      .eq('vet_id', vetId)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    return data as VetReview | null;
  } catch {
    return null;
  }
}
