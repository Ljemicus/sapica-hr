import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { ProviderVerification, VerificationStatus, VerificationType } from '@/lib/types/trust';

export async function getVerification(
  providerApplicationId: string,
  verificationType: VerificationType
): Promise<ProviderVerification | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_verifications')
      .select('*')
      .eq('provider_application_id', providerApplicationId)
      .eq('verification_type', verificationType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return data as ProviderVerification;
  } catch {
    return null;
  }
}

export async function upsertVerification(
  providerApplicationId: string,
  verificationType: VerificationType,
  status: VerificationStatus
): Promise<ProviderVerification | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const existing = await getVerification(providerApplicationId, verificationType);

    if (existing) {
      const { data, error } = await supabase
        .from('provider_verifications')
        .update({
          status,
          submitted_at: status === 'pending' ? new Date().toISOString() : existing.submitted_at,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (error || !data) return null;
      return data as ProviderVerification;
    }

    const { data, error } = await supabase
      .from('provider_verifications')
      .insert({
        provider_application_id: providerApplicationId,
        verification_type: verificationType,
        status,
        submitted_at: status === 'pending' ? new Date().toISOString() : null,
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderVerification;
  } catch {
    return null;
  }
}

export async function updateVerificationReview(
  verificationId: string,
  status: VerificationStatus,
  reviewedBy: string,
  rejectionReason?: string,
  notesInternal?: string
): Promise<ProviderVerification | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const patch: Record<string, unknown> = {
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewedBy,
      updated_at: new Date().toISOString(),
    };
    if (rejectionReason !== undefined) patch.rejection_reason = rejectionReason || null;
    if (notesInternal !== undefined) patch.notes_internal = notesInternal || null;

    const { data, error } = await supabase
      .from('provider_verifications')
      .update(patch)
      .eq('id', verificationId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderVerification;
  } catch {
    return null;
  }
}

export async function getVerificationById(id: string): Promise<ProviderVerification | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_verifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as ProviderVerification;
  } catch {
    return null;
  }
}

export async function getPendingVerifications(): Promise<ProviderVerification[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_verifications')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true });

    if (error || !data) return [];
    return data as ProviderVerification[];
  } catch {
    return [];
  }
}

export async function getAllVerifications(
  statusFilter?: VerificationStatus
): Promise<ProviderVerification[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('provider_verifications')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as ProviderVerification[];
  } catch {
    return [];
  }
}
