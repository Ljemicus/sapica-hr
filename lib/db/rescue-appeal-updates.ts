import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { AppealUpdateType, RescueAppealUpdate } from '@/lib/types';

interface CreateRescueAppealUpdateInput {
  appeal_id: string;
  organization_id: string;
  body: string;
  created_by: string;
  update_type?: AppealUpdateType;
  title?: string | null;
  image_url?: string | null;
  is_public?: boolean;
  published_at?: string | null;
}

export async function getAppealUpdates(
  appealId: string,
  options?: { publicOnly?: boolean }
): Promise<RescueAppealUpdate[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    let query = supabase
      .from('rescue_appeal_updates')
      .select('*')
      .eq('appeal_id', appealId)
      .order('created_at', { ascending: false });

    if (options?.publicOnly) query = query.eq('is_public', true);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as RescueAppealUpdate[];
  } catch {
    return [];
  }
}

export async function createAppealUpdate(
  input: CreateRescueAppealUpdateInput
): Promise<RescueAppealUpdate | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeal_updates')
      .insert({
        appeal_id: input.appeal_id,
        organization_id: input.organization_id,
        update_type: input.update_type ?? 'progress',
        title: input.title ?? null,
        body: input.body,
        image_url: input.image_url ?? null,
        is_public: input.is_public ?? true,
        published_at: input.is_public === false ? null : input.published_at ?? new Date().toISOString(),
        created_by: input.created_by,
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueAppealUpdate;
  } catch {
    return null;
  }
}

export async function updateAppealUpdate(
  id: string,
  updates: Partial<Omit<RescueAppealUpdate, 'id' | 'appeal_id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>>
): Promise<RescueAppealUpdate | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('rescue_appeal_updates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) return null;
    return data as RescueAppealUpdate;
  } catch {
    return null;
  }
}
