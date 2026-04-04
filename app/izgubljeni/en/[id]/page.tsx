import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LostPetDetailContent } from '../../[id]/lost-pet-detail-content';
import { getLostPet } from '@/lib/db';
import { shouldIndexLostPet, robotsMeta } from '@/lib/seo/indexability';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';


interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pet = await getLostPet(id);

  if (!pet) {
    notFound();
  }

  const title = pet.status === 'lost'
    ? `LOST: ${pet.name} in ${pet.city}`
    : `FOUND: ${pet.name} in ${pet.city}`;

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
      ...buildLocaleOpenGraph(`/izgubljeni/en/${id}`),
      images: pet.image_url ? [
        {
          url: pet.image_url,
          width: 1200,
          height: 630,
          alt: `${pet.status === 'lost' ? 'Lost' : 'Found'}: ${pet.name}`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: pet.image_url ? [pet.image_url] : [],
    },
    alternates: indexable ? buildLocaleAlternates(`/izgubljeni/en/${id}`) : undefined,
  };
}

export default async function LostPetDetailEnPage({ params }: Props) {
  const { id } = await params;
  const pet = await getLostPet(id);

  if (!pet) {
    notFound();
  }

  return <LostPetDetailContent pet={pet} />;
}
