import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getVeterinarianBySlug } from '@/lib/db/veterinarians';
import { getVetReviews, getVetReviewStats } from '@/lib/db/vet-reviews';
import { VetProfileContent } from './components/vet-profile-content';

interface VetProfilePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VetProfilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const vet = await getVeterinarianBySlug(slug);
  
  if (!vet) {
    return {
      title: 'Veterinar nije pronađen | PetPark',
    };
  }

  return {
    title: `${vet.name} | Recenzije i kontakt | PetPark`,
    description: `Pogledajte recenzije za ${vet.name} u ${vet.city}. Adresa: ${vet.address}. Telefon: ${vet.phone || 'nema'}.`,
  };
}

export default async function VetProfilePage({ params }: VetProfilePageProps) {
  const { slug } = await params;
  const vet = await getVeterinarianBySlug(slug);

  if (!vet) {
    notFound();
  }

  const [reviews, stats] = await Promise.all([
    getVetReviews(vet.id, { limit: 10 }),
    getVetReviewStats(vet.id),
  ]);

  return (
    <VetProfileContent 
      vet={vet} 
      initialReviews={reviews} 
      initialStats={stats}
    />
  );
}
