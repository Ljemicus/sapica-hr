import type { Metadata } from 'next';
import { PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FAQJsonLd } from '@/components/seo/json-ld';
import { FaqContent } from './faq-content';

const allFaqs = [
  { q: 'Kako funkcionira rezervacija?', a: 'Pretražite sittere u vašem gradu, pregledajte profile i recenzije te pošaljite upit za željene datume. Sitter potvrđuje termin, a vi zatim dovršavate rezervaciju.' },
  { q: 'Mogu li otkazati rezervaciju?', a: 'Da, besplatno otkazivanje do 24 sata prije početka. Otkazivanja unutar 24 sata podliježu naknadi od 50%. Detalji su navedeni u Uvjetima korištenja.' },
  { q: 'Što ako se ljubimac razboli tijekom čuvanja?', a: 'Sitter vas odmah kontaktira i zajedno reagirate. Preporučujemo da unaprijed dogovorite veterinara i hitni kontakt sa sitterom.' },
  { q: 'Kako funkcioniraju recenzije?', a: 'Nakon svake završene rezervacije možete ostaviti recenziju i ocjenu (1-5 zvjezdica). Recenzije su javne i pomažu drugim vlasnicima.' },
  { q: 'Mogu li posjetiti ljubimca tijekom čuvanja?', a: 'Naravno! Dogovorite se sa sitterom o posjetu. Većina sittera rado šalje foto i video ažuriranja svaki dan.' },
  { q: 'Kako postati sitter?', a: 'Registrirajte se, ispunite profil, dodajte slike i opišite iskustvo. Naš tim pregledava zahtjev i javlja se u roku nekoliko radnih dana.' },
  { q: 'Kako funkcionira verifikacija?', a: 'Prije objave profila provjeravamo osnovne podatke, identitet i relevantne informacije o iskustvu. Verificirani profili imaju jasnu oznaku na PetParku.' },
  { q: 'Koliko mogu zaraditi?', a: 'Ovisi o lokaciji, uslugama i cijenama. Prihodi ovise o gradu, broju rezervacija i cijenama. Vi postavljate vlastite cijene.' },
  { q: 'Koji načini plaćanja su dostupni?', a: 'Kartično plaćanje (Visa, Mastercard), Apple Pay, Google Pay. Sve transakcije su sigurne i enkriptirane.' },
  { q: 'Kolika je provizija PetParka?', a: 'PetPark naplaćuje 10% provizije na svaku rezervaciju. Registracija i korištenje platforme su potpuno besplatni.' },
  { q: 'Kako PetPark osigurava sigurnost ljubimaca?', a: 'PetPark koristi verifikaciju profila, recenzije korisnika i podršku za probleme s rezervacijom. Prije potvrde termina preporučujemo da provjerite profil i detalje usluge.' },
  { q: 'Jesu li moji podaci sigurni?', a: 'Koristimo SSL enkripciju, ne dijelimo podatke s trećim stranama i pridržavamo se GDPR propisa.' },
  { q: 'U kojim gradovima je PetPark dostupan?', a: 'Trenutno smo dostupni u Zagrebu, Rijeci, Splitu, Osijeku, Zadru, Puli, Dubrovniku, Karlovcu, Varaždinu i Šibeniku. Širimo se!' },
  { q: 'Postoji li mobilna aplikacija?', a: 'Mobilna aplikacija je u razvoju! Trenutno koristite web stranicu koja je potpuno prilagođena mobilnim uređajima.' },
];

export const metadata: Metadata = {
  title: 'Često postavljena pitanja',
  description: 'Pronađite odgovore na najčešća pitanja o PetPark platformi — rezervacije, plaćanje, sigurnost, čuvanje ljubimaca i više.',
  keywords: ['FAQ', 'pitanja', 'pomoć', 'PetPark pitanja', 'kako funkcionira PetPark'],
  openGraph: {
    title: 'Često postavljena pitanja | PetPark',
    description: 'Odgovori na najčešća pitanja o PetPark platformi — rezervacije, plaćanje, sigurnost i više.',
    url: 'https://petpark.hr/faq',
    type: 'website',
  },
  alternates: { canonical: 'https://petpark.hr/faq' },
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
              Sve što trebate znati o PetParku na jednom mjestu.
              Ako ne nalazite odgovor, javite nam se.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <FaqContent />
    </div>
  );
}
