import type { Metadata } from 'next';
import { ChallengeList } from '@/components/social/challenge-list';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Izazovi — Zajednica | PetPark',
  description: 'Sudjelujte u viralnim izazovima s vašim ljubimcima i osvojite nagrade.',
};

export default function IzazoviPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/zajednica">
          <Button variant="ghost" className="mb-4 -ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag na zajednicu
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Izazovi</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sudjelujte u viralnim izazovima s vašim ljubimcima. Glasajte za svoje favorite 
            i pomozite im osvojiti nagrade!
          </p>
        </div>

        {/* Active Challenges */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Aktivni izazovi</h2>
          <ChallengeList />
        </section>

        {/* How It Works */}
        <section className="bg-muted rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Kako funkcioniraju izazovi?</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 font-bold">
                1
              </div>
              <h3 className="font-medium mb-1">Pridružite se</h3>
              <p className="text-sm text-muted-foreground">
                Odaberite aktivni izazov i objavite fotografiju s vašim ljubimcem
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 font-bold">
                2
              </div>
              <h3 className="font-medium mb-1">Skupljajte glasove</h3>
              <p className="text-sm text-muted-foreground">
                Podijelite svoju prijavu i pozovite prijatelje da glasaju
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 font-bold">
                3
              </div>
              <h3 className="font-medium mb-1">Osvojite nagrade</h3>
              <p className="text-sm text-muted-foreground">
                Najbolje ocijenjeni ljubimci osvajaju vrijedne nagrade
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
