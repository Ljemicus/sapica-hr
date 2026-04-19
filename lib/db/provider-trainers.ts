import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseConfigured } from './helpers';
import type { Trainer, TrainingProgram } from '@/lib/types';

interface ProviderTrainerSettingsRow {
  provider_id: string;
  specializations: string[] | null;
  certified: boolean | null;
  training_location: string | null;
}

interface ProviderRow {
  id: string;
  profile_id: string | null;
  provider_kind: string;
  display_name: string | null;
  bio: string | null;
  city: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  phone: string | null;
  email: string | null;
  experience_years: number | null;
  verified_status: string | null;
  public_status: string | null;
  response_time_label: string | null;
  rating_avg: number | null;
  review_count: number | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  city: string | null;
  locale: string | null;
  status: string | null;
  onboarding_state: string | null;
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
  id: string;
  provider_id: string;
  service_code: string | null;
  starts_at: string;
  ends_at: string;
  timezone: string | null;
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

interface ProviderTrainerReview {
  id: string;
  trainer_id: string;
  author_name: string;
  author_initial: string;
  rating: number;
  comment: string;
  created_at: string;
}

const TRAINER_SERVICE_LABELS: Record<string, { name: string; type: TrainingProgram['type'] }> = {
  training_basic: { name: 'Osnovna poslušnost', type: 'osnovna' },
  training_advanced: { name: 'Napredni trening', type: 'napredna' },
  training_agility: { name: 'Agility', type: 'agility' },
  training_behaviour: { name: 'Korekcija ponašanja', type: 'ponasanje' },
  training_puppies: { name: 'Škola za štence', type: 'stenci' },
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

function mapTrainerSpecializations(values: string[] | null | undefined): Trainer['specializations'] {
  const mapped = (values || [])
    .map((value) => TRAINER_SPECIALIZATION_MAP[String(value).toLowerCase()])
    .filter((value): value is Trainer['specializations'][number] => Boolean(value));

  return Array.from(new Set(mapped));
}

function toTrainer(provider: ProviderRow, profile: ProfileRow | null, settings: ProviderTrainerSettingsRow | null, services: ProviderServiceRow[]): Trainer {
  const activePrices = services
    .filter((service) => service.is_active !== false && typeof service.base_price === 'number')
    .map((service) => Number(service.base_price));

  const specializations = mapTrainerSpecializations(settings?.specializations);

  return {
    id: provider.id,
    name: provider.display_name || profile?.display_name || 'Trener',
    city: provider.city || profile?.city || 'Hrvatska',
    specializations: specializations.length > 0 ? specializations : ['osnovna'],
    price_per_hour: activePrices.length > 0 ? Math.min(...activePrices) : 0,
    certificates: settings?.certified ? ['Verified trainer'] : [],
    rating: Number(provider.rating_avg || 0),
    review_count: Number(provider.review_count || 0),
    bio: provider.bio || '',
    certified: Boolean(settings?.certified),
    user_id: provider.profile_id || undefined,
    phone: provider.phone || profile?.phone || undefined,
    email: provider.email || profile?.email || undefined,
    address: provider.address || undefined,
  };
}

export async function getProviderTrainerById(providerId: string): Promise<Trainer | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const { data: provider, error } = await supabase
    .from('providers')
    .select('*')
    .eq('id', providerId)
    .eq('provider_kind', 'trainer')
    .eq('public_status', 'listed')
    .maybeSingle();

  if (error || !provider) return null;

  const [{ data: profile }, { data: settings }, { data: services }] = await Promise.all([
    provider.profile_id
      ? supabase.from('profiles').select('*').eq('id', provider.profile_id).maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from('provider_trainer_settings').select('*').eq('provider_id', provider.id).maybeSingle(),
    supabase.from('provider_services').select('*').eq('provider_id', provider.id).eq('is_active', true),
  ]);

  return toTrainer(provider as ProviderRow, (profile as ProfileRow | null) ?? null, (settings as ProviderTrainerSettingsRow | null) ?? null, (services as ProviderServiceRow[]) ?? []);
}

export async function getProviderTrainerPrograms(providerId: string): Promise<TrainingProgram[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('provider_services')
    .select('*')
    .eq('provider_id', providerId)
    .eq('is_active', true);

  if (error || !data) return [];

  return (data as ProviderServiceRow[]).map((service) => {
    const mapped = TRAINER_SERVICE_LABELS[service.service_code] || {
      name: service.service_code,
      type: 'osnovna' as const,
    };

    return {
      id: service.id,
      trainer_id: providerId,
      name: mapped.name,
      type: mapped.type,
      duration_weeks: 1,
      sessions: 1,
      price: Number(service.base_price || 0),
      description: service.duration_minutes
        ? `${mapped.name} (${service.duration_minutes} min)`
        : mapped.name,
    };
  });
}

export async function getProviderTrainerReviews(providerId: string): Promise<ProviderTrainerReview[]> {
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
      trainer_id: providerId,
      author_name: authorName,
      author_initial: authorName.charAt(0).toUpperCase(),
      rating: Number(review.rating || 0),
      comment: review.comment || '',
      created_at: review.created_at,
    };
  });
}

export async function getProviderTrainerAvailableDates(providerId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('availability_slots')
    .select('*')
    .eq('provider_id', providerId)
    .eq('status', 'available')
    .order('starts_at', { ascending: true });

  if (error || !data) return [];

  return Array.from(new Set((data as AvailabilitySlotRow[]).map((slot) => slot.starts_at.slice(0, 10))));
}
