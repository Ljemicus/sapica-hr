import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroomer, getGroomerReviews } from '@/lib/db';
import { GroomerProfile } from './groomer-profile';

interface GroomerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: GroomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const groomer = await getGroomer(id);
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
  const groomer = await getGroomer(id);
  if (!groomer) return notFound();

  const reviews = await getGroomerReviews(id);
  const availability = generateMockAvailability();

  return <GroomerProfile groomer={groomer} reviews={reviews} availability={availability} />;
}
