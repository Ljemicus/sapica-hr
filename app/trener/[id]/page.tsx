import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTrainer, getPrograms, getTrainerReviews, getTrainerAvailableDates } from '@/lib/db';
import { TrainerProfile } from './trainer-profile';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TrainerPageProps): Promise<Metadata> {
  const { id } = await params;
  const trainer = await getTrainer(id);
  if (!trainer) notFound();
  return {
    title: `${trainer.name} — Trener pasa u ${trainer.city}`,
    description: `Pogledajte profil trenera ${trainer.name}. Zakažite dresuru za svog psa.`,
    openGraph: {
      title: `${trainer.name} — Trener pasa u ${trainer.city}`,
      description: `Pogledajte profil trenera ${trainer.name}. Zakažite dresuru za svog psa.`,
      url: `${BASE_URL}/trener/${id}`,
      type: 'profile',
      images: ['/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${trainer.name} — Trener pasa u ${trainer.city}`,
      description: `Pogledajte profil trenera ${trainer.name}. Zakažite dresuru za svog psa.`,
      images: ['/opengraph-image'],
    },
    alternates: {
      canonical: `${BASE_URL}/trener/${id}`,
    },
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
    address: {
      '@type': 'PostalAddress',
      addressLocality: trainer.city,
      addressCountry: 'HR',
    },
    aggregateRating: trainer.rating ? {
      '@type': 'AggregateRating',
      ratingValue: trainer.rating,
      reviewCount: trainer.review_count,
    } : undefined,
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
