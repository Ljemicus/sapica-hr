import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getGroomerPageData } from './groomer-page-data';
import { GroomerProfile } from './groomer-profile';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { shouldIndexGroomer, robotsMeta } from '@/lib/seo/indexability';
import { GROOMING_SERVICE_LABELS, GROOMER_SPECIALIZATION_LABELS } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface GroomerPageProps {
  params: Promise<{ id: string }>;
}

const getCachedGroomer = cache(async (id: string) => (await getGroomerPageData(id)).groomer);

export async function generateMetadata({ params }: GroomerPageProps): Promise<Metadata> {
  const { id } = await params;
  const groomer = await getCachedGroomer(id);
  if (!groomer) notFound();
  const indexable = shouldIndexGroomer(groomer);
  const serviceList = groomer.services.map(s => GROOMING_SERVICE_LABELS[s]).join(', ');
  const specLabel = GROOMER_SPECIALIZATION_LABELS[groomer.specialization];
  const desc = `${groomer.name} — grooming salon u ${groomer.city} (${specLabel.toLowerCase()}). Usluge: ${serviceList}. ${groomer.review_count > 0 ? `Ocjena ${groomer.rating.toFixed(1)}/5 (${groomer.review_count} recenzija). ` : ''}Zakažite termin putem PetParka.`;
  return {
    title: `${groomer.name} — Grooming u ${groomer.city}`,
    description: desc,
    robots: robotsMeta(indexable),
    openGraph: indexable ? {
      title: `${groomer.name} — Grooming u ${groomer.city}`,
      description: desc,
      url: `${BASE_URL}/groomer/${id}`,
      type: 'profile',
      images: ['/opengraph-image'],
    } : undefined,
    twitter: indexable ? {
      card: 'summary_large_image',
      title: `${groomer.name} — Grooming u ${groomer.city}`,
      description: desc,
      images: ['/opengraph-image'],
    } : undefined,
    alternates: indexable ? {
      canonical: `${BASE_URL}/groomer/${id}`,
    } : undefined,
  };
}

export default async function GroomerPage({ params }: GroomerPageProps) {
  const { id } = await params;
  const { groomer, reviews, availableDates } = await getGroomerPageData(id);
  if (!groomer) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${groomer.name} — Pet Grooming`,
    description: groomer.bio || `Profesionalni grooming salon u ${groomer.city}`,
    url: `${BASE_URL}/groomer/${id}`,
    address: {
      '@type': 'PostalAddress',
      ...(groomer.address ? { streetAddress: groomer.address } : {}),
      addressLocality: groomer.city,
      addressCountry: 'HR',
    },
    ...(groomer.phone ? { telephone: groomer.phone } : {}),
    ...(groomer.email ? { email: groomer.email } : {}),
    aggregateRating: groomer.rating && groomer.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: groomer.rating,
      reviewCount: groomer.review_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Grooming usluge',
      itemListElement: groomer.services
        .filter(s => groomer.prices[s] > 0)
        .map(s => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: GROOMING_SERVICE_LABELS[s],
          },
          price: groomer.prices[s],
          priceCurrency: 'EUR',
        })),
    },
    ...(reviews.length > 0 ? {
      review: reviews.slice(0, 5).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author_name },
        datePublished: r.created_at,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: r.comment,
      })),
    } : {}),
    ...(groomer.working_hours ? {
      openingHoursSpecification: Object.entries(groomer.working_hours)
        .filter(([, v]) => v)
        .map(([day, hours]) => ({
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: day,
          opens: hours.start,
          closes: hours.end,
        })),
    } : {}),
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
