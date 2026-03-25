import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSitter, getReviewsBySitter, getAvailability } from '@/lib/db';
import { SitterProfileContent } from './sitter-profile-content';

interface SitterPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SitterPageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getSitter(id);

  return {
    title: profile ? `${profile.user.name} — Sitter u ${profile.user.city || 'Hrvatskoj'}` : 'Sitter profil',
    description: profile ? `Pogledajte profil sittera ${profile.user.name}. Rezervirajte uslugu čuvanja ljubimaca.` : '',
  };
}

export default async function SitterPage({ params }: SitterPageProps) {
  const { id } = await params;

  const profile = await getSitter(id);
  if (!profile) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = await getReviewsBySitter(id) as any[];
  const availability = await getAvailability(id);

  return (
    <SitterProfileContent
      profile={profile}
      reviews={reviews}
      availability={availability}
    />
  );
}
