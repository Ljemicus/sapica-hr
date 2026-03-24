import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLostPetById } from '@/lib/mock-data';
import { LostPetDetailContent } from './lost-pet-detail-content';

interface LostPetPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: LostPetPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = getLostPetById(id);

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
      title: `${title} — Šapica`,
      description,
      type: 'article',
      images: [
        {
          url: pet.image_url,
          width: 1200,
          height: 630,
          alt: `${pet.status === 'lost' ? 'Izgubljen' : 'Pronađen'}: ${pet.name}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [pet.image_url],
    },
  };
}

export default async function LostPetDetailPage({ params }: LostPetPageProps) {
  const { id } = await params;
  const pet = getLostPetById(id);

  if (!pet) return notFound();

  return <LostPetDetailContent pet={pet} />;
}
