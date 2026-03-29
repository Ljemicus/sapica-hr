import type { Metadata } from 'next';
import { PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FaqContent } from './faq-content';

export const metadata: Metadata = {
  title: 'Često postavljana pitanja (FAQ) | PetPark',
  description: 'Pronađite odgovore na najčešća pitanja o PetPark platformi — rezervacije, plaćanje, sigurnost, čuvanje ljubimaca i više.',
};

export default function FaqPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-orange-50 dark:from-teal-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
              <PawPrint className="h-3.5 w-3.5 mr-1.5" />
              Pomoć i podrška
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
              Često postavljana{' '}
              <span className="text-gradient">pitanja</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
              Sve što trebate znati o PetPark platformi na jednom mjestu.
              Ne nalazite odgovor? Kontaktirajte nas!
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <FaqContent />
    </div>
  );
}
