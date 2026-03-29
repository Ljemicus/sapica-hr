'use client';

import { Heart, Search } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SitterCard } from '@/components/shared/sitter-card';
import { mockSitterProfiles } from '@/lib/mock-data';
import { useFavorites } from '@/hooks/use-favorites';

export default function OmiljeniPage() {
  const { favorites, loaded } = useFavorites();

  const favoriteSitters = mockSitterProfiles.filter(profile =>
    favorites.includes(profile.user_id)
  );

  if (!loaded) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold font-[var(--font-heading)] flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          Omiljeni sitteri
        </h1>
        <p className="text-muted-foreground mt-2">
          Vaši omiljeni sitteri na jednom mjestu
        </p>
        {favoriteSitters.length > 0 && (
          <Badge variant="secondary" className="mt-2">
            {favoriteSitters.length} {favoriteSitters.length === 1 ? 'sitter' : 'sittera'}
          </Badge>
        )}
      </div>

      {favoriteSitters.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteSitters.map(profile => (
            <SitterCard key={profile.user_id} profile={profile} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Heart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Nemate omiljenih sittera</h2>
          <p className="text-muted-foreground mb-6">
            Dodajte sittere u omiljene klikom na srce na njihovom profilu
          </p>
          <Link href="/pretraga">
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Pretraži sittere
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
