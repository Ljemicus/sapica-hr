import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLostPet } from '@/lib/db';
import { getAuthUser } from '@/lib/auth';
import { LostPetFlyerContent } from './flyer-content';

interface FlyerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FlyerPageProps): Promise<Metadata> {
  const { id } = await params;
  const pet = await getLostPet(id);

  if (!pet) return { title: 'Letak — PetPark' };

  return {
    title: `Letak: ${pet.name} — PetPark`,
    robots: { index: false, follow: false },
  };
}

export default async function LostPetFlyerPage({ params }: FlyerPageProps) {
  const { id } = await params;
  const pet = await getLostPet(id);

  if (!pet) {
    notFound();
  }

  if (pet.hidden) {
    const user = await getAuthUser();
    const isOwner = user?.id === pet.user_id;
    const isAdmin = user?.role === 'admin';
    if (!isOwner && !isAdmin) {
      notFound();
    }
  }

  // Include contact info on the flyer — this is intentional for print use
  return <LostPetFlyerContent pet={pet} />;
}
