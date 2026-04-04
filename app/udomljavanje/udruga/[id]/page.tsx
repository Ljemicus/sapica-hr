import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Heart, MapPin, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPublisherProfileById } from '@/lib/db/publisher-profiles';
import { getAdoptionListingsByPublisher } from '@/lib/db/adoption-listings';
import { ADOPTION_SPECIES_EMOJI } from '@/lib/types';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const publisher = await getPublisherProfileById(id);

  if (!publisher) {
    return { title: 'Udruga nije pronađena', robots: { index: false, follow: false } };
  }

  return {
    title: `${publisher.display_name} — Udomljavanje | PetPark`,
    description: publisher.bio || `Pogledajte životinje za udomljavanje o kojima brine ${publisher.display_name}.`,
    alternates: {
      canonical: `${BASE_URL}/udomljavanje/udruga/${publisher.id}`,
    },
  };
}

export default async function AdoptionPublisherPage({ params }: Props) {
  const { id } = await params;
  const publisher = await getPublisherProfileById(id);

  if (!publisher || publisher.type !== 'udomljavanje') {
    notFound();
  }

  const listings = await getAdoptionListingsByPublisher(publisher.id);
  const activeListings = listings.filter((listing) => listing.status === 'active');

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-white to-pink-50/30 dark:from-purple-950/10 dark:via-background dark:to-pink-950/10">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link href="/udomljavanje" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Natrag na udomljavanje
        </Link>

        <Card className="border-0 shadow-sm rounded-2xl mb-6">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <Badge className="mb-3 bg-purple-100 text-purple-700 hover:bg-purple-100 border-0">Udruga / sklonište</Badge>
                <h1 className="text-3xl md:text-4xl font-extrabold font-[var(--font-heading)] mb-2">{publisher.display_name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 text-purple-400" />
                  {publisher.city || 'Hrvatska'}
                </div>
                {publisher.bio && (
                  <p className="text-muted-foreground leading-relaxed max-w-3xl">{publisher.bio}</p>
                )}
              </div>
              <div className="text-right min-w-40">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{activeListings.length}</div>
                <div className="text-sm text-muted-foreground">aktivnih ljubimaca za udomljavanje</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-4">
          <h2 className="text-xl font-bold font-[var(--font-heading)] mb-2">Ljubimci o kojima brine {publisher.display_name}</h2>
          <p className="text-sm text-muted-foreground">Odaberite ljubimca i pogledajte njegov profil za više detalja.</p>
        </div>

        {activeListings.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-2xl">
            <CardContent className="p-8 text-center text-muted-foreground">
              Ova udruga trenutno nema aktivnih oglasa za udomljavanje.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeListings.map((listing) => (
              <Link key={listing.id} href={`/udomljavanje/${listing.id}`}>
                <Card className="border-0 shadow-sm rounded-2xl hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{ADOPTION_SPECIES_EMOJI[listing.species]}</span>
                      <h3 className="font-bold text-lg">{listing.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{listing.breed || 'Ljubimac za udomljavanje'}</p>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-3.5 w-3.5 text-purple-400" />
                      {listing.city}
                    </div>
                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-sm font-semibold text-purple-600 dark:text-purple-400">
                      <span>Pogledaj profil</span>
                      <Heart className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
