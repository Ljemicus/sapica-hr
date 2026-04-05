import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { AppealStatus, RescueAppeal } from '@/lib/types';
import { canTransitionAppealStatus } from '@/lib/types';

interface CreateRescueAppealInput {
  organization_id: string;
  title: string;
  slug: string;
  summary: string;
  created_by: string;
  urgency?: RescueAppeal['urgency'];
  story?: string | null;
  beneficiary_name?: string | null;
  species?: string | null;
  location_label?: string | null;
  cover_image_url?: string | null;
  target_amount_cents?: number;
  currency?: string;
  starts_at?: string | null;
  ends_at?: string | null;
}

export async function getRescueAppeal(id: string): Promise<RescueAppeal | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeals')
      .select('*, organization:rescue_organizations(*)')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return null;
    return data as RescueAppeal;
  } catch {
    return null;
  }
}

export async function getRescueAppealBySlug(slug: string): Promise<RescueAppeal | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeals')
      .select('*, organization:rescue_organizations(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (error || !data) return null;
    return data as RescueAppeal;
  } catch {
    return null;
  }
}

export async function getRescueAppealsByOrganization(
  organizationId: string,
  status?: AppealStatus
): Promise<RescueAppeal[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('rescue_appeals')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as RescueAppeal[];
  } catch {
    return [];
  }
}

export async function getActiveRescueAppeals(): Promise<RescueAppeal[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeals')
      .select('*, organization:rescue_organizations(*)')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as RescueAppeal[];
  } catch {
    return [];
  }
}

export async function createRescueAppeal(
  input: CreateRescueAppealInput
): Promise<RescueAppeal | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const payload = {
      organization_id: input.organization_id,
      status: 'draft' as AppealStatus,
      urgency: input.urgency ?? 'normal',
      title: input.title,
      slug: input.slug,
      summary: input.summary,
      story: input.story ?? null,
      beneficiary_name: input.beneficiary_name ?? null,
      species: input.species ?? null,
      location_label: input.location_label ?? null,
      cover_image_url: input.cover_image_url ?? null,
      target_amount_cents: input.target_amount_cents ?? 0,
      currency: input.currency ?? 'EUR',
      starts_at: input.starts_at ?? null,
      ends_at: input.ends_at ?? null,
      created_by: input.created_by,
    };

    const { data, error } = await supabase
      .from('rescue_appeals')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueAppeal;
  } catch {
    return null;
  }
}

export async function updateRescueAppeal(
  id: string,
  updates: Partial<Omit<RescueAppeal, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at' | 'organization'>>
): Promise<RescueAppeal | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeals')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueAppeal;
  } catch {
    return null;
  }
}

export async function updateRescueAppealStatus(
  id: string,
  status: AppealStatus
): Promise<RescueAppeal | null> {
  const current = await getRescueAppeal(id);
  if (!current || !canTransitionAppealStatus(current.status, status)) return null;

  return updateRescueAppeal(id, {
    status,
    starts_at: status === 'active' && !current.starts_at ? new Date().toISOString() : current.starts_at,
    closed_at:
      status === 'closed' || status === 'cancelled'
        ? new Date().toISOString()
        : status === 'active'
          ? null
          : current.closed_at,
  });
}
