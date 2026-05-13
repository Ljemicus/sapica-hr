import { unstable_noStore as noStore } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import { getServiceListingsFromTableWhenEnabled } from '@/lib/petpark/service-listings/read';
import { mapProviderServiceFallback } from '@/lib/petpark/service-listings/mappers';
import type { PublicServiceListing, ServiceListingProviderRow, ServiceListingProviderServiceRow } from '@/lib/petpark/service-listings/types';

export type MarketplaceTone = PublicServiceListing['tone'];
export type MarketplaceServiceListing = PublicServiceListing;

type ProviderServiceFallbackRow = ServiceListingProviderServiceRow & {
  provider?: ServiceListingProviderRow | ServiceListingProviderRow[] | null;
};

async function getServiceListingsFromProviderServices(): Promise<MarketplaceServiceListing[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('provider_services')
    .select(`
      id,
      provider_id,
      service_code,
      base_price,
      currency,
      duration_minutes,
      is_active,
      provider:providers(id, provider_kind, display_name, bio, city, address, verified_status, public_status, response_time_label, rating_avg, review_count)
    `)
    .eq('is_active', true)
    .limit(80);

  if (error) throw error;
  return ((data || []) as ProviderServiceFallbackRow[]).map(mapProviderServiceFallback).filter((item): item is MarketplaceServiceListing => Boolean(item));
}

export async function getPublicServiceListings(): Promise<MarketplaceServiceListing[]> {
  noStore();
  if (!isSupabaseConfigured()) return [];

  try {
    const { listings } = await getServiceListingsFromTableWhenEnabled();
    if (listings.length > 0) return listings;
  } catch {
    // Reads are gated and service_listings is still unapplied. Fall back to current provider_services model.
  }

  try {
    return await getServiceListingsFromProviderServices();
  } catch {
    return [];
  }
}

export async function getPublicServiceListingBySlug(slug: string): Promise<MarketplaceServiceListing | null> {
  const listings = await getPublicServiceListings();
  return listings.find((listing) => listing.slug === slug) || null;
}
