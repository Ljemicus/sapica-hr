import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdoptionListing } from '@/lib/db/adoption-listings';
import { AdoptionDetailContent } from './adoption-detail-content';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getAdoptionListing(id);
  if (!listing || listing.status !== 'active') return { title: 'Oglas nije pronađen' };

  const primaryImage = listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];

  return {
    title: `${listing.name} — Udomljavanje | PetPark`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: `${listing.name} traži dom | PetPark`,
      description: listing.description.slice(0, 200),
      type: 'article',
      url: `${BASE_URL}/udomljavanje/${id}`,
      images: primaryImage ? [{ url: primaryImage.url, alt: listing.name }] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/udomljavanje/${id}`,
    },
  };
}

export default async function AdoptionDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getAdoptionListing(id);

  if (!listing || listing.status !== 'active') {
    notFound();
  }

  return <AdoptionDetailContent listing={listing} />;
}
