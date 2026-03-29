import type { Metadata } from 'next';
import { PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FAQJsonLd } from '@/components/seo/json-ld';
import { FaqContent } from './faq-content';

const allFaqs = [
  { q: 'Kako funkcionira rezervacija?', a: 'Pretražite sittere u vašem gradu, pregledajte profile i recenzije, pošaljite upit za željene datume. Sitter potvrđuje, vi plaćate online i ljubimac je zbrinut!' },
  { q: 'Mogu li otkazati rezervaciju?', a: 'Da, besplatno otkazivanje do 48 sati prije početka. Nakon toga se naplaćuje 50% cijene prve noći.' },
  { q: 'Što ako se ljubimac razboli tijekom čuvanja?', a: 'Sitter vas odmah kontaktira i vodi ljubimca veterinaru. Troškove hitne veterinarske pomoći pokriva naše osiguranje do 500€.' },
  { q: 'Kako funkcioniraju recenzije?', a: 'Nakon svake završene rezervacije možete ostaviti recenziju i ocjenu (1-5 zvjezdica). Recenzije su javne i pomažu drugim vlasnicima.' },
  { q: 'Mogu li posjetiti ljubimca tijekom čuvanja?', a: 'Naravno! Dogovorite se sa sitterom o posjetu. Većina sittera rado šalje foto i video ažuriranja svaki dan.' },
  { q: 'Kako postati sitter?', a: 'Registrirajte se, ispunite profil, dodajte slike i opišite iskustvo. Naš tim verificira profil u roku 24-48 sati.' },
  { q: 'Kako funkcionira verifikacija?', a: 'Provjeravamo identitet, iskustvo sa životinjama i reference. Verificirani sitteri dobivaju plavu oznaku na profilu.' },
  { q: 'Koliko mogu zaraditi?', a: 'Ovisi o lokaciji, uslugama i cijenama. Aktivni sitteri zarađuju 300-800€ mjesečno. Vi postavljate vlastite cijene.' },
  { q: 'Koji načini plaćanja su dostupni?', a: 'Kartično plaćanje (Visa, Mastercard), Apple Pay, Google Pay. Sve transakcije su sigurne i enkriptirane.' },
  { q: 'Kolika je provizija PetParka?', a: 'PetPark naplaćuje 15% provizije na svaku rezervaciju. Registracija i korištenje platforme su potpuno besplatni.' },
  { q: 'Kako PetPark osigurava sigurnost ljubimaca?', a: 'Svi sitteri prolaze verifikaciju, imamo sustav recenzija, osiguranje i podršku 7/7. GPS tracking šetnji za dodatni mir.' },
  { q: 'Jesu li moji podaci sigurni?', a: 'Koristimo SSL enkripciju, ne dijelimo podatke s trećim stranama i pridržavamo se GDPR propisa.' },
  { q: 'U kojim gradovima je PetPark dostupan?', a: 'Trenutno smo dostupni u Zagrebu, Rijeci, Splitu, Osijeku, Zadru, Puli, Dubrovniku, Karlovcu, Varaždinu i Šibeniku. Širimo se!' },
  { q: 'Postoji li mobilna aplikacija?', a: 'Mobilna aplikacija je u razvoju! Trenutno koristite web stranicu koja je potpuno prilagođena mobilnim uređajima.' },
];

export const metadata: Metadata = {
  title: 'Često postavljana pitanja (FAQ) | PetPark',
  description: 'Pronađite odgovore na najčešća pitanja o PetPark platformi — rezervacije, plaćanje, sigurnost, čuvanje ljubimaca i više.',
};

export default function FaqPage() {
  return (
    <div>
      <FAQJsonLd faqs={allFaqs} />
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
