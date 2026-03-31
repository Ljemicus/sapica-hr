import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getGroomer, getGroomerReviews, getGroomerAvailableDates } from '@/lib/db';
import { GroomerProfile } from './groomer-profile';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

interface GroomerPageProps {
  params: Promise<{ id: string }>;
}

const getCachedGroomer = cache(async (id: string) => getGroomer(id));

export async function generateMetadata({ params }: GroomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const groomer = await getCachedGroomer(id);
  if (!groomer) notFound();
  return {
    title: `${groomer.name} — Grooming u ${groomer.city}`,
    description: `Pogledajte profil groomera ${groomer.name}. Zakažite termin za uljepšavanje ljubimca.`,
  };
}

export default async function GroomerPage({ params }: GroomerPageProps) {
  const { id } = await params;
  const groomer = await getCachedGroomer(id);
  if (!groomer) return notFound();

  const reviews = await getGroomerReviews(id);

  // Query groomer-specific availability slots
  const availableDatesList = await getGroomerAvailableDates(id);
  const availableDates = new Set(availableDatesList);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${groomer.name} — Pet Grooming`,
    description: groomer.bio || `Profesionalni grooming salon u ${groomer.city}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: groomer.city,
      addressCountry: 'HR',
    },
    aggregateRating: groomer.rating ? {
      '@type': 'AggregateRating',
      ratingValue: groomer.rating,
      reviewCount: groomer.reviews,
    } : undefined,
    priceRange: '€€',
    serviceType: 'Pet Grooming',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[
        { label: 'Grooming', href: '/njega' },
        { label: groomer.name, href: `/groomer/${id}` },
      ]} />
      <GroomerProfile groomer={groomer} reviews={reviews} availableDates={availableDates} />
    </>
  );
}
