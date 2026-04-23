import type { Metadata } from 'next';
import { PawPrint } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FAQJsonLd } from '@/components/seo/json-ld';
import { FaqContent } from './faq-content';
import { PublicPageShell } from '@/components/shared/public-page-shell';
import { buildLocaleAlternates, buildLocaleOpenGraph } from '@/lib/seo/locale-metadata';

export const FAQ_ITEMS = {
  hr: [
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
  ],
  en: [
    { q: 'How does booking work?', a: 'Browse sitters in your city, review profiles and ratings, and send a request for your preferred dates. The sitter confirms the stay, and then you complete the booking.' },
    { q: 'Can I cancel a booking?', a: 'Yes, cancellation is free up to 24 hours before the start time. Cancellations within 24 hours are subject to a 50% fee. Full details are listed in the Terms of Use.' },
    { q: 'What if my pet gets sick during the stay?', a: 'Your sitter should contact you right away so you can decide on the next step together. For emergencies, we recommend agreeing on a vet and emergency contact in advance.' },
    { q: 'How do reviews work?', a: 'After each completed booking, you can leave a review and a rating from 1 to 5 stars. Reviews are public and help other owners choose with confidence.' },
    { q: 'Can I visit my pet during the stay?', a: 'Of course. Arrange visits directly with the sitter. Many sitters are happy to send daily photo or video updates too.' },
    { q: 'How do I become a sitter?', a: 'Create an account, complete your profile, add photos, and describe your experience. Our team reviews each application and gets back to you within a few business days.' },
    { q: 'How does verification work?', a: 'Before a profile goes live, we review key profile details, identity, and relevant experience information. Verified sitters receive a clear trust badge on PetPark.' },
    { q: 'How much can I earn?', a: 'It depends on your location, services, and pricing. Earnings vary by city, number of bookings, and rates. You set your own prices.' },
    { q: 'Which payment methods are available?', a: 'Card payments (Visa and Mastercard), Apple Pay, and Google Pay. Availability may depend on active platform integrations in your market.' },
    { q: 'What is PetPark’s commission?', a: 'PetPark charges a 10% commission on each booking. Creating and using an account is completely free.' },
    { q: 'How does PetPark help keep pets safe?', a: 'PetPark uses profile verification, user reviews, and support for booking-related issues. Before confirming a booking, we recommend checking the profile carefully and reviewing service details.' },
    { q: 'Is my data secure?', a: 'We use SSL encryption, we do not share your personal data with third parties, and we follow GDPR rules.' },
    { q: 'Which cities is PetPark available in?', a: 'Right now we are available in Zagreb, Rijeka, Split, Osijek, Zadar, Pula, Dubrovnik, Karlovac, Varaždin, and Šibenik. More cities are coming.' },
    { q: 'Is there a mobile app?', a: 'A mobile app is in progress. For now, the website is fully optimized for mobile devices.' },
  ],
} as const;

export const metadata: Metadata = {
  title: 'Često postavljena pitanja',
  description: 'Pronađite odgovore na najčešća pitanja o PetPark platformi — rezervacije, plaćanje, sigurnost, čuvanje ljubimaca i više.',
  keywords: ['FAQ', 'pitanja', 'pomoć', 'PetPark pitanja', 'kako funkcionira PetPark'],
  openGraph: {
    title: 'Često postavljena pitanja | PetPark',
    description: 'Odgovori na najčešća pitanja o PetPark platformi — rezervacije, plaćanje, sigurnost i više.',
    type: 'website',
    ...buildLocaleOpenGraph('/faq'),
  },
  alternates: buildLocaleAlternates('/faq'),
};

function FaqHero({ locale }: { locale: 'hr' | 'en' }) {
  const isEn = locale === 'en';

  return (
    <>
      <Badge className="mb-6 bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 border-0 text-sm px-5 py-2 rounded-full font-semibold animate-fade-in-up">
        <PawPrint className="h-3.5 w-3.5 mr-1.5" />
        {isEn ? 'Help and support' : 'Pomoć i podrška'}
      </Badge>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100 font-[var(--font-heading)]">
        {isEn ? 'Frequently asked ' : 'Često postavljana '}<span className="text-gradient">{isEn ? 'questions' : 'pitanja'}</span>
      </h1>
      <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed max-w-2xl mx-auto">
        {isEn ? 'Everything you need to know about PetPark in one place. If you can’t find the answer, just contact us.' : 'Sve što trebate znati o PetParku na jednom mjestu. Ako ne nalazite odgovor, javite nam se.'}
      </p>
    </>
  );
}

export function FaqPageShell({ locale }: { locale: 'hr' | 'en' }) {
  return (
    <PublicPageShell breadcrumbItems={[{ label: 'FAQ', href: locale === 'en' ? '/faq/en' : '/faq' }] }>
      <FAQJsonLd faqs={FAQ_ITEMS[locale]} />
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-orange-50 dark:from-teal-950/20 dark:via-background dark:to-orange-950/20">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <FaqHero locale={locale} />
          </div>
        </div>
      </section>

      <FaqContent />
    </PublicPageShell>
  );
}

export default function FaqPage() {
  return <FaqPageShell locale="hr" />;
}
