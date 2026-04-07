import type { Metadata } from 'next';
import { PetOfTheWeek } from '@/components/social/pet-of-the-week';
import { Button } from '@/components/ui/button';
import { Crown, ArrowLeft, Star, Award } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Najbolji ljubimac — Zajednica | PetPark',
  description: 'Glasajte za ljubimca tjedna i pogledajte prošle pobjednike.',
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
          <h1 className="text-3xl font-bold mb-2">Ljubimac tjedna</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Svaki tjedan biramo najboljeg ljubimca zajednice. Glasajte za svog favorita 
            i pomozite mu osvojiti titulu!
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
            <h3 className="font-semibold mb-1">Titula tjedna</h3>
            <p className="text-sm text-muted-foreground">
              Ljubimac tjedna dobiva posebnu značku na profilu
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl p-6 text-center">
            <Award className="h-8 w-8 text-orange-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Nagrade</h3>
            <p className="text-sm text-muted-foreground">
              Svaki pobjednik osvaja vrijedne nagrade od naših partnera
            </p>
          </div>
          <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 text-center">
            <Crown className="h-8 w-8 text-pink-500 mx-auto mb-3" />
            <h3 className="font-semibold mb-1">Slava</h3>
            <p className="text-sm text-muted-foreground">
              Vaš ljubimac postaje zvijezda PetPark zajednice
            </p>
          </div>
        </section>

        {/* How to Participate */}
        <section className="bg-muted rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-center">Kako sudjelovati?</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-medium">Objavite fotografiju</h3>
                <p className="text-sm text-muted-foreground">
                  Podijelite najbolju fotografiju vašeg ljubimca na zajednici
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-medium">Skupljajte lajkove</h3>
                <p className="text-sm text-muted-foreground">
                  Što više lajkova vaša objava dobije, veće su šanse za pobjedu
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-medium">Pobijedite</h3>
                <p className="text-sm text-muted-foreground">
                  Najbolje ocijenjeni ljubimci svakog tjedna postaju naši pobjednici
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
