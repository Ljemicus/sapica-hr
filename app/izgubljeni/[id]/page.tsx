import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { LostPetDetailContent } from './lost-pet-detail-content';
import type { LostPet } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface LostPetPageProps {
  params: Promise<{ id: string }>;
}

async function getLostPetFromDb(id: string): Promise<LostPet | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('lost_pets')
    .select('*')
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
    sex: data.sex || 'muško',
    image_url: data.image_url || '/images/placeholder-pet.jpg',
    gallery: data.gallery || [],
    city: data.city,
    neighborhood: data.neighborhood || '',
    location_lat: Number(data.location_lat) || 45.815,
    location_lng: Number(data.location_lng) || 15.982,
    date_lost: data.date_lost,
    status: data.status,
    description: data.description || '',
    special_marks: data.special_marks || '',
    has_microchip: data.has_microchip || false,
    has_collar: data.has_collar || false,
    contact_name: data.contact_name || '',
    contact_phone: data.contact_phone || '',
    contact_email: data.contact_email || '',
    share_count: data.share_count || 0,
    updates: data.updates || [],
    sightings: data.sightings || [],
    created_at: data.created_at,
  };
}

export async function generateMetadata({ params }: LostPetPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = await getLostPetFromDb(id);

  if (!pet) {
    notFound();
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
    alternates: {
      canonical: `${BASE_URL}/izgubljeni/${id}`,
    },
  };
}

export default async function LostPetDetailPage({ params }: LostPetPageProps) {
  const { id } = await params;
  const pet = await getLostPetFromDb(id);

  if (!pet) return notFound();

  return <LostPetDetailContent pet={pet} />;
}
