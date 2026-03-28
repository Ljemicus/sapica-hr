import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LostPetDetailContent } from './lost-pet-detail-content';
import type { LostPet } from '@/lib/types';

interface LostPetPageProps {
  params: Promise<{ id: string }>;
}

async function getLostPetFromDb(id: string): Promise<LostPet | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lost_pets')
    .select('*, lost_pet_sightings(*)')
    .eq('id', id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    name: data.name,
    species: data.species,
    breed: data.breed || '',
    color: data.color,
    sex: data.gender || 'muško',
    image_url: (data.images || [])[0] || '/images/placeholder-pet.jpg',
    gallery: data.images || [],
    city: data.last_seen_city,
    neighborhood: data.last_seen_location || '',
    location_lat: Number(data.lat) || 45.815,
    location_lng: Number(data.lng) || 15.982,
    date_lost: data.last_seen_date,
    status: data.status,
    description: data.description || '',
    special_marks: data.special_marks || '',
    has_microchip: data.has_microchip || false,
    has_collar: data.has_collar || false,
    contact_name: data.contact_name || '',
    contact_phone: data.contact_phone || '',
    contact_email: data.contact_email || '',
    share_count: data.share_count || 0,
    updates: [],
    sightings: (data.lost_pet_sightings || []).map((s: Record<string, unknown>) => ({
      id: s.id as string,
      date: s.created_at as string,
      location: s.location as string,
      description: (s.description as string) || '',
    })),
    created_at: data.created_at,
  };
}

export async function generateMetadata({ params }: LostPetPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = await getLostPetFromDb(id);

  if (!pet) {
    return { title: 'Ljubimac nije pronađen' };
  }

  const title = pet.status === 'lost'
    ? `IZGUBLJEN: ${pet.name} u ${pet.city}`
    : `PRONAĐEN: ${pet.name} u ${pet.city}`;

  const description = `${pet.breed}, ${pet.color}. ${pet.neighborhood}, ${pet.city}. ${pet.description.slice(0, 120)}...`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} — PetPark`,
      description,
      type: 'article',
      images: pet.image_url ? [
        {
          url: pet.image_url,
          width: 1200,
          height: 630,
          alt: `${pet.status === 'lost' ? 'Izgubljen' : 'Pronađen'}: ${pet.name}`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: pet.image_url ? [pet.image_url] : [],
    },
  };
}

export default async function LostPetDetailPage({ params }: LostPetPageProps) {
  const { id } = await params;
  const pet = await getLostPetFromDb(id);

  if (!pet) return notFound();

  return <LostPetDetailContent pet={pet} />;
}
