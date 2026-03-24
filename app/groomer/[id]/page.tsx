import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroomerById } from '@/lib/mock-data';
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

export default async function GroomerPage({ params }: GroomerPageProps) {
  const { id } = await params;
  const groomer = getGroomerById(id);
  if (!groomer) return notFound();
  return <GroomerProfile groomer={groomer} />;
}
