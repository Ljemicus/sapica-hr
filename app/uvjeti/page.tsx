import type { Metadata } from 'next';
import { FileText, Mail, AlertTriangle, Users, ShieldCheck, BookOpen, Ban, CreditCard, Camera, Scale, HeartHandshake } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Uvjeti korištenja',
  description: 'Uvjeti korištenja platforme PetPark. Pravila i odgovornosti korisnika, čuvara ljubimaca i vlasnika.',
  alternates: { canonical: 'https://petpark.hr/uvjeti' },
};

export default function UvjetiPage() {
  return (
    <div className="min-h-screen overflow-x-clip">
      {/* Hero */}
      <section className="organizations-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-6">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 font-[var(--font-heading)]">Uvjeti korištenja</h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Korištenjem platforme PetPark prihvaćate ove uvjete. Molimo vas da ih pažljivo pročitate.
          </p>
          <p className="text-sm text-white/60 mt-4">Posljednje ažuriranje: 24. ožujka 2026.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-10">

          {/* 1. Opći uvjeti */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Opći uvjeti</h2>
            <p className="text-muted-foreground leading-relaxed">
              PetPark (<a href="https://petpark.hr" className="text-orange-600 hover:underline">petpark.hr</a>)
              je online platforma koja povezuje vlasnike ljubimaca s čuvarima (sitterima), groomerima i trenerima.
              Korištenjem naše platforme pristajete na ove uvjete korištenja. Ako se ne slažete s ovim uvjetima,
              molimo vas da ne koristite platformu.
            </p>
          </section>

          {/* 2. Registracija */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">2. Registracija i korisnički račun</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Za korištenje većine funkcionalnosti platforme potreban je korisnički račun. Prilikom registracije obvezujete se:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Navesti točne i potpune podatke</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Redovito ažurirati svoje podatke</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Čuvati sigurnost svojih pristupnih podataka</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Biti stariji od 16 godina</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Imati samo jedan korisnički račun</li>
            </ul>
          </section>

          {/* 3. Odgovornosti korisnika (vlasnika) */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warm-orange/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-warm-orange" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">3. Odgovornosti vlasnika ljubimaca</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">Kao vlasnik ljubimaca koji koristi platformu, odgovorni ste za:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Pružanje točnih informacija o svom ljubimcu (zdravstveno stanje, ponašanje, posebne potrebe)</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Osiguravanje da je ljubimac cijepljen i zdrav za boravak kod sittera</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Pravovremenu komunikaciju sa sitterom</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Poštivanje dogovorenih uvjeta i rokova</li>
              <li className="flex gap-2"><span className="text-warm-orange font-bold">•</span>Plaćanje usluga prema dogovorenim cijenama</li>
            </ul>
          </section>

          {/* 4. Odgovornosti sittera */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-warm-teal/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-warm-teal" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">4. Odgovornosti čuvara (sittera)</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">Kao sitter na platformi, obvezujete se:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Pružati kvalitetnu brigu o ljubimcima u skladu s dogovorom</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Poštivati sve upute vlasnika o prehrani, lijekovima i rutini ljubimca</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Odmah obavijestiti vlasnika u slučaju bilo kakvih problema ili hitnih situacija</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Osigurati siguran i čist prostor za boravak ljubimca</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Navesti točne informacije u svom profilu (iskustvo, dostupnost, cijene)</li>
              <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Poštivati dogovorene termine rezervacija</li>
            </ul>
          </section>

          {/* 5. Rezervacije */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">5. Rezervacije i plaćanje</h2>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Rezervacije se dogovaraju izravno između vlasnika i sittera putem platforme.
                PetPark služi kao posrednik koji omogućuje povezivanje korisnika.
              </p>
              <p>
                Cijene usluga određuje sitter u svom profilu. Konačna cijena i uvjeti dogovaraju se
                između vlasnika i sittera prije potvrde rezervacije.
              </p>
              <p>
                Otkazivanje rezervacije trebalo bi se obaviti što ranije uz obavijest drugoj strani.
                Ponovljeno nepravovremeno otkazivanje može rezultirati ograničenjem pristupa platformi.
              </p>
            </div>
          </section>

          {/* 6. Sadržaj */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Camera className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">6. Pravila sadržaja</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Korisnici su odgovorni za sav sadržaj koji objavljuju na platformi (fotografije, recenzije, poruke, objave na forumu). Zabranjeno je objavljivati:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Uvredljiv, diskriminirajući ili prijeteći sadržaj',
                'Lažne ili obmanjujuće informacije',
                'Sadržaj koji krši autorska prava trećih strana',
                'Spam, neželjenu reklamu ili phishing',
                'Osobne podatke drugih korisnika bez njihova pristanka',
                'Sadržaj koji potiče na zlostavljanje životinja',
              ].map((item) => (
                <Card key={item} className="border-0 shadow-sm">
                  <CardContent className="pt-4 pb-4 flex items-start gap-2">
                    <Ban className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{item}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-muted-foreground mt-3">
              Zadržavamo pravo ukloniti bilo koji sadržaj koji krši ova pravila bez prethodne najave.
            </p>
          </section>

          {/* 7. Ograničenje odgovornosti */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">7. Ograničenje odgovornosti</h2>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                PetPark je platforma koja povezuje vlasnike ljubimaca i pružatelje usluga.
                Ne pružamo usluge čuvanja, njege ili dresure ljubimaca izravno.
              </p>
              <p>
                Ne odgovaramo za kvalitetu usluga koje pružaju sitteri, groomeri ili treneri registrirani na platformi.
                Ne odgovaramo za bilo kakvu štetu, ozljedu ili gubitak koji nastane kao rezultat korištenja platforme
                ili usluga pruženih putem platforme.
              </p>
              <p>
                Preporučujemo svim korisnicima da prije početka suradnje provjere reference sittera,
                dogovore se o uvjetima i poduzmu razumne mjere opreza.
              </p>
            </div>
          </section>

          {/* 8. Plaćanje i provizije */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">8. Plaćanje i provizije</h2>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Registracija i osnovno korištenje platforme je besplatno. Plaćanje usluga vrši se sigurno
                putem Stripe platnog sustava.
              </p>
              <p>
                PetPark naplaćuje <strong>proviziju od 10%</strong> na svaku uspješno obavljenu rezervaciju.
                Provizija se automatski odbija od ukupnog iznosa prije isplate sitteru/pružatelju usluge.
              </p>
              <p>
                <strong>Otkazivanje i povrat:</strong> Pravila otkazivanja ovise o vrsti usluge, dogovorenom terminu
                i statusu rezervacije. Ako pružatelj usluge otkaže potvrđenu rezervaciju, korisnik se može javiti
                podršci radi pomoći oko sljedećeg koraka i povrata prema važećim pravilima.
              </p>
              <p>
                <strong>Naknada nakon obavljene usluge:</strong> Nakon što je usluga uspješno obavljena,
                <strong>ne postoji mogućnost povrata novca</strong>. U slučaju nesuglasica ili pritužbi,
                molimo vas da kontaktirate korisničku podršku na info@petpark.hr.
              </p>
            </div>
          </section>

          {/* 8a. Udruge i donacije */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <HeartHandshake className="h-5 w-5 text-teal-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">8a. Udruge i donacije</h2>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                PetPark omogućuje udruge za zaštitu životinja da objavljuju apelacije za pomoć i prikupljanje donacija.
                Platforma služi isključivo kao poveznica između udruge i potencijalnih donatora.
              </p>
              <p>
                <strong>Važno:</strong> PetPark <strong>ne obrađuje donacije</strong>. Sve donacije idu izravno na račun udruge
                putem njihovog vanjskog linka za plaćanje. Mi nismo strana u financijskoj transakciji niti imamo uvid u točan iznos
                prikupljenih sredstava.
              </p>
              <p>
                Ne odgovaramo za način na koji udruge koriste prikupljena sredstva, ispunjavaju li objavljene ciljeve,
                niti za bilo kakvu štetu koja proizlazi iz donacije ili suradnje s udrugom.
              </p>
              <p>
                Verifikacija udruge na PetParku (plavi checkmark) potvrđuje isključivo da smo provjerili postojanje udruge
                i njezinu registraciju. To <strong>ne predstavlja pravnu garanciju</strong> niti jamstvo za rad udruge.
              </p>
              <p>
                Preporučujemo donatorima da prije donacije sami provjere rad udruge, njihovu reputaciju i transparentnost.
              </p>
            </div>
          </section>

          {/* 8b. Zabranjena ponašanja */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Ban className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">8b. Zabranjena ponašanja</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Sljedeća ponašanja su strogo zabranjena i mogu rezultirati trajnom suspenzijom računa:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>Zlostavljanje, zanemarivanje ili neadekvatna briga o ljubimcima</li>
              <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>Lažno predstavljanje, korištenje tuđih identiteta ili lažnih referenci</li>
              <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>Pokušaj izbjegavanja plaćanja putem platforme (dogovaranje &quot;ispod stola&quot;)</li>
              <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>Uznemiravanje, prijetnje ili diskriminacija drugih korisnika</li>
              <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>Korištenje platforme za ilegalne aktivnosti</li>
              <li className="flex gap-2"><span className="text-red-500 font-bold">•</span>Spam, phishing ili distribucija malicioznog sadržaja</li>
            </ul>
          </section>

          {/* 9. Gašenje računa */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Scale className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">9. Prekid korištenja i gašenje računa</h2>
            </div>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>
                Možete u bilo kojem trenutku zatvoriti svoj korisnički račun kontaktiranjem korisničke podrške
                na <a href="mailto:info@petpark.hr" className="text-orange-600 hover:underline">info@petpark.hr</a>.
              </p>
              <p>Zadržavamo pravo suspendirati ili trajno ukinuti korisnički račun u slučaju:</p>
              <ul className="space-y-2 ml-4">
                <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Kršenja ovih uvjeta korištenja</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Zlostavljanja ili zanemarivanja životinja</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Prijevarnog ili zlonamjernog ponašanja</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Ponavljajućih pritužbi drugih korisnika</li>
                <li className="flex gap-2"><span className="text-orange-500 font-bold">•</span>Kršenja zakona Republike Hrvatske</li>
              </ul>
            </div>
          </section>

          {/* 10. Intelektualno vlasništvo */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">10. Intelektualno vlasništvo</h2>
            <p className="text-muted-foreground leading-relaxed">
              Sav sadržaj platforme PetPark (logotipi, dizajn, tekst, grafike) zaštićen je autorskim pravima
              i vlasništvo je PetParka. Nije dopušteno kopiranje, distribucija ili komercijalna upotreba
              sadržaja bez prethodnog pisanog odobrenja.
            </p>
          </section>

          {/* 11. Promjene uvjeta */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">11. Promjene uvjeta korištenja</h2>
            <p className="text-muted-foreground leading-relaxed">
              Zadržavamo pravo izmjene ovih uvjeta korištenja. O svim značajnim promjenama obavijestit ćemo
              vas putem e-maila ili obavijesti na platformi. Nastavak korištenja platforme nakon objave
              izmjena smatra se prihvaćanjem novih uvjeta.
            </p>
          </section>

          {/* 12. Primjenjivo pravo */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">12. Primjenjivo pravo i rješavanje sporova</h2>
            <p className="text-muted-foreground leading-relaxed">
              Na ove uvjete korištenja primjenjuje se pravo Republike Hrvatske.
              Za sve sporove koji proizlaze iz korištenja platforme nadležan je sud u Zagrebu.
              Prije pokretanja sudskog postupka, obvezujemo se pokušati riješiti spor mirnim putem.
            </p>
          </section>

          {/* Kontakt */}
          <section className="bg-orange-50 rounded-2xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Trebate pojašnjenje?</h2>
                <p className="text-muted-foreground">
                  Za sva pitanja vezana uz ove uvjete korištenja, obratite nam se na{' '}
                  <a href="mailto:info@petpark.hr" className="text-orange-600 hover:underline font-medium">info@petpark.hr</a>.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
