import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getSitter, getReviewsBySitter, getAvailability } from '@/lib/db';
import { SitterProfileContent } from './sitter-profile-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

interface SitterPageProps {
  params: Promise<{ id: string }>;
}

const getCachedSitter = cache(async (id: string) => getSitter(id));

export async function generateMetadata({ params }: SitterPageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getCachedSitter(id);

  return {
    title: profile ? `${profile.user.name} — Sitter u ${profile.user.city || 'Hrvatskoj'}` : 'Sitter profil',
    description: profile ? `Pogledajte profil sittera ${profile.user.name}. Rezervirajte uslugu čuvanja ljubimaca.` : '',
  };
}

export default async function SitterPage({ params }: SitterPageProps) {
  const { id } = await params;

  const profile = await getCachedSitter(id);
  if (!profile) return notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = await getReviewsBySitter(id) as any[];
  const availability = await getAvailability(id);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${profile.user.name} — Pet Sitter`,
    description: profile.bio || `Profesionalni čuvar ljubimaca u ${profile.user.city || 'Hrvatskoj'}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.user.city || 'Zagreb',
      addressCountry: 'HR',
    },
    aggregateRating: profile.rating_avg ? {
      '@type': 'AggregateRating',
      ratingValue: profile.rating_avg,
      reviewCount: profile.review_count,
    } : undefined,
    priceRange: '€€',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[
        { label: 'Pretraga sittera', href: '/pretraga' },
        { label: profile.user.name, href: `/sitter/${id}` },
      ]} />
      <SitterProfileContent
        profile={profile}
        reviews={reviews}
        availability={availability}
      />
    </>
  );
}
