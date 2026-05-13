import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { serviceListingReadsGuard } from './guards';

type OwnedServiceListingRow = {
  title: string;
  display_category: string | null;
  status: string | null;
  updated_at: string | null;
  provider_service_id: string | null;
  provider_services?: {
    base_price: number | null;
    currency: string | null;
    service_code: string | null;
  } | { base_price: number | null; currency: string | null; service_code: string | null }[] | null;
};

export type OwnedServiceListingSummary = {
  title: string;
  category: 'Čuvanje' | 'Grooming' | 'Trening';
  price: string;
  bookings: number;
  rating: string;
  revenue: string;
  status: 'active' | 'draft' | 'paused';
  updated: string;
};

function categoryLabel(value: string | null): OwnedServiceListingSummary['category'] {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('groom')) return 'Grooming';
  if (normalized.includes('tren') || normalized.includes('train')) return 'Trening';
  return 'Čuvanje';
}

function statusLabel(value: string | null): OwnedServiceListingSummary['status'] {
  if (value === 'listed') return 'active';
  if (value === 'paused' || value === 'archived') return 'paused';
  return 'draft';
}

function relatedProviderService(row: OwnedServiceListingRow) {
  return Array.isArray(row.provider_services) ? row.provider_services[0] : row.provider_services;
}

function priceLabel(row: OwnedServiceListingRow) {
  const service = relatedProviderService(row);
  const price = service?.base_price;
  const currency = service?.currency || 'EUR';
  if (typeof price !== 'number') return 'Cijena iz postojeće usluge';
  const amount = new Intl.NumberFormat('hr-HR', { maximumFractionDigits: 0 }).format(price);
  const symbol = currency === 'EUR' ? '€' : currency;
  return `${amount} ${symbol}`;
}

function updatedLabel(value: string | null) {
  if (!value) return 'nacrt';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'nacrt';
  return date.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export async function getOwnedServiceListingSummaries(): Promise<OwnedServiceListingSummary[]> {
  const guard = serviceListingReadsGuard();
  if (!guard.enabled) return [];

  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (userError || !userId) return [];

    const admin = createAdminClient();
    const { data: providers, error: providersError } = await admin
      .from('providers')
      .select('id')
      .eq('profile_id', userId);

    if (providersError || !providers?.length) return [];

    const providerIds = providers.map((provider) => provider.id);
    const { data, error } = await admin
      .from('service_listings')
      .select('title, display_category, status, updated_at, provider_service_id, provider_services(base_price, currency, service_code)')
      .in('provider_id', providerIds)
      .order('updated_at', { ascending: false });

    if (error || !data) return [];

    return (data as unknown as OwnedServiceListingRow[]).map((row) => {
      const service = relatedProviderService(row);

      return {
      title: row.title,
      category: categoryLabel(row.display_category || service?.service_code || null),
      price: priceLabel(row),
      bookings: 0,
      rating: row.status === 'listed' ? 'Novo' : 'Nacrt',
      revenue: '0 €',
      status: statusLabel(row.status),
      updated: updatedLabel(row.updated_at),
    };
    });
  } catch {
    return [];
  }
}
