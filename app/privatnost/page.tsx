import type { Metadata } from 'next';
import { Shield, Mail, Lock, Eye, Trash2, Download, PenLine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Politika privatnosti',
  description: 'Politika privatnosti platforme PetPark. Saznajte kako prikupljamo, koristimo i štitimo vaše osobne podatke.',
  alternates: { canonical: 'https://petpark.hr/privatnost' },
};

export default function PrivatnostPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="organizations-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">Politika privatnosti</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Vaša privatnost nam je iznimno važna. Ovdje možete saznati kako prikupljamo, koristimo i štitimo vaše osobne podatke.
          </p>
          <p className="text-sm text-white/60 mt-4">Posljednje ažuriranje: 24. ožujka 2026.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-10">

          {/* 1. Voditelj obrade */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Voditelj obrade podataka</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Voditelj obrade vaših osobnih podataka je PetPark (petpark.hr), platforma sa sjedištem u Rijeci, Hrvatska,
              dostupna na adresi{' '}
              <a href="https://petpark.hr" className="text-warm-orange hover:underline">petpark.hr</a>.
            </p>
            <div className="bg-warm-orange/5 rounded-xl p-4 text-sm text-muted-foreground border border-warm-orange/10">
              <p className="font-semibold text-gray-900 mb-1">Službenik za zaštitu podataka (DPO)</p>
              <p>Email: <a href="mailto:dpo@petpark.hr" className="text-warm-orange hover:underline">dpo@petpark.hr</a></p>
              <p>Adresa: PetPark, Rijeka, Hrvatska</p>
            </div>
          </section>

          {/* 2. Koje podatke prikupljamo */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Koje podatke prikupljamo</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Prikupljamo samo podatke koji su neophodni za funkcioniranje platforme:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { title: 'Podaci o računu', desc: 'Ime i prezime, e-mail adresa, grad, broj telefona — podatci koje unosite prilikom registracije.' },
                { title: 'Autentikacija', desc: 'Koristimo Supabase za autentikaciju. Možete se registrirati putem e-maila i lozinke ili Google OAuth prijave.' },
                { title: 'Fotografije', desc: 'Fotografije ljubimaca, profilne fotografije i slike na forumu pohranjuju se u Supabase Storage.' },
                { title: 'Lokacija', desc: 'Grad i približna lokacija koriste se za povezivanje s čuvarima u vašoj blizini.' },
                { title: 'Podaci o korištenju', desc: 'Koristimo Plausible Analytics koji ne koristi kolačiće i ne prikuplja osobne podatke posjetitelja.' },
              ].map((item) => (
                <Card key={item.title} className="border-0 shadow-sm">
                  <CardContent className="pt-5">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* 3. Pravna osnova */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Pravna osnova obrade</h2>
            <p className="text-gray-600 leading-relaxed">
              Vaše podatke obrađujemo na temelju sljedećih pravnih osnova u skladu s Općom uredbom o zaštiti podataka (GDPR):
            </p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Izvršenje ugovora — kako bismo vam omogućili korištenje platforme (čl. 6. st. 1. toč. b GDPR-a)</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Privola — za Google OAuth prijavu i slanje obavijesti (čl. 6. st. 1. toč. a GDPR-a)</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Legitimni interes — za poboljšanje sigurnosti i funkcionalnosti platforme (čl. 6. st. 1. toč. f GDPR-a)</li>
            </ul>
          </section>

          {/* 4. Kolačići */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Kolačići</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Koristimo kolačiće za poboljšanje funkcionalnosti i korisničkog iskustva. 
              Kolačiće možete kontrolirati putem postavki u vašem pregledniku ili našeg bannera za privolu.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kategorije kolačića</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <h4 className="font-semibold text-gray-900">Neophodni kolačići</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Ovi kolačići su obavezni za rad stranice i ne mogu se isključiti. Uključuju kolačiće 
                  za autentikaciju (Supabase sesija), sigurnost i osnovnu funkcionalnost. 
                  Traju tijekom sesije ili do 30 dana za "zapamti me" funkciju.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h4 className="font-semibold text-gray-900">Analitički kolačići</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Pomažu nam razumjeti kako posjetitelji koriste stranicu. Koristimo Plausible Analytics 
                  koji poštuje privatnost i ne koristi kolačiće za praćenje pojedinačnih korisnika. 
                  Uvjetno učitavamo ove skripte samo uz vašu privolu.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <h4 className="font-semibold text-gray-900">Marketinški kolačići</h4>
                </div>
                <p className="text-sm text-gray-600">
                  Koriste se za prikaz relevantnih oglasa, remarketing i praćenje učinkovitosti 
                  marketinških kampanja. Učitavamo ove skripte (npr. Meta Pixel) samo uz vašu 
                  izričitu privolu.
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-warm-orange/5 rounded-xl border border-warm-orange/10">
              <p className="text-sm text-gray-700">
                <strong>Upravljanje kolačićima:</strong> Možete promijeniti svoje preference u bilo kojem 
                trenutku klikom na gumb "Postavke kolačića" u podnožju stranice ili na link ispod.
              </p>
            </div>
          </section>

          {/* 5. Dijeljenje podataka */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Dijeljenje podataka s trećim stranama</h2>
            <p className="text-gray-600 leading-relaxed">
              Vaše podatke ne prodajemo niti dijelimo s trećim stranama u marketinške svrhe. Podatke dijelimo isključivo s:
            </p>
            <ul className="mt-3 space-y-2 text-gray-600">
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span><strong>Supabase</strong> — za autentikaciju, bazu podataka i pohranu datoteka (serveri u EU)</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span><strong>Google</strong> — samo ako koristite Google OAuth prijavu, u skladu s Googleovom politikom privatnosti</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span><strong>Vercel</strong> — za hosting platforme</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span><strong>Plausible Analytics</strong> — anonimna analitika bez osobnih podataka</li>
            </ul>
          </section>

          {/* 6. Vaša prava */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Vaša prava</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              U skladu s GDPR-om, imate sljedeća prava:
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: Eye, title: 'Pravo pristupa', desc: 'Imate pravo zatražiti uvid u sve osobne podatke koje pohranjujemo o vama.' },
                { icon: PenLine, title: 'Pravo na ispravak', desc: 'Možete zatražiti ispravak netočnih ili nepotpunih podataka.' },
                { icon: Trash2, title: 'Pravo na brisanje', desc: 'Možete zatražiti brisanje vaših osobnih podataka ("pravo na zaborav").' },
                { icon: Download, title: 'Pravo na prenosivost', desc: 'Možete zatražiti kopiju vaših podataka u strukturiranom formatu.' },
                { icon: Lock, title: 'Pravo na ograničenje', desc: 'Možete zatražiti ograničenje obrade vaših podataka.' },
                { icon: Shield, title: 'Pravo na prigovor', desc: 'Imate pravo uložiti prigovor nadležnom tijelu za zaštitu podataka (AZOP).' },
              ].map((item) => (
                <div key={item.title} className="community-section-card p-5">
                  <div className="w-10 h-10 rounded-xl bg-warm-orange/10 flex items-center justify-center mb-3">
                    <item.icon className="h-5 w-5 text-warm-orange" />
                  </div>
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-gray-600 mt-4">
              Za ostvarivanje bilo kojeg od navedenih prava, kontaktirajte nas na{' '}
              <a href="mailto:info@petpark.hr" className="text-warm-orange hover:underline">info@petpark.hr</a>.
              Na vaš zahtjev odgovorit ćemo u roku od 30 dana.
            </p>
          </section>

          {/* 7. Sigurnost */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sigurnost podataka</h2>
            <p className="text-gray-600 leading-relaxed">
              Primjenjujemo odgovarajuće tehničke i organizacijske mjere za zaštitu vaših osobnih podataka,
              uključujući enkripciju podataka u prijenosu (TLS/SSL), sigurnu pohranu lozinki putem hashiranja
              i redovite sigurnosne provjere. Pristup vašim podacima imaju samo ovlaštene osobe.
            </p>
          </section>

          {/* 8. Čuvanje podataka */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Razdoblje čuvanja podataka</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              Vaše osobne podatke čuvamo dok je vaš račun aktivan. Nakon brisanja računa,
              vaši podaci bit će trajno izbrisani u roku od 30 dana, osim ako zakonske obveze
              zahtijevaju dulje čuvanje određenih podataka.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Korisnički profil: dok je račun aktivan + 30 dana</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Poruke: 1 godina nakon slanja</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Financijski podaci: 5 godina (zakonska obveza)</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Fotografije: brišu se zajedno s profilom ili na zahtjev</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Analitički podaci: anonimizirani, bez vremenskog ograničenja</li>
            </ul>
          </section>

          {/* 9. Maloljetnici */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Zaštita maloljetnika</h2>
            <p className="text-gray-600 leading-relaxed">
              Naša platforma namijenjena je osobama starijim od 16 godina. Svjesno ne prikupljamo
              osobne podatke djece mlađe od 16 godina. Ako saznamo da smo prikupili podatke maloljetne
              osobe bez pristanka roditelja, poduzet ćemo korake za brisanje tih podataka.
            </p>
          </section>

          {/* 10. Promjene */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Promjene politike privatnosti</h2>
            <p className="text-gray-600 leading-relaxed">
              Zadržavamo pravo izmjene ove politike privatnosti. O svim značajnim promjenama
              obavijestit ćemo vas putem e-maila ili obavijesti na platformi. Preporučujemo
              da povremeno provjerite ovu stranicu.
            </p>
          </section>

          {/* Kontakt */}
          <section className="bg-warm-orange/5 rounded-2xl p-6 md:p-8 border border-warm-orange/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-warm-orange/10 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-warm-orange" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Imate pitanja?</h2>
                <p className="text-muted-foreground">
                  Za sva pitanja vezana uz zaštitu vaših osobnih podataka, obratite nam se na{' '}
                  <a href="mailto:info@petpark.hr" className="text-warm-orange hover:underline font-medium">info@petpark.hr</a>.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
