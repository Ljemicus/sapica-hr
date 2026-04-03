import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { ProviderApplication, ProviderApplicationStatus } from '@/lib/types';
import type { ProviderDraftInput } from '@/lib/validations';

function normalizePatch(input: ProviderDraftInput) {
  const patch: Record<string, unknown> = {};

  if (input.display_name !== undefined) patch.display_name = input.display_name;
  if (input.bio !== undefined) patch.bio = input.bio;
  if (input.city !== undefined) patch.city = input.city;
  if (input.phone !== undefined) patch.phone = input.phone;
  if (input.provider_type !== undefined) patch.provider_type = input.provider_type;
  if (input.services !== undefined) patch.services = input.services;
  if (input.experience_years !== undefined) patch.experience_years = input.experience_years;
  if (input.prices !== undefined) patch.prices = input.prices;
  if (input.business_name !== undefined) patch.business_name = input.business_name || null;
  if (input.oib !== undefined) patch.oib = input.oib || null;
  if (input.address !== undefined) patch.address = input.address || null;
  if (input.terms_accepted !== undefined) {
    patch.terms_accepted = input.terms_accepted;
    patch.terms_accepted_at = input.terms_accepted ? new Date().toISOString() : null;
  }
  if (input.privacy_accepted !== undefined) {
    patch.privacy_accepted = input.privacy_accepted;
    patch.privacy_accepted_at = input.privacy_accepted ? new Date().toISOString() : null;
  }

  patch.updated_at = new Date().toISOString();
  return patch;
}

export async function getProviderApplication(userId: string): Promise<ProviderApplication | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as ProviderApplication;
  } catch {
    return null;
  }
}

export async function createProviderApplication(
  userId: string,
  input: ProviderDraftInput & { display_name: string; provider_type: string }
): Promise<ProviderApplication | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const payload = {
      user_id: userId,
      display_name: input.display_name,
      bio: input.bio ?? null,
      city: input.city ?? null,
      phone: input.phone ?? null,
      provider_type: input.provider_type,
      services: input.services ?? [],
      experience_years: input.experience_years ?? 0,
      prices: input.prices ?? {},
      business_name: input.business_name || null,
      oib: input.oib || null,
      address: input.address || null,
      terms_accepted: input.terms_accepted ?? false,
      terms_accepted_at: input.terms_accepted ? new Date().toISOString() : null,
      privacy_accepted: input.privacy_accepted ?? false,
      privacy_accepted_at: input.privacy_accepted ? new Date().toISOString() : null,
      status: 'draft' as ProviderApplicationStatus,
    };

    const { data, error } = await supabase
      .from('provider_applications')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderApplication;
  } catch {
    return null;
  }
}

export async function upsertProviderApplication(
  userId: string,
  input: ProviderDraftInput
): Promise<ProviderApplication | null> {
  if (!isSupabaseConfigured()) return null;

  const existing = await getProviderApplication(userId);
  if (!existing) {
    if (!input.display_name || !input.provider_type) {
      return null;
    }
    return createProviderApplication(userId, {
      ...input,
      display_name: input.display_name,
      provider_type: input.provider_type,
    });
  }

  try {
    const supabase = await createClient();
    const patch = normalizePatch(input);

    const { data, error } = await supabase
      .from('provider_applications')
      .update(patch)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderApplication;
  } catch {
    return null;
  }
}

export async function submitProviderApplication(userId: string): Promise<ProviderApplication | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_applications')
      .update({ status: 'pending_verification', updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderApplication;
  } catch {
    return null;
  }
}



export async function getProviderApplicationById(applicationId: string): Promise<ProviderApplication | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_applications')
      .select('*')
      .eq('id', applicationId)
      .maybeSingle();

    if (error || !data) return null;
    return data as ProviderApplication;
  } catch {
    return null;
  }
}

// ── Admin Functions ──

export async function getAllProviderApplications(): Promise<ProviderApplication[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_applications')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data) return [];
    return data as ProviderApplication[];
  } catch {
    return [];
  }
}

export async function updateProviderApplicationStatus(
  applicationId: string,
  status: ProviderApplicationStatus,
  reviewedBy: string,
  adminNotes?: string
): Promise<ProviderApplication | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const patch: Record<string, unknown> = {
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (adminNotes !== undefined) {
      patch.admin_notes = adminNotes || null;
    }

    const { data, error } = await supabase
      .from('provider_applications')
      .update(patch)
      .eq('id', applicationId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderApplication;
  } catch {
    return null;
  }
}

export async function updateProviderStripeState(
  userId: string,
  patch: {
    stripe_account_id?: string;
    stripe_onboarding_complete?: boolean;
    payout_enabled?: boolean;
  }
): Promise<ProviderApplication | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_applications')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderApplication;
  } catch {
    return null;
  }
}
