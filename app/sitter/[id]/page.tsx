import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/shared/breadcrumbs';
import { robotsMeta, shouldIndexSitter } from '@/lib/seo/indexability';
import type { SitterProfile } from '@/lib/types';
import { getProviderSitterById } from '@/lib/db/provider-sitters';
import { SitterProfileLoader } from './sitter-profile-loader';

interface SitterPageProps {
  params: Promise<{ id: string }>;
}

async function createSitterShell(id: string): Promise<SitterProfile & { user: NonNullable<SitterProfile['user']> }> {
  const profile = await getProviderSitterById(id);
  if (profile) return profile as SitterProfile & { user: NonNullable<SitterProfile['user']> };

  return {
    user_id: id,
    bio: 'Podaci o sitteru učitavaju se.',
    experience_years: 0,
    services: ['boarding'],
    prices: { boarding: 0, walking: 0, 'house-sitting': 0, 'drop-in': 0, daycare: 0 },
    verified: false,
    superhost: false,
    response_time: null,
    rating_avg: 0,
    review_count: 0,
    location_lat: null,
    location_lng: null,
    city: 'Hrvatska',
    photos: [],
    created_at: new Date().toISOString(),
    user: {
      id,
      email: '',
      name: 'Profil sittera',
      role: 'sitter',
      avatar_url: null,
      phone: null,
      city: 'Hrvatska',
      created_at: new Date().toISOString(),
    },
  };
}

export async function generateMetadata({ params }: SitterPageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await createSitterShell(id);
  return {
    title: { absolute: `${profile.user.name} | PetPark` },
    description: profile.bio || 'Profil sittera na PetParku.',
    alternates: { canonical: `/sitter/${id}` },
    robots: robotsMeta(shouldIndexSitter(profile)),
  };
}

export default async function SitterPage({ params }: SitterPageProps) {
  const { id } = await params;
  const profile = await createSitterShell(id);

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Pretraga sittera', href: '/pretraga' },
        { label: profile.user.name, href: `/sitter/${id}` },
      ]} />
      <SitterProfileLoader id={id} initialProfile={profile} />
    </>
  );
}
