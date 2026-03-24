import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroomerById, getGroomerReviews } from '@/lib/mock-data';
import { GroomerProfile } from './groomer-profile';

interface GroomerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GroomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const groomer = getGroomerById(id);
  return {
    title: groomer ? `${groomer.name} — Grooming u ${groomer.city}` : 'Groomer profil',
    description: groomer ? `Pogledajte profil groomera ${groomer.name}. Zakažite termin za uljepšavanje ljubimca.` : '',
  };
}

function generateMockAvailability(): boolean[] {
  const seed = Date.now();
  return Array.from({ length: 14 }, (_, i) => {
    const hash = ((seed + i * 2654435761) >>> 0) % 100;
    return hash < 65;
  });
}

export default async function GroomerPage({ params }: GroomerPageProps) {
  const { id } = await params;
  const groomer = getGroomerById(id);
  if (!groomer) return notFound();

  const reviews = getGroomerReviews(id);
  const availability = generateMockAvailability();

  return <GroomerProfile groomer={groomer} reviews={reviews} availability={availability} />;
}
