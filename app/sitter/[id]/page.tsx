import { notFound } from 'next/navigation';
import { cache } from 'react';
import type { Metadata } from 'next';
import { getSitterBookingData } from './sitter-booking-data';
import { getSitterPageData } from './sitter-page-data';
import { SitterProfileContent } from './sitter-profile-content';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { shouldIndexSitter, robotsMeta } from '@/lib/seo/indexability';
import { SERVICE_LABELS } from '@/lib/types';
import { getProviderApplication } from '@/lib/db/provider-applications';
import { getProviderPublicGate } from '@/lib/trust/gate';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface SitterPageProps {
  params: Promise<{ id: string }>;
}

// ISR: Revalidate every 5 minutes for sitter profiles
export const revalidate = 300;

const getCachedSitter = cache(async (id: string) => (await getSitterPageData(id)).profile);

export async function generateMetadata({ params }: SitterPageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getCachedSitter(id);

  const indexable = profile ? shouldIndexSitter(profile) : false;

  const serviceList = profile ? profile.services.map(s => SERVICE_LABELS[s]).join(', ') : '';
  const desc = profile
    ? `${profile.user.name} — sitter u ${profile.user.city || 'Hrvatskoj'}. Usluge: ${serviceList}. ${profile.review_count > 0 ? `Ocjena ${profile.rating_avg.toFixed(1)}/5 (${profile.review_count} recenzija). ` : ''}Rezervirajte putem PetParka.`
    : '';

  return {
    title: profile ? `${profile.user.name} — Sitter u ${profile.user.city || 'Hrvatskoj'}` : 'Sitter profil',
    description: desc,
    robots: robotsMeta(indexable),
    openGraph: profile && indexable ? {
      title: `${profile.user.name} — Sitter u ${profile.user.city || 'Hrvatskoj'}`,
      description: desc,
      url: `${BASE_URL}/sitter/${id}`,
      type: 'profile',
      images: ['/opengraph-image'],
    } : undefined,
    twitter: profile && indexable ? {
      card: 'summary_large_image',
      title: `${profile.user.name} — Sitter u ${profile.user.city || 'Hrvatskoj'}`,
      description: desc,
      images: ['/opengraph-image'],
    } : undefined,
    alternates: profile && indexable ? {
      canonical: `${BASE_URL}/sitter/${id}`,
    } : undefined,
  };
}

export default async function SitterPage({ params }: SitterPageProps) {
  const { id } = await params;

  const [{ profile, reviews, availability }, bookingData, providerApplication] = await Promise.all([
    getSitterPageData(id),
    getSitterBookingData(),
    getProviderApplication(id),
  ]);
  if (!profile) return notFound();

  if (providerApplication) {
    const gate = await getProviderPublicGate(providerApplication.id);
    if (!gate.allowed) return notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: `${profile.user.name} — Pet Sitter`,
    description: profile.bio || `Profesionalni čuvar ljubimaca u ${profile.user.city || 'Hrvatskoj'}`,
    url: `${BASE_URL}/sitter/${id}`,
    image: profile.user.avatar_url || undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: profile.user.city || 'Zagreb',
      addressCountry: 'HR',
    },
    ...(profile.location_lat && profile.location_lng ? {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: profile.location_lat,
        longitude: profile.location_lng,
      },
    } : {}),
    aggregateRating: profile.rating_avg && profile.review_count > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: profile.rating_avg,
      reviewCount: profile.review_count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Usluge čuvanja ljubimaca',
      itemListElement: profile.services
        .filter(s => profile.prices[s] > 0)
        .map(s => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: SERVICE_LABELS[s],
          },
          price: profile.prices[s],
          priceCurrency: 'EUR',
        })),
    },
    ...(reviews.length > 0 ? {
      review: reviews.slice(0, 5).map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.reviewer?.name || 'Korisnik' },
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
