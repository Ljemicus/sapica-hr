import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAdoptionListing, getAdoptionListingsByPublisher } from '@/lib/db/adoption-listings';
import { AdoptionDetailContent } from './adoption-detail-content';
import { shouldIndexAdoption, robotsMeta } from '@/lib/seo/indexability';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getAdoptionListing(id);
  if (!listing || listing.status !== 'active') return { title: 'Oglas nije pronađen', robots: { index: false, follow: false } };

  const primaryImage = listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];
  const indexable = shouldIndexAdoption(listing);

  return {
    title: `${listing.name} — Udomljavanje | PetPark`,
    description: listing.description.slice(0, 160),
    robots: robotsMeta(indexable),
    openGraph: {
      title: `${listing.name} traži dom | PetPark`,
      description: listing.description.slice(0, 200),
      type: 'article',
      url: `${BASE_URL}/udomljavanje/${id}`,
      images: primaryImage ? [{ url: primaryImage.url, alt: listing.name }] : [],
    },
    alternates: indexable ? {
      canonical: `${BASE_URL}/udomljavanje/${id}`,
    } : undefined,
  };
}

export default async function AdoptionDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getAdoptionListing(id);

  if (!listing || listing.status !== 'active') {
    notFound();
  }

  const relatedListings = listing.publisher_id
    ? (await getAdoptionListingsByPublisher(listing.publisher_id))
        .filter((item) => item.status === 'active' && item.id !== listing.id)
        .slice(0, 3)
    : [];

  return <AdoptionDetailContent listing={listing} relatedListings={relatedListings} />;
}
