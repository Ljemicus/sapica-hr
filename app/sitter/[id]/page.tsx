import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { robotsMeta, shouldIndexSitter } from '@/lib/seo/indexability';
import { getProviderSitterById } from '@/lib/db/provider-sitters';
import { toPublicSitter } from '@/lib/public-profiles';
import { SitterProfileLoader } from './sitter-profile-loader';

interface SitterPageProps {
  params: Promise<{ id: string }>;
}

async function createSitterShell(id: string) {
  const profile = await getProviderSitterById(id);
  if (profile) return toPublicSitter(profile);

  return {
    id,
    name: 'Profil sittera',
    city: 'Hrvatska',
    description: 'Podaci o sitteru učitavaju se.',
    specializations: ['boarding'],
    certificates: [],
    certified: false,
    rating: 0,
    reviewCount: 0,
    priceFrom: null,
    services: ['boarding'],
    availability: [],
    profileImage: null,
    verified: false,
    category: 'sitter' as const,
    experienceYears: 0,
    superhost: false,
    responseTime: null,
    photos: [],
    instantBooking: false,
    prices: { boarding: 0, walking: 0, 'house-sitting': 0, 'drop-in': 0, daycare: 0 } as Record<string, number>,
  };
}

export async function generateMetadata({ params }: SitterPageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await createSitterShell(id);
  return {
    title: { absolute: `${profile.name} | PetPark` },
    description: profile.description || 'Profil sittera na PetParku.',
    alternates: { canonical: `/sitter/${id}` },
    robots: robotsMeta(shouldIndexSitter({
      user_id: profile.id, bio: profile.description || '', city: profile.city, services: profile.services as any,
      prices: profile.prices as any, verified: profile.verified, superhost: profile.superhost,
      rating_avg: profile.rating, review_count: profile.reviewCount,
      user: { id: profile.id, email: '', name: profile.name, role: 'sitter', avatar_url: profile.profileImage, phone: null, city: profile.city, created_at: new Date().toISOString() },
      experience_years: profile.experienceYears, photos: profile.photos, created_at: new Date().toISOString(),
    } as any)),
  };
}

export default async function SitterPage({ params }: SitterPageProps) {
  const { id } = await params;
  const profile = await createSitterShell(id);

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Pretraga sittera', href: '/pretraga' },
        { label: profile.name, href: `/sitter/${id}` },
      ]} />
      <SitterProfileLoader id={id} initialProfile={profile} />
    </>
  );
}
