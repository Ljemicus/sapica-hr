import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from './helpers';
import type { Booking, OwnerHistoryBooking, WalkSelectorBooking, UserRole } from '@/lib/types';

type BookingFields = 'full' | 'walk-selector' | 'owner-history';

type MinimalPet = {
  id: string;
  owner_profile_id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string | null;
  age: number | null;
  weight: number | null;
  special_needs: string | null;
  photo_url: string | null;
  created_at: string;
};

type MinimalProfile = {
  id: string;
  email?: string;
  display_name: string | null;
  avatar_url: string | null;
  phone?: string | null;
  city?: string | null;
  created_at?: string;
};

type ProviderRow = {
  id: string;
  profile_id: string;
  provider_kind: string;
  display_name: string | null;
  city: string | null;
  profile?: MinimalProfile | null;
};

type BookingBaseRow = {
  id: string;
  owner_profile_id: string;
  provider_id: string;
  pet_id: string;
  provider_kind: string;
  primary_service_code: string;
  starts_at: string;
  ends_at: string;
  status: Booking['status'];
  payment_status: Booking['payment_status'];
  currency: string;
  subtotal_amount: number;
  platform_fee_amount: number;
  provider_amount?: number | null;
  platform_fee?: number | null;
  total_amount: number;
  owner_note: string | null;
  provider_note: string | null;
  created_at: string;
  owner?: MinimalProfile | null;
  provider?: ProviderRow | null;
  pet?: MinimalPet | null;
};

type WalkSelectorRow = BookingBaseRow & { pet?: MinimalPet | null };
type OwnerHistoryRow = BookingBaseRow & { provider?: ProviderRow | null; pet?: MinimalPet | null };

function normalizeServiceType(serviceCode: string): Booking['service_type'] {
  switch (serviceCode) {
    case 'house_sitting':
      return 'house-sitting';
    case 'drop_in':
      return 'drop-in';
    case 'boarding':
    case 'walking':
    case 'daycare':
      return serviceCode;
    default:
      return 'boarding';
  }
}

function normalizeRole(providerKind: string): UserRole {
  return providerKind === 'trainer' || providerKind === 'groomer' || providerKind === 'mixed'
    ? 'sitter'
    : 'sitter';
}

function toUser(profile: MinimalProfile | null | undefined, fallback: { id: string; name: string | null; role: UserRole }): Booking['owner'] {
  if (!profile) {
    return {
      id: fallback.id,
      email: '',
      name: fallback.name || '',
      role: fallback.role,
      avatar_url: null,
      phone: null,
      city: null,
      created_at: '',
    };
  }

  return {
    id: profile.id,
    email: profile.email || '',
    name: profile.display_name || fallback.name || '',
    role: fallback.role,
    avatar_url: profile.avatar_url || null,
    phone: profile.phone || null,
    city: profile.city || null,
    created_at: profile.created_at || '',
  };
}

function toPet(rowPet: MinimalPet | null | undefined): Booking['pet'] | undefined {
  if (!rowPet) return undefined;

  return {
    id: rowPet.id,
    owner_id: rowPet.owner_profile_id,
    name: rowPet.name,
    species: rowPet.species,
    breed: rowPet.breed,
    age: rowPet.age,
    weight: rowPet.weight,
    special_needs: rowPet.special_needs,
    photo_url: rowPet.photo_url,
    created_at: rowPet.created_at,
  };
}

function mapBooking(row: BookingBaseRow): Booking {
  const providerProfile = row.provider?.profile;
  return {
    id: row.id,
    owner_id: row.owner_profile_id,
    sitter_id: row.provider?.profile_id || row.provider_id,
    pet_id: row.pet_id,
    service_type: normalizeServiceType(row.primary_service_code),
    start_date: row.starts_at,
    end_date: row.ends_at,
    status: row.status,
    total_price: Number(row.total_amount),
    platform_fee: Number(row.platform_fee_amount || 0),
    payment_status: row.payment_status,
    currency: row.currency,
    note: row.owner_note ?? row.provider_note ?? null,
    created_at: row.created_at,
    owner: toUser(row.owner, { id: row.owner_profile_id, name: null, role: 'owner' }),
    sitter: toUser(providerProfile, {
      id: row.provider?.profile_id || row.provider_id,
      name: row.provider?.display_name || null,
      role: normalizeRole(row.provider_kind),
    }),
    pet: toPet(row.pet),
  };
}

function toWalkSelectorBooking(row: WalkSelectorRow): WalkSelectorBooking {
  const booking = mapBooking(row);
  return {
    ...booking,
    pet: row.pet
      ? {
          id: row.pet.id,
          owner_id: row.pet.owner_profile_id,
          name: row.pet.name,
          species: row.pet.species,
          breed: null,
          age: null,
          weight: null,
          special_needs: null,
          photo_url: null,
          created_at: row.pet.created_at,
        }
      : undefined,
  };
}

function toOwnerHistoryBooking(row: OwnerHistoryRow): OwnerHistoryBooking {
  const booking = mapBooking(row);
  return {
    ...booking,
    sitter: booking.sitter
      ? {
          id: booking.sitter.id,
          email: '',
          name: booking.sitter.name,
          role: 'sitter',
          avatar_url: booking.sitter.avatar_url,
          phone: null,
          city: null,
          created_at: '',
        }
      : undefined,
    pet: row.pet
      ? {
          id: row.pet.id,
          owner_id: row.pet.owner_profile_id,
          name: row.pet.name,
          species: row.pet.species,
          breed: null,
          age: null,
          weight: null,
          special_needs: null,
          photo_url: null,
          created_at: row.pet.created_at,
        }
      : undefined,
  };
}

export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields: 'owner-history'
): Promise<OwnerHistoryBooking[]>;
export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields: 'walk-selector'
): Promise<WalkSelectorBooking[]>;
export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields?: Exclude<BookingFields, 'owner-history' | 'walk-selector'>
): Promise<Booking[]>;
export async function getBookings(
  userId: string,
  role: 'owner' | 'sitter',
  fields: BookingFields = 'full'
): Promise<Booking[] | OwnerHistoryBooking[] | WalkSelectorBooking[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();

    let query = supabase
      .from('bookings')
      .select(`
        id,
        owner_profile_id,
        provider_id,
        pet_id,
        provider_kind,
        primary_service_code,
        starts_at,
        ends_at,
        status,
        payment_status,
        currency,
        subtotal_amount,
        platform_fee_amount,
        provider_amount,
        platform_fee,
        total_amount,
        owner_note,
        provider_note,
        created_at,
        owner:profiles!bookings_owner_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at),
        provider:providers!bookings_provider_id_fkey(id, profile_id, provider_kind, display_name, city, profile:profiles!providers_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at)),
        pet:pets!bookings_pet_id_fkey(id, owner_profile_id, name, species, breed, created_at)
      `)
      .order('created_at', { ascending: false });

    query = role === 'owner'
      ? query.eq('owner_profile_id', userId)
      : query.eq('provider_id', userId);

    const { data, error } = await query;
    if (error || !data) return [];

    const rows = data as unknown as BookingBaseRow[];

    if (fields === 'walk-selector') {
      return rows.map((row) => toWalkSelectorBooking(row as WalkSelectorRow));
    }

    if (fields === 'owner-history') {
      return rows.map((row) => toOwnerHistoryBooking(row as OwnerHistoryRow));
    }

    return rows.map(mapBooking);
  } catch {
    return [];
  }
}

type AllBookingFields = 'full' | 'admin-list';

export async function getAllBookings(_fields: AllBookingFields = 'full'): Promise<Booking[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        owner_profile_id,
        provider_id,
        pet_id,
        provider_kind,
        primary_service_code,
        starts_at,
        ends_at,
        status,
        payment_status,
        currency,
        subtotal_amount,
        platform_fee_amount,
        provider_amount,
        platform_fee,
        total_amount,
        owner_note,
        provider_note,
        created_at,
        owner:profiles!bookings_owner_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at),
        provider:providers!bookings_provider_id_fkey(id, profile_id, provider_kind, display_name, city, profile:profiles!providers_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at)),
        pet:pets!bookings_pet_id_fkey(id, owner_profile_id, name, species, breed, created_at)
      `)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return (data as unknown as BookingBaseRow[]).map(mapBooking);
  } catch {
    return [];
  }
}

export async function getBooking(id: string): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        id,
        owner_profile_id,
        provider_id,
        pet_id,
        provider_kind,
        primary_service_code,
        starts_at,
        ends_at,
        status,
        payment_status,
        currency,
        subtotal_amount,
        platform_fee_amount,
        provider_amount,
        platform_fee,
        total_amount,
        owner_note,
        provider_note,
        created_at,
        owner:profiles!bookings_owner_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at),
        provider:providers!bookings_provider_id_fkey(id, profile_id, provider_kind, display_name, city, profile:profiles!providers_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at)),
        pet:pets!bookings_pet_id_fkey(id, owner_profile_id, name, species, breed, created_at)
      `)
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapBooking(data as unknown as BookingBaseRow);
  } catch {
    return null;
  }
}

type CreateBookingInput = {
  owner_profile_id: string;
  provider_id: string;
  pet_id: string;
  provider_kind: string;
  primary_service_code: string;
  starts_at: string;
  ends_at: string;
  total_amount: number;
  platform_fee_amount?: number;
  provider_amount?: number;
  platform_fee?: number;
  payment_status?: Booking['payment_status'];
  currency?: string;
  owner_note?: string | null;
  status?: Booking['status'];
};

export async function createBooking(bookingData: CreateBookingInput): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const providerAmount = bookingData.provider_amount ?? bookingData.total_amount;
    const platformFee = bookingData.platform_fee ?? bookingData.platform_fee_amount ?? 0;
    const totalAmount = providerAmount + platformFee;
    const payload = {
      ...bookingData,
      subtotal_amount: providerAmount,
      provider_amount: providerAmount,
      platform_fee: platformFee,
      platform_fee_amount: platformFee,
      total_amount: totalAmount,
      owner_note: bookingData.owner_note ?? null,
      payment_status: bookingData.payment_status ?? 'unpaid',
      currency: bookingData.currency ?? 'EUR',
      status: bookingData.status ?? 'pending',
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(payload)
      .select(`
        id,
        owner_profile_id,
        provider_id,
        pet_id,
        provider_kind,
        primary_service_code,
        starts_at,
        ends_at,
        status,
        payment_status,
        currency,
        subtotal_amount,
        platform_fee_amount,
        provider_amount,
        platform_fee,
        total_amount,
        owner_note,
        provider_note,
        created_at,
        owner:profiles!bookings_owner_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at),
        provider:providers!bookings_provider_id_fkey(id, profile_id, provider_kind, display_name, city, profile:profiles!providers_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at)),
        pet:pets!bookings_pet_id_fkey(id, owner_profile_id, name, species, breed, created_at)
      `)
      .single();

    if (error || !data) return null;
    return mapBooking(data as unknown as BookingBaseRow);
  } catch {
    return null;
  }
}

export async function updateBookingStatus(
  id: string,
  status: Booking['status']
): Promise<Booking | null> {
  return updateBooking(id, { status });
}

type UpdateBookingInput = Partial<{
  status: Booking['status'];
  payment_status: Booking['payment_status'];
  total_amount: number;
  platform_fee_amount: number;
  provider_amount: number;
  platform_fee: number;
  owner_note: string | null;
  provider_note: string | null;
}>;

export async function updateBooking(
  id: string,
  updates: UpdateBookingInput
): Promise<Booking | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  try {
    const supabase = await createClient();
    const payload = {
      ...updates,
      ...(typeof updates.total_amount === 'number'
        ? {
            subtotal_amount: updates.provider_amount ?? updates.total_amount,
            provider_amount: updates.provider_amount ?? updates.total_amount,
            platform_fee: updates.platform_fee ?? updates.platform_fee_amount ?? 0,
            total_amount: (updates.provider_amount ?? updates.total_amount) + (updates.platform_fee ?? updates.platform_fee_amount ?? 0),
          }
        : {}),
    };

    const { data, error } = await supabase
      .from('bookings')
      .update(payload)
      .eq('id', id)
      .select(`
        id,
        owner_profile_id,
        provider_id,
        pet_id,
        provider_kind,
        primary_service_code,
        starts_at,
        ends_at,
        status,
        payment_status,
        currency,
        subtotal_amount,
        platform_fee_amount,
        provider_amount,
        platform_fee,
        total_amount,
        owner_note,
        provider_note,
        created_at,
        owner:profiles!bookings_owner_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at),
        provider:providers!bookings_provider_id_fkey(id, profile_id, provider_kind, display_name, city, profile:profiles!providers_profile_id_fkey(id, email, display_name, avatar_url, phone, city, created_at)),
        pet:pets!bookings_pet_id_fkey(id, owner_profile_id, name, species, breed, created_at)
      `)
      .single();

    if (error || !data) return null;
    return mapBooking(data as unknown as BookingBaseRow);
  } catch {
    return null;
  }
}
