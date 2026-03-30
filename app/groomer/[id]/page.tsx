import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getGroomer, getGroomerReviews, getAvailability } from '@/lib/db';
import { GroomerProfile } from './groomer-profile';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

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

export default async function GroomerPage({ params }: GroomerPageProps) {
  const { id } = await params;
  const groomer = await getGroomer(id);
  if (!groomer) return notFound();

  const reviews = await getGroomerReviews(id);

  // Query real availability from Supabase, convert to Set<string>
  const availabilityRecords = await getAvailability(id);
  const availableDates = new Set(
    availabilityRecords.filter(a => a.available).map(a => a.date)
  );

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
