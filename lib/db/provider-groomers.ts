import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from './helpers';
import type { Groomer, GroomingServiceType, GroomerSpecialization } from '@/lib/types';

interface ProviderGroomerFilters {
  city?: string;
  service?: GroomingServiceType;
}

interface ProviderRow {
  id: string;
  profile_id: string | null;
  provider_kind: string;
  display_name: string | null;
  bio: string | null;
  city: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  verified_status: string | null;
  public_status: string | null;
  rating_avg: number | null;
  review_count: number | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  phone: string | null;
  city: string | null;
}

interface ProviderGroomerSettingsRow {
  provider_id: string;
  specialization: string | null;
  mobile_service: boolean | null;
  working_hours_json: Record<string, { start: string; end: string }> | null;
}

interface ProviderServiceRow {
  id: string;
  provider_id: string;
  service_code: string;
  base_price: number | null;
  currency: string | null;
  duration_minutes: number | null;
  is_active: boolean | null;
}

interface AvailabilitySlotRow {
  provider_id: string;
  starts_at: string;
  status: string | null;
}

interface ReviewRow {
  id: string;
  provider_id: string;
  reviewer_profile_id: string | null;
  rating: number;
  comment: string | null;
  status: string | null;
  created_at: string;
}

interface ProviderGroomerReview {
  id: string;
  groomer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

const GROOMER_SERVICE_CODE_MAP: Record<string, GroomingServiceType> = {
  grooming_haircut: 'sisanje',
  grooming_bath: 'kupanje',
  grooming_trimming: 'trimanje',
  grooming_nails: 'nokti',
  grooming_brushing: 'cetkanje',
};

const GROOMER_SPECIALIZATION_MAP: Record<string, GroomerSpecialization> = {
  dogs: 'psi',
  cats: 'macke',
  both: 'oba',
  small_dogs_and_basic_grooming: 'psi',
};

function toServices(services: ProviderServiceRow[]): GroomingServiceType[] {
  const mapped = services
    .filter((service) => service.is_active !== false)
    .map((service) => GROOMER_SERVICE_CODE_MAP[String(service.service_code).toLowerCase()])
    .filter((value): value is GroomingServiceType => Boolean(value));

  return Array.from(new Set(mapped));
}

function toPrices(services: ProviderServiceRow[]): Record<GroomingServiceType, number> {
  const prices: Partial<Record<GroomingServiceType, number>> = {};

  for (const service of services) {
    const mapped = GROOMER_SERVICE_CODE_MAP[String(service.service_code).toLowerCase()];
    if (!mapped) continue;
    prices[mapped] = Number(service.base_price || 0);
  }

  return {
    sisanje: prices.sisanje || 0,
    kupanje: prices.kupanje || 0,
    trimanje: prices.trimanje || 0,
    nokti: prices.nokti || 0,
    cetkanje: prices.cetkanje || 0,
  };
}

function toGroomer(
  provider: ProviderRow,
  profile: ProfileRow | null,
  settings: ProviderGroomerSettingsRow | null,
  services: ProviderServiceRow[]
): Groomer {
  const mappedServices = toServices(services);

  return {
    id: provider.id,
    name: provider.display_name || profile?.display_name || 'Groomer',
    city: provider.city || profile?.city || 'Hrvatska',
    services: mappedServices.length > 0 ? mappedServices : ['kupanje'],
    prices: toPrices(services),
    rating: Number(provider.rating_avg || 0),
    review_count: Number(provider.review_count || 0),
    bio: provider.bio || '',
    verified: provider.verified_status === 'verified',
    specialization: GROOMER_SPECIALIZATION_MAP[String(settings?.specialization || '').toLowerCase()] || 'oba',
    user_id: provider.profile_id || undefined,
    phone: provider.phone || profile?.phone || undefined,
    email: provider.email || profile?.email || undefined,
    address: provider.address || undefined,
    working_hours: settings?.working_hours_json || undefined,
  };
}

export async function getProviderGroomers(filters?: ProviderGroomerFilters): Promise<Groomer[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  let query = supabase
    .from('providers')
    .select('*')
    .eq('provider_kind', 'groomer')
    .eq('public_status', 'listed');

  if (filters?.city) {
    query = query.eq('city', filters.city);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const providers = data as ProviderRow[];
  const providerIds = providers.map((provider) => provider.id);
  const profileIds = providers.map((provider) => provider.profile_id).filter(Boolean) as string[];

  const [{ data: profiles }, { data: settings }, { data: services }] = await Promise.all([
    profileIds.length > 0 ? supabase.from('profiles').select('*').in('id', profileIds) : Promise.resolve({ data: [] }),
    providerIds.length > 0 ? supabase.from('provider_groomer_settings').select('*').in('provider_id', providerIds) : Promise.resolve({ data: [] }),
    providerIds.length > 0 ? supabase.from('provider_services').select('*').in('provider_id', providerIds).eq('is_active', true) : Promise.resolve({ data: [] }),
  ]);

  const profileMap = new Map(((profiles as ProfileRow[] | null) || []).map((row) => [row.id, row]));
  const settingsMap = new Map(((settings as ProviderGroomerSettingsRow[] | null) || []).map((row) => [row.provider_id, row]));
  const servicesByProvider = new Map<string, ProviderServiceRow[]>();
  for (const service of ((services as ProviderServiceRow[] | null) || [])) {
    const list = servicesByProvider.get(service.provider_id) || [];
    list.push(service);
    servicesByProvider.set(service.provider_id, list);
  }

  let groomers = providers.map((provider) =>
    toGroomer(
      provider,
      provider.profile_id ? profileMap.get(provider.profile_id) || null : null,
      settingsMap.get(provider.id) || null,
      servicesByProvider.get(provider.id) || []
    )
  );

  if (filters?.service) {
    groomers = groomers.filter((groomer) => groomer.services.includes(filters.service!));
  }

  groomers.sort((a, b) => b.rating - a.rating || b.review_count - a.review_count);
  return groomers;
}

export async function getProviderGroomerById(providerId: string): Promise<Groomer | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const { data: provider, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', providerId)
    .eq('provider_kind', 'groomer')
    .eq('public_status', 'listed')
    .maybeSingle();

  if (error || !provider) return null;

  const [{ data: profile }, { data: settings }, { data: services }] = await Promise.all([
    provider.profile_id
      ? supabase.from('profiles').select('*').eq('id', provider.profile_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('provider_groomer_settings').select('*').eq('provider_id', provider.id).maybeSingle(),
    supabase.from('provider_services').select('*').eq('provider_id', provider.id).eq('is_active', true),
  ]);

  return toGroomer(provider as ProviderRow, (profile as ProfileRow | null) ?? null, (settings as ProviderGroomerSettingsRow | null) ?? null, (services as ProviderServiceRow[]) ?? []);
}

export async function getProviderGroomerReviews(providerId: string): Promise<ProviderGroomerReview[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', providerId)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error || !data) return [];

  const reviews = data as ReviewRow[];
  const reviewerIds = Array.from(new Set(reviews.map((review) => review.reviewer_profile_id).filter(Boolean))) as string[];
  const reviewerMap = new Map<string, ProfileRow>();

  if (reviewerIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('*').in('id', reviewerIds);
    for (const profile of (profiles as ProfileRow[] | null) || []) {
      reviewerMap.set(profile.id, profile);
    }
  }

  return reviews.map((review) => {
    const reviewer = review.reviewer_profile_id ? reviewerMap.get(review.reviewer_profile_id) : null;
    const authorName = reviewer?.display_name || 'PetPark korisnik';
    return {
      id: review.id,
      groomer_id: providerId,
      author_name: authorName,
      author_initial: authorName.charAt(0).toUpperCase(),
      rating: Number(review.rating || 0),
      comment: review.comment || '',
      created_at: review.created_at,
    };
  });
}

export async function getProviderGroomerAvailableDates(providerId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set();

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('availability_slots')
    .select('provider_id, starts_at, status')
    .eq('provider_id', providerId)
    .eq('status', 'available')
    .order('starts_at', { ascending: true });

  if (error || !data) return new Set();

  return new Set((data as AvailabilitySlotRow[]).map((slot) => slot.starts_at.slice(0, 10)));
}
