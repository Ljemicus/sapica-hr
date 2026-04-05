import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { AppealDonationStatus, RescueAppealDonation } from '@/lib/types';

interface CreateRescueAppealDonationInput {
  appeal_id: string;
  organization_id: string;
  amount_cents: number;
  donor_user_id?: string | null;
  donor_name?: string | null;
  donor_email?: string | null;
  is_anonymous?: boolean;
  currency?: string;
  provider?: string | null;
  provider_payment_intent_id?: string | null;
  provider_checkout_session_id?: string | null;
  message?: string | null;
  status?: AppealDonationStatus;
  paid_at?: string | null;
}

export async function createAppealDonationRecord(
  input: CreateRescueAppealDonationInput
): Promise<RescueAppealDonation | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeal_donations')
      .insert({
        appeal_id: input.appeal_id,
        organization_id: input.organization_id,
        donor_user_id: input.donor_user_id ?? null,
        donor_name: input.donor_name ?? null,
        donor_email: input.donor_email ?? null,
        is_anonymous: input.is_anonymous ?? false,
        amount_cents: input.amount_cents,
        currency: input.currency ?? 'EUR',
        status: input.status ?? 'pending',
        provider: input.provider ?? null,
        provider_payment_intent_id: input.provider_payment_intent_id ?? null,
        provider_checkout_session_id: input.provider_checkout_session_id ?? null,
        message: input.message ?? null,
        paid_at: input.paid_at ?? null,
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueAppealDonation;
  } catch {
    return null;
  }
}

export async function getAppealDonationRecords(appealId: string): Promise<RescueAppealDonation[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeal_donations')
      .select('*')
      .eq('appeal_id', appealId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as RescueAppealDonation[];
  } catch {
    return [];
  }
}

export async function updateAppealDonationStatus(
  donationId: string,
  status: AppealDonationStatus,
  patch?: Partial<Pick<RescueAppealDonation, 'paid_at' | 'refunded_at' | 'provider_payment_intent_id' | 'provider_checkout_session_id'>>
): Promise<RescueAppealDonation | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeal_donations')
      .update({ ...patch, status, updated_at: new Date().toISOString() })
      .eq('id', donationId)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueAppealDonation;
  } catch {
    return null;
  }
}
