import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTrainer, getPrograms, getTrainerReviews, getTrainerAvailableDates } from '@/lib/db';
import { TrainerProfile } from './trainer-profile';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { shouldIndexTrainer, robotsMeta } from '@/lib/seo/indexability';
import { TRAINING_TYPE_LABELS } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TrainerPageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = await getTrainer(id);
  if (!trainer) notFound();
  const indexable = shouldIndexTrainer(trainer);
  const specList = trainer.specializations.map(s => TRAINING_TYPE_LABELS[s]).join(', ');
  const desc = `${trainer.name} — trener pasa u ${trainer.city}. Specijalizacije: ${specList}. ${trainer.review_count > 0 ? `Ocjena ${trainer.rating.toFixed(1)}/5 (${trainer.review_count} recenzija). ` : ''}${trainer.certified ? 'Certificiran. ' : ''}Zakažite trening putem PetParka.`;
  return {
    title: `${trainer.name} — Trener pasa u ${trainer.city}`,
    description: desc,
    robots: robotsMeta(indexable),
    openGraph: indexable ? {
      title: `${trainer.name} — Trener pasa u ${trainer.city}`,
      description: desc,
      url: `${BASE_URL}/trener/${id}`,
      type: 'profile',
      images: ['/opengraph-image'],
    } : undefined,
    twitter: indexable ? {
      card: 'summary_large_image',
      title: `${trainer.name} — Trener pasa u ${trainer.city}`,
      description: desc,
      images: ['/opengraph-image'],
    } : undefined,
    alternates: indexable ? {
      canonical: `${BASE_URL}/trener/${id}`,
    } : undefined,
  };
}

export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id } = await params;
  const trainer = await getTrainer(id);
  if (!trainer) {
    notFound();
  }

  const [programs, reviews, availableDatesList] = await Promise.all([
    getPrograms(id),
    getTrainerReviews(id),
    getTrainerAvailableDates(id),
  ]);

  const availableDates = new Set<string>(availableDatesList);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${trainer.name} — Trener pasa`,
    description: trainer.bio || `Profesionalni trener pasa u ${trainer.city}`,
    url: `${BASE_URL}/trener/${id}`,
    address: {
      '@type': 'PostalAddress',
      ...(trainer.address ? { streetAddress: trainer.address } : {}),
      addressLocality: trainer.city,
      addressCountry: 'HR',
    },
    ...(trainer.phone ? { telephone: trainer.phone } : {}),
    ...(trainer.email ? { email: trainer.email } : {}),
    aggregateRating: trainer.rating && trainer.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: trainer.rating,
      reviewCount: trainer.review_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    knowsAbout: trainer.specializations.map(s => TRAINING_TYPE_LABELS[s]),
    hasOfferCatalog: programs.length > 0 ? {
      '@type': 'OfferCatalog',
      name: 'Programi dresure',
      itemListElement: programs.map(p => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: p.name,
          description: p.description,
        },
        price: p.price,
        priceCurrency: 'EUR',
      })),
    } : undefined,
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
    priceRange: '€€',
    serviceType: 'Dog Training',
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumbs items={[
        { label: 'Školovanje pasa', href: '/dresura' },
        { label: trainer.name, href: `/trener/${id}` },
      ]} />
      <TrainerProfile trainer={trainer} programs={programs} reviews={reviews} availableDates={availableDates} />
    </>
  );
}
