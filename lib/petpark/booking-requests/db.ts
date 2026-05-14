import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/db/helpers';
import type { BookingRequestInputPayload } from './schema';
import type { BookingRequestRow, OwnedBookingRequestSummary } from './types';

function toDateRange(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return `${startDate} – ${endDate}`;
  return `${start.toLocaleDateString('hr-HR')} – ${end.toLocaleDateString('hr-HR')}`;
}

export async function createBookingRequest(input: BookingRequestInputPayload): Promise<BookingRequestRow | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('booking_requests')
    .insert({
      provider_slug: input.providerSlug,
      provider_name: input.providerName,
      provider_city: input.providerCity,
      provider_district: input.providerDistrict || '',
      service_label: input.serviceLabel,
      price_snapshot: input.priceSnapshot,
      response_time_snapshot: input.responseTimeSnapshot,
      mode: input.mode,
      start_date: input.startDate,
      end_date: input.endDate,
      pet_name: input.petName,
      pet_type: input.petType,
      notes: input.notes || '',
      status: 'pending',
      source: 'web_request_flow',
    })
    .select('*')
    .single();

  if (error || !data) return null;
  return data as BookingRequestRow;
}

export async function getOwnedBookingRequestSummaries(): Promise<OwnedBookingRequestSummary[]> {
  if (!isSupabaseConfigured()) return [];

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
    const { data: listings, error: listingsError } = await admin
      .from('service_listings')
      .select('slug')
      .in('provider_id', providerIds);

    if (listingsError || !listings?.length) return [];

    const slugs = listings.map((listing) => listing.slug).filter(Boolean);
    if (!slugs.length) return [];

    const { data, error } = await admin
      .from('booking_requests')
      .select('*')
      .in('provider_slug', slugs)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];

    return (data as BookingRequestRow[]).map((request) => ({
      id: request.id,
      providerSlug: request.provider_slug,
      serviceLabel: request.service_label,
      petName: request.pet_name,
      petType: request.pet_type,
      dateRange: toDateRange(request.start_date, request.end_date),
      notes: request.notes,
      status: request.status,
      submittedAt: new Date(request.created_at).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    }));
  } catch {
    return [];
  }
}
