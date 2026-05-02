import type { Metadata } from 'next';
import { PetOfTheWeek } from '@/components/social/pet-of-the-week';
import { Button } from '@/components/ui/button';
import { Crown, ArrowLeft, Star, HeartHandshake, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Najbolji ljubimac — Zajednica | PetPark',
  description: 'Prostor za favorite zajednice i objave koje vrijedi istaknuti.'
};

export default function NajboljiPage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-500 mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Favoriti zajednice</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Prostor za favorite zajednice i objave koje vrijedi istaknuti. Ovu sekciju razvijamo postupno, bez obećanja nagrada ili posebnih pogodnosti.
          </p>
        </div>

        {/* Current Winner */}
        <section className="mb-12">
          <PetOfTheWeek showHistory />
        </section>

        {/* Benefits */}
        <section className="grid gap-6 sm:grid-cols-3 mb-12">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 text-center">
            <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Istaknuta objava</h3>
            <p className="text-sm text-muted-foreground">
              Lijepa priča ili fotografija može dobiti više prostora u zajednici.
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 text-center">
            <HeartHandshake className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Inspiracija zajednici</h3>
            <p className="text-sm text-muted-foreground">
              Ideja je pokazati objave koje drugima mogu biti korisne, zabavne ili tople.
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 text-center">
            <Sparkles className="h-8 w-8 text-pink-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Lagano natjecanje</h3>
            <p className="text-sm text-muted-foreground">
              Kad značajka bude aktivna, cilj je prijateljski format bez velikih obećanja.
            </p>
          </div>
        </section>

        {/* How to Participate */}
        <section className="bg-muted rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Kako će funkcionirati?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium">Objavite fotografiju ili priču</h3>
                <p className="text-sm text-muted-foreground">
                  Podijelite trenutak koji vrijedi pokazati zajednici.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium">Zajednica reagira</h3>
                <p className="text-sm text-muted-foreground">
                  Reakcije i komentari pomažu nam prepoznati sadržaj koji vrijedi istaknuti.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-medium">Istaknemo favorite</h3>
                <p className="text-sm text-muted-foreground">
                  Povremeno možemo izdvojiti objave kao inspiraciju, bez garantiranih nagrada.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
