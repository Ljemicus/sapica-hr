'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Users, CreditCard, ShieldCheck, Info, ArrowRight, Search, Scissors, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { id: 'vlasnici', label: 'Za vlasnike', icon: HelpCircle },
  { id: 'sitteri', label: 'Za sittere', icon: Users },
  { id: 'placanje', label: 'Plaćanje', icon: CreditCard },
  { id: 'sigurnost', label: 'Sigurnost', icon: ShieldCheck },
  { id: 'opcenito', label: 'Općenito', icon: Info },
] as const;

type CategoryId = (typeof CATEGORIES)[number]['id'];

const FAQ_DATA: Record<CategoryId, { q: string; a: string }[]> = {
  vlasnici: [
    {
      q: 'Kako funkcionira rezervacija?',
      a: 'Pretražite sittere u vašem gradu, pregledajte profile i recenzije te pošaljite upit za željene datume. Sitter potvrđuje termin, a vi zatim dovršavate rezervaciju.',
    },
    {
      q: 'Mogu li otkazati rezervaciju?',
      a: 'Da, besplatno otkazivanje do 24 sata prije početka. Otkazivanja unutar 24 sata podliježu naknadi od 50%. Detalji su navedeni u Uvjetima korištenja.',
    },
    {
      q: 'Što ako se ljubimac razboli tijekom čuvanja?',
      a: 'Sitter vas odmah kontaktira i zajedno reagirate. U hitnim slučajevima preporučujemo da s vlasnicima unaprijed dogovorite veterinara i kontakt.',
    },
    {
      q: 'Kako funkcioniraju recenzije?',
      a: 'Nakon svake završene rezervacije možete ostaviti recenziju i ocjenu (1-5 zvjezdica). Recenzije su javne i pomažu drugim vlasnicima.',
    },
    {
      q: 'Mogu li posjetiti ljubimca tijekom čuvanja?',
      a: 'Naravno! Dogovorite se sa sitterom o posjetu. Većina sittera rado šalje foto i video ažuriranja svaki dan.',
    },
  ],
  sitteri: [
    {
      q: 'Kako postati sitter?',
      a: 'Registrirajte se, ispunite profil, dodajte slike i opišite iskustvo. Naš tim pregledava zahtjev i javljamo se u roku nekoliko radnih dana.',
    },
    {
      q: 'Kako funkcionira verifikacija?',
      a: 'Prije objave profila provjeravamo osnovne podatke, identitet i relevantne informacije o iskustvu. Verificirani profili imaju jasnu oznaku na PetParku.',
    },
    {
      q: 'Koliko mogu zaraditi?',
      a: 'Ovisi o lokaciji, uslugama i cijenama. Prihodi ovise o gradu, broju rezervacija i cijenama. Vi postavljate vlastite cijene.',
    },
    {
      q: 'Mogu li odbiti rezervaciju?',
      a: 'Da, potpuno kontrolirate svoj raspored. Možete prihvatiti ili odbiti svaki upit bez posljedica.',
    },
    {
      q: 'Trebam li posebno osiguranje?',
      a: 'Uvjeti pokrića ovise o modelu suradnje i aktualnim pravilima platforme. Ako vam je osiguranje bitno, provjerite važeće uvjete ili se javite podršci prije prihvaćanja upita.',
    },
  ],
  placanje: [
    {
      q: 'Koji načini plaćanja su dostupni?',
      a: 'Kartično plaćanje (Visa, Mastercard), Apple Pay i Google Pay. Načini plaćanja mogu ovisiti o dostupnosti i aktivnim integracijama na platformi.',
    },
    {
      q: 'Kada sitter prima uplatu?',
      a: 'Isplata se obrađuje 48 sati nakon uspješnog završetka rezervacije, direktno na bankovni račun sittera.',
    },
    {
      q: 'Kolika je provizija PetParka?',
      a: 'PetPark naplaćuje 10% provizije na svaku rezervaciju. Registracija i korištenje platforme su potpuno besplatni.',
    },
    {
      q: 'Mogu li dobiti povrat novca?',
      a: 'Da, u slučaju otkazivanja prema pravilima ili nezadovoljstva uslugom. Kontaktirajte podršku unutar 24 sata.',
    },
  ],
  sigurnost: [
    {
      q: 'Kako PetPark osigurava sigurnost ljubimaca?',
      a: 'PetPark koristi verifikaciju profila, recenzije korisnika i podršku za probleme s rezervacijom. Prije potvrde termina preporučujemo da provjerite profil i detalje usluge.',
    },
    {
      q: 'Što ako imam problem sa sitterom?',
      a: 'Kontaktirajte našu podršku putem emaila info@petpark.hr. Odgovaramo pon–sub 8–20h, u roku od jednog radnog dana.',
    },
    {
      q: 'Jesu li moji podaci sigurni?',
      a: 'Koristimo SSL enkripciju, ne dijelimo podatke s trećim stranama i pridržavamo se GDPR propisa.',
    },
    {
      q: 'Ima li PetPark osiguranje?',
      a: 'Radimo na uvođenju osiguranja za rezervacije. Detalje o pokriću pratite na stranici uvjeta korištenja ili nas kontaktirajte.',
    },
  ],
  opcenito: [
    {
      q: 'U kojim gradovima je PetPark dostupan?',
      a: 'Trenutno smo dostupni u Zagrebu, Rijeci, Splitu, Osijeku, Zadru, Puli, Dubrovniku, Karlovcu, Varaždinu i Šibeniku. Širimo se!',
    },
    {
      q: 'Kako kontaktirati podršku?',
      a: 'Email: info@petpark.hr ili kontakt forma na stranici. Podrška odgovara u radnom vremenu navedenom na PetParku.',
    },
    {
      q: 'Mogu li koristiti PetPark za mačke i male životinje?',
      a: 'Da! PetPark nije samo za pse. Pronađite sittere za mačke, kuniće, ptice, ribice i druge ljubimce.',
    },
    {
      q: 'Postoji li mobilna aplikacija?',
      a: 'Mobilna aplikacija je u razvoju! Trenutno koristite web stranicu koja je potpuno prilagođena mobilnim uređajima.',
    },
  ],
};

export function FaqContent() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>('vlasnici');
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const faqs = FAQ_DATA[activeCategory];

  return (
    <>
      {/* Category Pills */}
      <section className="container mx-auto px-4 pt-12 pb-4">
        <div className="flex flex-wrap justify-center gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setOpenItems(new Set());
                }}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ Items */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => {
            const key = `${activeCategory}-${i}`;
            const isOpen = openItems.has(key);
            return (
              <Card
                key={key}
                className={`border-0 shadow-sm rounded-2xl cursor-pointer transition-all animate-fade-in-up delay-${(i + 1) * 100}`}
                onClick={() => toggleItem(key)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-bold text-base flex-1">{faq.q}</h3>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                  {isOpen && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                      {faq.a}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Explore services */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6 font-[var(--font-heading)]">Istražite naše usluge</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/pretraga" className="group">
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-background hover:border-orange-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500">
                  <Search className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm group-hover:text-orange-500 transition-colors">Čuvanje ljubimaca</h3>
                  <p className="text-xs text-muted-foreground truncate">Pronađite sittera</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors flex-shrink-0" />
              </div>
            </Link>
            <Link href="/njega" className="group">
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-background hover:border-pink-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-500">
                  <Scissors className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm group-hover:text-pink-500 transition-colors">Grooming</h3>
                  <p className="text-xs text-muted-foreground truncate">Šišanje i njega</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-pink-500 transition-colors flex-shrink-0" />
              </div>
            </Link>
            <Link href="/dresura" className="group">
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 bg-background hover:border-indigo-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm group-hover:text-indigo-500 transition-colors">Školovanje pasa</h3>
                  <p className="text-xs text-muted-foreground truncate">Treneri i programi</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-500 transition-colors flex-shrink-0" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="border-0 shadow-sm rounded-3xl bg-gradient-to-r from-orange-500 to-teal-500 overflow-hidden">
          <CardContent className="p-10 md:p-16 text-center text-white relative">
            <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">
                Još imate pitanja?
              </h2>
              <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
                Naš tim za podršku je tu za vas. Javite nam se i odgovorit ćemo što je brže moguće.
              </p>
              <Link href="/kontakt">
                <Button
                  size="lg"
                  className="bg-white text-orange-600 hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl font-bold text-lg px-10 h-14"
                >
                  Javite nam se
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
