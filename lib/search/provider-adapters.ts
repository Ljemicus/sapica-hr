import { createAdminClient } from '@/lib/supabase/admin';
import type { UnifiedProvider } from '@/app/pretraga/types';
import type { GroomingServiceType, ServiceType, Trainer } from '@/lib/types';
import { isSupabaseConfigured } from '@/lib/db/helpers';

interface ProviderRow {
  id: string;
  profile_id: string | null;
  provider_kind: 'sitter' | 'groomer' | 'trainer' | string;
  display_name: string | null;
  bio: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  verified_status: string | null;
  public_status: string | null;
  response_time_label: string | null;
  rating_avg: number | null;
  review_count: number | null;
}

interface ProviderServiceRow {
  provider_id: string;
  service_code: string;
  base_price: number | null;
  is_active: boolean | null;
}

interface ProviderSitterSettingsRow {
  provider_id: string;
  services: string[] | null;
  superhost: boolean | null;
}

interface ProviderGroomerSettingsRow {
  provider_id: string;
  specialization: string | null;
}

interface ProviderTrainerSettingsRow {
  provider_id: string;
  specializations: string[] | null;
  certified: boolean | null;
}

const SITTER_SERVICE_MAP: Record<string, ServiceType> = {
  boarding: 'boarding',
  walking: 'walking',
  house_sitting: 'house-sitting',
  housesitting: 'house-sitting',
  drop_in: 'drop-in',
  daycare: 'daycare',
};

const GROOMER_SERVICE_MAP: Record<string, GroomingServiceType> = {
  grooming_haircut: 'sisanje',
  grooming_bath: 'kupanje',
  grooming_trimming: 'trimanje',
  grooming_nails: 'nokti',
  grooming_brushing: 'cetkanje',
};

const TRAINER_SPECIALIZATION_MAP: Record<string, Trainer['specializations'][number]> = {
  obedience: 'osnovna',
  basic: 'osnovna',
  advanced: 'napredna',
  agility: 'agility',
  behaviour: 'ponasanje',
  behavior: 'ponasanje',
  puppies: 'stenci',
  puppy: 'stenci',
};

function lowestPrice(services: ProviderServiceRow[], providerId: string) {
  const prices = services
    .filter((service) => service.provider_id === providerId && service.is_active !== false && typeof service.base_price === 'number')
    .map((service) => Number(service.base_price));
  return prices.length ? Math.min(...prices) : undefined;
}

export async function getUnifiedProvidersFromProviderModel(): Promise<UnifiedProvider[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  
  // Trust gate: only verified and listed providers. Do not query optional demo/settings
  // columns here because older Supabase schemas do not have them yet.
  const [providersRes, servicesRes, sitterSettingsRes, groomerSettingsRes, trainerSettingsRes] = await Promise.all([
    supabase
      .from('providers')
      .select('id, profile_id, provider_kind, display_name, bio, city, lat, lng, verified_status, public_status, response_time_label, rating_avg, review_count')
      .eq('public_status', 'listed')
      .eq('verified_status', 'verified'),
    supabase.from('provider_services').select('provider_id, service_code, base_price, is_active').eq('is_active', true),
    supabase.from('provider_sitter_settings').select('*'),
    supabase.from('provider_groomer_settings').select('provider_id, specialization'),
    supabase.from('provider_trainer_settings').select('provider_id, specializations, certified'),
  ]);

  const providers = (providersRes.data || []) as ProviderRow[];
  const services = (servicesRes.data || []) as ProviderServiceRow[];
  const sitterSettings = new Map(((sitterSettingsRes.data || []) as ProviderSitterSettingsRow[]).map((row) => [row.provider_id, row]));
  const groomerSettings = new Map(((groomerSettingsRes.data || []) as ProviderGroomerSettingsRow[]).map((row) => [row.provider_id, row]));
  const trainerSettings = new Map(((trainerSettingsRes.data || []) as ProviderTrainerSettingsRow[]).map((row) => [row.provider_id, row]));

  const result: UnifiedProvider[] = [];

  for (const provider of providers) {
    if (provider.provider_kind === 'sitter') {
      const settings = sitterSettings.get(provider.id);
      const mappedServices = (settings?.services || [])
        .map((value) => SITTER_SERVICE_MAP[String(value).toLowerCase()])
        .filter(Boolean);

      result.push({
        id: provider.id,
        name: provider.display_name || 'Sitter',
        avatarUrl: null,
        city: provider.city,
        bio: provider.bio,
        rating: Number(provider.rating_avg || 0),
        reviews: Number(provider.review_count || 0),
        verified: provider.verified_status === 'verified',
        superhost: Boolean(settings?.superhost),
        category: 'sitter',
        services: mappedServices,
        lowestPrice: lowestPrice(services, provider.id),
        responseTime: provider.response_time_label,
        profileUrl: `/sitter/${provider.id}`,
        locationLat: provider.lat,
        locationLng: provider.lng,
      });
      continue;
    }

    if (provider.provider_kind === 'groomer') {
      const serviceList = services
        .filter((service) => service.provider_id === provider.id)
        .map((service) => GROOMER_SERVICE_MAP[String(service.service_code).toLowerCase()])
        .filter(Boolean);

      result.push({
        id: provider.id,
        name: provider.display_name || 'Groomer',
        avatarUrl: null,
        city: provider.city,
        bio: provider.bio,
        rating: Number(provider.rating_avg || 0),
        reviews: Number(provider.review_count || 0),
        verified: provider.verified_status === 'verified',
        superhost: false,
        category: 'grooming',
        services: Array.from(new Set(serviceList)),
        lowestPrice: lowestPrice(services, provider.id),
        responseTime: provider.response_time_label,
        profileUrl: `/groomer/${provider.id}`,
        locationLat: provider.lat,
        locationLng: provider.lng,
      });
      continue;
    }

    if (provider.provider_kind === 'trainer') {
      const settings = trainerSettings.get(provider.id);
      const specializations = (settings?.specializations || [])
        .map((value) => TRAINER_SPECIALIZATION_MAP[String(value).toLowerCase()])
        .filter(Boolean);

      result.push({
        id: provider.id,
        name: provider.display_name || 'Trener',
        avatarUrl: null,
        city: provider.city,
        bio: provider.bio,
        rating: Number(provider.rating_avg || 0),
        reviews: Number(provider.review_count || 0),
        verified: provider.verified_status === 'verified',
        superhost: false,
        category: 'dresura',
        services: Array.from(new Set(specializations)),
        lowestPrice: lowestPrice(services, provider.id),
        responseTime: provider.response_time_label,
        profileUrl: `/trener/${provider.id}`,
        locationLat: provider.lat,
        locationLng: provider.lng,
        certified: Boolean(settings?.certified),
        certificates: settings?.certified ? ['Verified trainer'] : [],
      });
    }
  }

  return result;
}
