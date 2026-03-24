import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSitterProfile, getReviewsForSitter, getAvailabilityForSitter, getUserById } from '@/lib/mock-data';
import { SitterProfileContent } from './sitter-profile-content';

interface SitterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SitterPageProps): Promise<Metadata> {
  const { id } = await params;
  const user = getUserById(id);

  return {
    title: user ? `${user.name} — Sitter u ${user.city || 'Hrvatskoj'}` : 'Sitter profil',
    description: user ? `Pogledajte profil sittera ${user.name}. Rezervirajte uslugu čuvanja ljubimaca.` : '',
  };
}

export default async function SitterPage({ params }: SitterPageProps) {
  const { id } = await params;

  const profile = getSitterProfile(id);
  if (!profile) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = getReviewsForSitter(id) as any[];

  const availability = getAvailabilityForSitter(id);

  return (
    <SitterProfileContent
      profile={profile}
      reviews={reviews}
      availability={availability}
    />
  );
}
