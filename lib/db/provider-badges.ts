import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { ProviderBadge, BadgeType } from '@/lib/types/trust';

export async function grantBadge(
  providerApplicationId: string,
  badgeType: BadgeType
): Promise<ProviderBadge | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = await createClient();

    // Reactivate existing badge if present
    const { data: existing } = await supabase
      .from('provider_badges')
      .select('*')
      .eq('provider_application_id', providerApplicationId)
      .eq('badge_type', badgeType)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('provider_badges')
        .update({ active: true, granted_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (error || !data) return null;
      return data as ProviderBadge;
    }

    const { data, error } = await supabase
      .from('provider_badges')
      .insert({
        provider_application_id: providerApplicationId,
        badge_type: badgeType,
        active: true,
        granted_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (error || !data) return null;
    return data as ProviderBadge;
  } catch {
    return null;
  }
}

export async function revokeBadge(
  providerApplicationId: string,
  badgeType: BadgeType
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('provider_badges')
      .update({ active: false })
      .eq('provider_application_id', providerApplicationId)
      .eq('badge_type', badgeType);

    return !error;
  } catch {
    return false;
  }
}

export async function getActiveBadges(
  providerApplicationId: string
): Promise<ProviderBadge[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('provider_badges')
      .select('*')
      .eq('provider_application_id', providerApplicationId)
      .eq('active', true);

    if (error || !data) return [];
    return data as ProviderBadge[];
  } catch {
    return [];
  }
}
