'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Heart,
  HeartHandshake,
  Home,
  MapPin,
  PawPrint,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import {
  ADOPTION_GENDER_LABELS,
  ADOPTION_SIZE_LABELS,
  ADOPTION_SPECIES_EMOJI,
  CITIES,
  type AdoptionListingCard,
} from '@/lib/types';
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
  Select,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';

function formatAge(months: number | null): string {
  if (months == null) return 'Nepoznata dob';
  if (months < 12) return `${months} mj.`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years} g. ${rem} mj.` : `${years} g.`;
}

const fallbackListings: AdoptionListingCard[] = [
  {
    id: 'mila', status: 'active', name: 'Mila', species: 'dog', breed: 'Mješanac', age_months: 24, gender: 'female', size: 'medium', city: 'Rijeka', images: [], is_urgent: true, published_at: '2026-05-12', publisher_display_name: 'Udruga Šapice',
  },
  {
    id: 'toto', status: 'active', name: 'Toto', species: 'cat', breed: 'Europska kratkodlaka', age_months: 8, gender: 'male', size: 'small', city: 'Zagreb', images: [], is_urgent: false, published_at: '2026-05-11', publisher_display_name: 'Privremeni dom Maksimir',
  },
  {
    id: 'nala', status: 'active', name: 'Nala', species: 'dog', breed: 'Labrador mix', age_months: 36, gender: 'female', size: 'large', city: 'Split', images: [], is_urgent: false, published_at: '2026-05-10', publisher_display_name: 'Azil Split',
  },
  {
    id: 'zeko', status: 'active', name: 'Zeko', species: 'rabbit', breed: 'Patuljasti kunić', age_months: 14, gender: 'male', size: 'small', city: 'Osijek', images: [], is_urgent: false, published_at: '2026-05-09', publisher_display_name: 'Mali spas',
  },
];

const personalityTags: Record<string, string[]> = {
  mila: ['nježna', 'mirna', 'voli šetnje'],
  toto: ['mazan', 'znatiželjan', 'stan'],
  nala: ['aktivna', 'djeca ok', 'uči brzo'],
  zeko: ['tih', 'čist', 'mirni dom'],
};

function FilterPill({ active, children, onClick }: { active?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'min-h-11 rounded-full border px-4 text-sm font-black transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
        active
          ? 'border-[color:var(--pp-color-orange-primary)] bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-small-card)]'
          : 'border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]',
      )}
    >
      {children}
    </button>
  );
}

function AdoptionCard({ listing }: { listing: AdoptionListingCard }) {
  const primaryImage = listing.images?.find((img) => img.is_primary) ?? listing.images?.[0];
  const tags = personalityTags[listing.id] || ['društven', 'spreman za dom', 'provjeren kontakt'];

  return (
    <Link href={`/udomljavanje/${listing.id}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
      <Card radius="28" interactive className="h-full overflow-hidden">
        <div className="relative flex h-56 items-center justify-center border-b border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-sage-surface)]">
          {primaryImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={primaryImage.url} alt={primaryImage.alt || listing.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <>
              <span className="text-7xl transition duration-300 group-hover:scale-110" aria-hidden>{ADOPTION_SPECIES_EMOJI[listing.species]}</span>
              <PawDecoration className="right-5 top-5 size-12 opacity-70" />
            </>
          )}
          {listing.is_urgent ? <Badge variant="error" className="absolute left-4 top-4"><AlertTriangle className="size-3" /> Hitno</Badge> : null}
          <button type="button" aria-label={`Spremi ${listing.name}`} className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-[color:var(--pp-color-card-surface)] text-[color:var(--pp-color-orange-primary)] shadow-[var(--pp-shadow-small-card)]">
            <Heart className="size-5" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)]">{listing.name}</h3>
              <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{listing.breed || 'Ljubimac za udomljavanje'}</p>
            </div>
            <Badge variant="teal">{listing.species === 'dog' ? 'Pas' : listing.species === 'cat' ? 'Mačka' : 'Ostalo'}</Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="sage">{formatAge(listing.age_months)}</Badge>
            {listing.gender ? <Badge variant="sage">{ADOPTION_GENDER_LABELS[listing.gender]}</Badge> : null}
            {listing.size ? <Badge variant="sage">{ADOPTION_SIZE_LABELS[listing.size]}</Badge> : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => <Badge key={tag} variant="cream">{tag}</Badge>)}
          </div>

          <div className="mt-5 space-y-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
            <p className="flex items-center gap-2"><MapPin className="size-4 text-[color:var(--pp-color-orange-primary)]" /> {listing.city}</p>
            <p className="flex items-center gap-2"><HeartHandshake className="size-4 text-[color:var(--pp-color-teal-accent)]" /> {listing.publisher_display_name || 'Provjeren kontakt'}</p>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-[color:var(--pp-color-warm-border)] pt-4">
            <span className="text-sm font-black text-[color:var(--pp-color-orange-primary)]">Saznaj više</span>
            <ArrowRight className="size-4 text-[color:var(--pp-color-orange-primary)] transition group-hover:translate-x-1" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export function AdoptionBrowseContent({ listings }: { listings: AdoptionListingCard[]; forcedLanguage?: 'hr' | 'en' }) {
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'dog' | 'cat'>('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [urgentOnly, setUrgentOnly] = useState(false);

  const sourceListings = listings.length ? listings : fallbackListings;
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return sourceListings.filter((listing) => {
      if (speciesFilter !== 'all' && listing.species !== speciesFilter) return false;
      if (cityFilter !== 'all' && listing.city !== cityFilter) return false;
      if (sizeFilter !== 'all' && listing.size !== sizeFilter) return false;
      if (urgentOnly && !listing.is_urgent) return false;
      if (ageFilter === 'young' && (listing.age_months == null || listing.age_months > 18)) return false;
      if (ageFilter === 'adult' && (listing.age_months == null || listing.age_months <= 18)) return false;
      if (q) {
        const haystack = `${listing.name} ${listing.breed || ''} ${listing.city} ${listing.publisher_display_name || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [ageFilter, cityFilter, search, sizeFilter, sourceListings, speciesFilter, urgentOnly]);

  return (
    <main data-petpark-route="udomljavanje" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[760px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[400px] hidden size-16 rotate-12 opacity-40 xl:block" />

        <div className="mx-auto max-w-[1500px] space-y-6">
          <Card radius="28" className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="absolute right-8 top-8 hidden size-32 rounded-full bg-[color:var(--pp-color-warning-surface)] lg:block" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_420px] xl:items-end">
              <div>
                <Badge variant="orange"><HeartHandshake className="size-3" /> Novi dom</Badge>
                <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)] sm:text-7xl lg:text-8xl">Udomi ljubimca</h1>
                <p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">
                  Psi, mačke i drugi ljubimci koji čekaju siguran dom i ljude koji će ih voljeti.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ButtonLink href="#ljubimci" size="lg"><PawPrint className="size-5" /> Pogledaj ljubimce</ButtonLink>
                  <ButtonLink href="/udomljavanje/novo" variant="secondary" size="lg"><Home className="size-5" /> Objavi ljubimca za udomljavanje</ButtonLink>
                </div>
              </div>

              <Card radius="28" tone="sage" className="p-5">
                <Sparkles className="size-7 text-[color:var(--pp-color-orange-primary)]" />
                <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Udomljavanje bez pritiska</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Prvo upoznajte ljubimca i kontakt koji brine o njemu. Dobar dom je važniji od brzine.</p>
                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <Badge variant="teal">Psi</Badge>
                  <Badge variant="teal">Mačke</Badge>
                  <Badge variant="teal">Mali</Badge>
                </div>
              </Card>
            </div>
          </Card>

          <Card radius="28" className="p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-4">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                  <Input placeholder="Pretraži po imenu, pasmini, gradu..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-12" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={speciesFilter === 'dog'} onClick={() => setSpeciesFilter(speciesFilter === 'dog' ? 'all' : 'dog')}>Pas</FilterPill>
                  <FilterPill active={speciesFilter === 'cat'} onClick={() => setSpeciesFilter(speciesFilter === 'cat' ? 'all' : 'cat')}>Mačka</FilterPill>
                  <FilterPill active={urgentOnly} onClick={() => setUrgentOnly(!urgentOnly)}>Hitno</FilterPill>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:w-[620px]">
                <label className="space-y-2">
                  <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Dob</span>
                  <Select value={ageFilter} onChange={(event) => setAgeFilter(event.target.value)}>
                    <option value="all">Sve dobi</option>
                    <option value="young">Mladi</option>
                    <option value="adult">Odrasli</option>
                  </Select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Veličina</span>
                  <Select value={sizeFilter} onChange={(event) => setSizeFilter(event.target.value)}>
                    <option value="all">Sve</option>
                    <option value="small">Mali</option>
                    <option value="medium">Srednji</option>
                    <option value="large">Veliki</option>
                  </Select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Lokacija</span>
                  <Select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
                    <option value="all">Svi gradovi</option>
                    {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </Select>
                </label>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section id="ljubimci" className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">Ljubimci za udomljavanje</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{filtered.length} oglasa</h2>
                </div>
                <Badge variant="teal">Sigurni kontakti prvo</Badge>
              </div>

              {filtered.length ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((listing) => <AdoptionCard key={listing.id} listing={listing} />)}
                </div>
              ) : (
                <Card radius="28" tone="sage" className="p-10 text-center">
                  <HeartHandshake className="mx-auto size-12 text-[color:var(--pp-color-orange-primary)]" />
                  <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Trenutno nema ljubimaca koji odgovaraju filterima.</h2>
                  <Button className="mt-6" variant="secondary" onClick={() => { setSearch(''); setSpeciesFilter('all'); setCityFilter('all'); setSizeFilter('all'); setAgeFilter('all'); setUrgentOnly(false); }}>Očisti filtere</Button>
                </Card>
              )}
            </section>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <Card radius="28" tone="cream" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><ShieldCheck className="size-5 text-[color:var(--pp-color-teal-accent)]" /> Sigurno udomljavanje</h2>
                <div className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                  <p>Udomljavanje treba ići kroz provjerene udruge, azile ili jasne rescue kontakte.</p>
                  <p>Ne šaljite novac bez provjere identiteta i situacije.</p>
                  <p>Upoznajte ljubimca, pitajte za zdravlje, cijepljenja i navike.</p>
                </div>
              </Card>

              <Card radius="28" tone="orange" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><Heart className="size-5 text-[color:var(--pp-color-orange-primary)]" /> Prije odluke</h2>
                <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                  <li>• Provjerite imate li vrijeme i stabilne uvjete.</li>
                  <li>• Dogovorite probni susret ako je moguće.</li>
                  <li>• Pripremite prostor, hranu i veterinara.</li>
                </ul>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
