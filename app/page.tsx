import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { getSitters } from '@/lib/db';
import { ItemListJsonLd } from '@/components/seo/json-ld';
import { HomePageContent } from '@/components/home/homepage-content';

// Revalidate the homepage at most once per 60 seconds (ISR)
export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'PetPark — Pronađite pouzdanog sittera za svog ljubimca' },
  description: 'Verificirani pet sitteri, groomeri i treneri u vašem gradu. Rezervirajte online brzo, jasno i bez stresa uz PetPark.',
  keywords: ['pet sitting hrvatska', 'čuvanje ljubimaca', 'pet sitter', 'grooming', 'školovanje pasa', 'rezervacija sittera'],
  openGraph: {
    title: 'PetPark — Pronađite pouzdanog sittera za svog ljubimca',
    description: 'Verificirani sitteri, jasne recenzije i brza online rezervacija za ljubimce u Hrvatskoj.',
    url: 'https://petpark.hr',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr' },
};

const AnimatedFooter = dynamic(() => import('@/components/home/animated-footer').then((mod) => mod.AnimatedFooter), {
  loading: () => <div className="h-64 bg-muted animate-pulse" />,
});

const homepageServices = [
  { name: 'Čuvanje ljubimaca', url: 'https://petpark.hr/pretraga', description: 'Pronađite pouzdane sittere u vašem gradu' },
  { name: 'Grooming', url: 'https://petpark.hr/njega', description: 'Profesionalni groomeri i saloni za njegu ljubimaca' },
  { name: 'Školovanje pasa', url: 'https://petpark.hr/dresura', description: 'Certificirani treneri i programi za pse' },
  { name: 'Veterinari', url: 'https://petpark.hr/veterinari', description: 'Veterinarske ordinacije u vašem gradu' },
];

const SITTER_GRADIENTS = [
  'from-orange-400 to-amber-300',
  'from-teal-400 to-cyan-300',
  'from-purple-400 to-pink-300',
  'from-emerald-400 to-teal-300',
  'from-rose-400 to-orange-300',
  'from-sky-400 to-blue-300',
];

const cities = [
  { name: 'Zagreb', image: '/images/cities/zagreb.jpg', landing: '/cuvanje-pasa-zagreb' },
  { name: 'Rijeka', image: '/images/cities/rijeka.jpg', landing: '/cuvanje-pasa-rijeka' },
  { name: 'Split', image: '/images/cities/split.jpg', landing: '/cuvanje-pasa-split' },
  { name: 'Osijek', image: '/images/cities/osijek.jpg', landing: null },
  { name: 'Pula', image: '/images/cities/pula.jpg', landing: null },
  { name: 'Zadar', image: '/images/cities/zadar.jpg', landing: null },
];

export default async function HomePage() {
  const topSitters = await getSitters({ sort: 'rating', limit: 6, fields: 'homepage-card' });

  const featuredSitters = topSitters.map((s, i) => ({
    id: s.user_id,
    name: s.user?.name || 'Sitter',
    city: s.city || '',
    rating: s.rating_avg,
    reviews: s.review_count,
    bio: s.bio || '',
    verified: s.verified,
    superhost: s.superhost,
    initial: (s.user?.name || 'S').charAt(0),
    gradient: SITTER_GRADIENTS[i % SITTER_GRADIENTS.length],
  }));

  return (
    <>
      <ItemListJsonLd items={homepageServices} />
      <HomePageContent featuredSitters={featuredSitters} cities={cities} newsletterSlot={<AnimatedFooter />} />
    </>
  );
}
