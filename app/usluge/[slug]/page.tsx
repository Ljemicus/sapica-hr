import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceDetailPage } from '@/components/shared/petpark/service-detail';
import { getPublicServiceListingBySlug } from '@/lib/db/service-listings';

export const metadata: Metadata = {
  title: 'Čuvanje psa u kućnom okruženju | PetPark',
  description: 'Detalji PetPark usluge čuvanja psa, dostupnost, cijena, recenzije i rezervacija.',
};

export default async function UslugeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getPublicServiceListingBySlug(slug);

  if (!service && slug !== 'cuvanje-psa-u-kucnom-okruzenju') {
    notFound();
  }

  return <ServiceDetailPage service={service || undefined} />;
}
