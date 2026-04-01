import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { createAdoptionListing, getAdoptionListings, getPublisherProfile } from '@/lib/db';
import { adoptionListingSchema, adoptionPublishRules } from '@/lib/validations';
import type { AdoptionListing, AdoptionListingCard, AdoptionListingStatus } from '@/lib/types';

interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as AdoptionListingStatus | null;
  const city = searchParams.get('city') || undefined;
  const species = (searchParams.get('species') as AdoptionListing['species'] | null) || undefined;
  const urgentOnly = searchParams.get('urgent') === 'true';

  const listings = await getAdoptionListings({
    status: status || 'active',
    city,
    species,
    urgentOnly,
  });

  return NextResponse.json<AdoptionListingCard[]>(listings);
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json<ApiError>({ error: 'Neautorizirano' }, { status: 401 });

  const publisher = await getPublisherProfile(user.id);
  if (!publisher) {
    return NextResponse.json<ApiError>({ error: 'Publisher profil nije pronađen' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json<ApiError>({ error: 'Neispravan zahtjev' }, { status: 400 });
  }

  // Use stricter publish rules when publishing directly, base schema otherwise
  const wantsActive = body.status === 'active';
  const schema = wantsActive ? adoptionPublishRules : adoptionListingSchema;
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: 'Validacijska greška', details: parsed.error.flatten().fieldErrors as Record<string, string[]> },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const listing = await createAdoptionListing({
    publisher_id: publisher.id,
    status: wantsActive ? 'active' : 'draft',
    name: data.name,
    species: data.species,
    breed: data.breed || null,
    age_months: data.age_months ?? null,
    gender: data.gender || null,
    size: data.size || null,
    weight_kg: data.weight_kg ?? null,
    color: data.color || null,
    sterilized: data.sterilized,
    vaccinated: data.vaccinated,
    microchipped: data.microchipped,
    good_with_kids: data.good_with_kids ?? null,
    good_with_pets: data.good_with_pets ?? null,
    description: data.description,
    personality: data.personality || null,
    special_needs: data.special_needs || null,
    city: data.city,
    images: data.images,
    contact_phone: data.contact_phone || publisher.phone || null,
    contact_email: data.contact_email || user.email || null,
    is_urgent: data.is_urgent,
    published_at: wantsActive ? new Date().toISOString() : null,
    expires_at: null,
  });

  if (!listing) {
    return NextResponse.json<ApiError>({ error: 'Greška pri kreiranju oglasa' }, { status: 500 });
  }

  return NextResponse.json<AdoptionListing>(listing, { status: 201 });
}
