import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { LostPetDetailContent } from './lost-pet-detail-content';
import { getLostPet } from '@/lib/db';
import { shouldIndexLostPet, robotsMeta } from '@/lib/seo/indexability';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';


interface LostPetPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LostPetPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = await getLostPet(id);

  if (!pet) {
    notFound();
  }

  const title = pet.status === 'lost'
    ? `IZGUBLJEN: ${pet.name} u ${pet.city}`
    : `PRONAĐEN: ${pet.name} u ${pet.city}`;

  const description = `${pet.breed}, ${pet.color}. ${pet.neighborhood}, ${pet.city}. ${pet.description.slice(0, 120)}...`;

  const indexable = shouldIndexLostPet(pet);

  return {
    title,
    description,
    robots: robotsMeta(indexable),
    openGraph: {
      title: `${title} — PetPark`,
      description,
      type: 'article',
      ...buildLocaleOpenGraph(`/izgubljeni/${id}`),
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
    alternates: indexable ? buildLocaleAlternates(`/izgubljeni/${id}`) : undefined,
  };
}

export default async function LostPetDetailPage({ params }: LostPetPageProps) {
  const { id } = await params;
  const pet = await getLostPet(id);

  if (!pet) {
    notFound();
  }

  // Strip contact fields and legacy JSONB sightings from the client payload.
  // Contact info is fetched on-demand via /api/lost-pets/[id]/contact.
  // Sightings are fetched client-side from /api/lost-pets/[id]/sightings (normalized table).
  const { contact_name: _cn, contact_phone: _cp, contact_email: _ce, sightings: _legacy, ...safePet } = pet;

  return <LostPetDetailContent pet={safePet as typeof pet} />;
}
