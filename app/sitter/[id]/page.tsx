import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getSitterBookingData } from './sitter-booking-data';
import { getSitterPageData } from './sitter-page-data';
import { SitterProfileContent } from './sitter-profile-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface SitterPageProps {
  params: Promise<{ id: string }>;
}

const getCachedSitter = cache(async (id: string) => (await getSitterPageData(id)).profile);

export async function generateMetadata({ params }: SitterPageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getCachedSitter(id);

  return {
    title: profile ? `${profile.user.name} — Sitter u ${profile.user.city || 'Hrvatskoj'}` : 'Sitter profil',
    description: profile ? `Pogledajte profil sittera ${profile.user.name}. Rezervirajte uslugu čuvanja ljubimaca.` : '',
    openGraph: profile ? {
      title: `${profile.user.name} — Sitter u ${profile.user.city || 'Hrvatskoj'}`,
      description: `Pogledajte profil sittera ${profile.user.name}. Rezervirajte uslugu čuvanja ljubimaca.`,
      url: `${BASE_URL}/sitter/${id}`,
      type: 'profile',
      images: ['/opengraph-image'],
    } : undefined,
    twitter: profile ? {
      card: 'summary_large_image',
      title: `${profile.user.name} — Sitter u ${profile.user.city || 'Hrvatskoj'}`,
      description: `Pogledajte profil sittera ${profile.user.name}. Rezervirajte uslugu čuvanja ljubimaca.`,
      images: ['/opengraph-image'],
    } : undefined,
    alternates: profile ? {
      canonical: `${BASE_URL}/sitter/${id}`,
    } : undefined,
  };
}

export default async function SitterPage({ params }: SitterPageProps) {
  const { id } = await params;

  const [{ profile, reviews, availability }, bookingData] = await Promise.all([
    getSitterPageData(id),
    getSitterBookingData(),
  ]);
  if (!profile) return notFound();

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
        bookingPets={bookingData.pets}
        bookingUserId={bookingData.currentUserId}
      />
    </>
  );
}
