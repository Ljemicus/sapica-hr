import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { isServiceListingsUnavailableError, serviceListingReadsGuard } from './guards';
import { mapServiceListingRow } from './mappers';
import type { PublicServiceListing, ServiceListingRow } from './types';

export async function getServiceListingsFromTableWhenEnabled(): Promise<{ available: boolean; listings: PublicServiceListing[] }> {
  if (!isSupabaseConfigured()) return { available: false, listings: [] };

  const guard = serviceListingReadsGuard();
  if (!guard.enabled) return { available: false, listings: [] };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('service_listings')
    .select(`
      slug,
      title,
      short_description,
      description,
      category,
      display_category,
      city,
      district,
      service_area,
      included_features,
      house_rules,
      status,
      moderation_status,
      provider_id,
      provider_service_id,
      provider:providers(id, provider_kind, display_name, bio, city, address, verified_status, public_status, response_time_label, rating_avg, review_count),
      provider_service:provider_services(id, provider_id, service_code, base_price, currency, duration_minutes, is_active)
    `)
    .eq('status', 'listed')
    .eq('moderation_status', 'approved')
    .limit(80);

  if (error) {
    if (isServiceListingsUnavailableError(error)) return { available: false, listings: [] };
    throw error;
  }

  return {
    available: true,
    listings: ((data || []) as ServiceListingRow[]).map(mapServiceListingRow).filter((item): item is PublicServiceListing => Boolean(item)),
  };
}
