import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getBreeder, MOCK_BREEDERS } from '@/lib/mock-breeders';
import { BreederDetailContent } from './breeder-detail-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

interface BreederPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BreederPageProps): Promise<Metadata> {
  const { id } = await params;
  const breeder = getBreeder(id);
  return {
    title: breeder ? `${breeder.name} — Uzgajivač u ${breeder.city}` : 'Uzgajivač profil',
    description: breeder ? `Pogledajte profil uzgajivača ${breeder.name} u ${breeder.city}. ${breeder.breeds.join(', ')}.` : '',
  };
}

export default async function BreederPage({ params }: BreederPageProps) {
  const { id } = await params;
  const breeder = getBreeder(id);
  if (!breeder) return notFound();

  // Get related breeders (same species, different id)
  const related = MOCK_BREEDERS
    .filter((b) => b.id !== breeder.id && (b.species === breeder.species || b.species === 'both'))
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: breeder.name,
    description: breeder.bio,
    address: {
      '@type': 'PostalAddress',
      addressLocality: breeder.city,
      addressCountry: 'HR',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: breeder.rating,
      reviewCount: breeder.reviewCount,
    },
    priceRange: '€€',
    serviceType: 'Pet Breeder',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[
        { label: 'Uzgajivači', href: '/uzgajivacnice' },
        { label: breeder.name, href: `/uzgajivacnice/${id}` },
      ]} />
      <BreederDetailContent breeder={breeder} relatedBreeders={related} />
    </>
  );
}
