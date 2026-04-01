import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { deleteAdoptionListing, getAdoptionListing, getPublisherProfile, updateAdoptionListing } from '@/lib/db';
import { adoptionListingSchema, adoptionPublishRules } from '@/lib/validations';
import type { AdoptionListing } from '@/lib/types';

interface ApiError {
  error: string;
  details?: Record<string, string[]>;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getAdoptionListing(id);
  if (!listing) {
    return NextResponse.json<ApiError>({ error: 'Oglas nije pronađen' }, { status: 404 });
  }
  return NextResponse.json<AdoptionListing>(listing);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json<ApiError>({ error: 'Neautorizirano' }, { status: 401 });

  const publisher = await getPublisherProfile(user.id);
  if (!publisher) return NextResponse.json<ApiError>({ error: 'Publisher profil nije pronađen' }, { status: 404 });

  const { id } = await params;
  const listing = await getAdoptionListing(id);
  if (!listing) return NextResponse.json<ApiError>({ error: 'Oglas nije pronađen' }, { status: 404 });
  if (listing.publisher_id !== publisher.id) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json<ApiError>({ error: 'Neispravan zahtjev' }, { status: 400 });
  }

  // Merge existing listing fields with incoming updates for validation
  const merged = {
    name: listing.name,
    species: listing.species,
    breed: listing.breed,
    age_months: listing.age_months,
    gender: listing.gender,
    size: listing.size,
    weight_kg: listing.weight_kg,
    color: listing.color,
    sterilized: listing.sterilized,
    vaccinated: listing.vaccinated,
    microchipped: listing.microchipped,
    good_with_kids: listing.good_with_kids,
    good_with_pets: listing.good_with_pets,
    description: listing.description,
    personality: listing.personality,
    special_needs: listing.special_needs,
    city: listing.city,
    images: listing.images,
    contact_phone: listing.contact_phone,
    contact_email: listing.contact_email,
    is_urgent: listing.is_urgent,
    ...body,
  };

  // If the result would be active, validate against publish rules
  const resultStatus = body.status ?? listing.status;
  const schema = resultStatus === 'active' ? adoptionPublishRules : adoptionListingSchema;
  const parsed = schema.safeParse(merged);

  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: 'Validacijska greška', details: parsed.error.flatten().fieldErrors as Record<string, string[]> },
      { status: 400 },
    );
  }

  const updated = await updateAdoptionListing(id, body);
  if (!updated) return NextResponse.json<ApiError>({ error: 'Greška pri ažuriranju oglasa' }, { status: 500 });

  return NextResponse.json<AdoptionListing>(updated);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json<ApiError>({ error: 'Neautorizirano' }, { status: 401 });

  const publisher = await getPublisherProfile(user.id);
  if (!publisher) return NextResponse.json<ApiError>({ error: 'Publisher profil nije pronađen' }, { status: 404 });

  const { id } = await params;
  const listing = await getAdoptionListing(id);
  if (!listing) return NextResponse.json<ApiError>({ error: 'Oglas nije pronađen' }, { status: 404 });
  if (listing.publisher_id !== publisher.id) {
    return NextResponse.json<ApiError>({ error: 'Forbidden' }, { status: 403 });
  }

  const ok = await deleteAdoptionListing(id);
  if (!ok) return NextResponse.json<ApiError>({ error: 'Greška pri brisanju oglasa' }, { status: 500 });

  return NextResponse.json({ success: true });
}
