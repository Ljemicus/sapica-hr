'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  HeartHandshake,
  Map,
  MapPin,
  Megaphone,
  Phone,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  Badge,
  ButtonLink,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
  Select,
} from '@/components/shared/petpark/design-foundation';
import type { LostPet } from '@/lib/types';
import { CITIES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface LostPetsContentProps {
  initialPets?: LostPet[];
  forcedLanguage?: 'hr' | 'en';
}

type PetAlert = {
  id: string;
  name: string;
  species: 'pas' | 'macka' | 'ostalo';
  breed: string;
  city: string;
  neighborhood: string;
  date: string;
  status: 'lost' | 'found';
  description: string;
  contactName: string;
  contactPhone: string;
  imageUrl?: string | null;
  microchip?: boolean;
  collar?: boolean;
};

const fallbackPets: PetAlert[] = [
  {
    id: 'luna-rijeka',
    name: 'Luna',
    species: 'pas',
    breed: 'Lagotto romagnolo',
    city: 'Rijeka',
    neighborhood: 'Trsat',
    date: '2026-05-12',
    status: 'lost',
    description: 'Smeđa kujica srednje veličine, plašljiva ali prijateljska. Zadnji put viđena blizu parka.',
    contactName: 'Maja',
    contactPhone: '+385 91 000 0000',
    microchip: true,
    collar: true,
  },
  {
    id: 'milo-zagreb',
    name: 'Milo',
    species: 'macka',
    breed: 'Europska kratkodlaka',
    city: 'Zagreb',
    neighborhood: 'Maksimir',
    date: '2026-05-11',
    status: 'found',
    description: 'Pronađen pitom mačak sa sivom ogrlicom. Trenutno je na sigurnom kod nalaznika.',
    contactName: 'Petra',
    contactPhone: '+385 92 000 0000',
    collar: true,
  },
  {
    id: 'nora-split',
    name: 'Nora',
    species: 'pas',
    breed: 'Mješanac',
    city: 'Split',
    neighborhood: 'Spinut',
    date: '2026-05-10',
    status: 'lost',
    description: 'Manja crna kujica, boji se prometa. Molimo ne loviti naglo, samo javiti lokaciju.',
    contactName: 'Ivan',
    contactPhone: '+385 95 000 0000',
    microchip: true,
  },
  {
    id: 'tigi-osijek',
    name: 'Tigi',
    species: 'macka',
    breed: 'Narančasti mačak',
    city: 'Osijek',
    neighborhood: 'Retfala',
    date: '2026-05-09',
    status: 'found',
    description: 'Viđen i nahranjen više puta u istoj ulici. Traži se vlasnik ili privremeni smještaj.',
    contactName: 'Ana',
    contactPhone: '+385 99 000 0000',
  },
];

function mapLostPet(pet: LostPet): PetAlert {
  return {
    id: pet.id,
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    city: pet.city,
    neighborhood: pet.neighborhood,
    date: pet.found_at || pet.date_lost,
    status: pet.status === 'found' ? 'found' : 'lost',
    description: pet.description,
    contactName: pet.contact_name,
    contactPhone: pet.contact_phone,
    imageUrl: pet.image_url,
    microchip: pet.has_microchip,
    collar: pet.has_collar,
  };
}

function speciesLabel(species: PetAlert['species']) {
  if (species === 'macka') return 'Mačka';
  if (species === 'pas') return 'Pas';
  return 'Ljubimac';
}

function petEmoji(species: PetAlert['species']) {
  if (species === 'macka') return '🐈';
  if (species === 'pas') return '🐕';
  return '🐾';
}

function dateLabel(date: string) {
  return new Intl.DateTimeFormat('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
}

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

function PetAlertCard({ pet }: { pet: PetAlert }) {
  const isLost = pet.status === 'lost';

  return (
    <Card radius="28" interactive className="overflow-hidden">
      <div className={cn('relative flex h-52 items-center justify-center border-b border-[color:var(--pp-color-warm-border)]', isLost ? 'bg-[color:var(--pp-color-error-surface)]' : 'bg-[color:var(--pp-color-success-surface)]')}>
        <span className="text-7xl" aria-hidden>{petEmoji(pet.species)}</span>
        <Badge variant={isLost ? 'error' : 'success'} className="absolute left-4 top-4">
          {isLost ? 'Izgubljen' : 'Pronađen'}
        </Badge>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{pet.name}</h3>
            <p className="mt-1 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{speciesLabel(pet.species)} · {pet.breed}</p>
          </div>
          {pet.microchip ? <Badge variant="teal"><ShieldCheck className="size-3" /> čip</Badge> : null}
        </div>
        <p className="mt-4 line-clamp-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{pet.description}</p>
        <div className="mt-4 space-y-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
          <p className="flex items-center gap-2"><MapPin className="size-4 text-[color:var(--pp-color-orange-primary)]" /> {pet.city} · {pet.neighborhood}</p>
          <p className="flex items-center gap-2"><CalendarDays className="size-4 text-[color:var(--pp-color-teal-accent)]" /> {isLost ? 'Zadnji put viđen' : 'Pronađen'}: {dateLabel(pet.date)}</p>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <ButtonLink href={`/izgubljeni/${pet.id}`} variant="secondary" size="sm">Pogledaj detalje</ButtonLink>
          <ButtonLink href={`tel:${pet.contactPhone.replace(/\s/g, '')}`} size="sm"><Phone className="size-4" /> Kontaktiraj</ButtonLink>
        </div>
      </div>
    </Card>
  );
}

export function LostPetsContent({ initialPets = [] }: LostPetsContentProps) {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<'all' | 'pas' | 'macka'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const pets = useMemo(() => (initialPets.length ? initialPets.map(mapLostPet) : fallbackPets), [initialPets]);
  const urgentPet = pets.find((pet) => pet.status === 'lost') || pets[0];

  const filteredPets = pets.filter((pet) => {
    if (statusFilter !== 'all' && pet.status !== statusFilter) return false;
    if (speciesFilter !== 'all' && pet.species !== speciesFilter) return false;
    if (cityFilter !== 'all' && pet.city !== cityFilter) return false;
    if (dateFilter && pet.date !== dateFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${pet.name} ${pet.breed} ${pet.city} ${pet.neighborhood} ${pet.description}`.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <main data-petpark-route="izgubljeni" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <LeafDecoration className="-left-16 top-[760px] hidden scale-110 -rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[420px] hidden size-16 rotate-12 opacity-35 xl:block" />

        <div className="mx-auto max-w-[1500px] space-y-6">
          <Card radius="28" className="relative overflow-hidden p-6 sm:p-8 lg:p-10">
            <div className="absolute right-8 top-8 hidden size-32 rounded-full bg-[color:var(--pp-color-error-surface)] lg:block" />
            <div className="relative grid gap-8 xl:grid-cols-[1fr_420px] xl:items-end">
              <div>
                <Badge variant="error"><AlertTriangle className="size-3" /> Hitna ploča zajednice</Badge>
                <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)] sm:text-7xl lg:text-8xl">Izgubljeni i pronađeni ljubimci</h1>
                <p className="mt-6 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">
                  Brzo objavite upozorenje, pretražite lokacije i pomozite da se ljubimci vrate kući.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <ButtonLink href="/izgubljeni/prijavi" size="lg"><Megaphone className="size-5" /> Objavi upozorenje</ButtonLink>
                  <ButtonLink href="/izgubljeni/prijavi?status=found" variant="teal" size="lg"><CheckCircle2 className="size-5" /> Pronašao sam ljubimca</ButtonLink>
                </div>
              </div>

              <Card radius="28" tone="orange" className="p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">Aktivna potraga</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{urgentPet.name}</h2>
                <p className="mt-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{speciesLabel(urgentPet.species)} · {urgentPet.breed}</p>
                <div className="mt-4 space-y-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
                  <p className="flex items-center gap-2"><MapPin className="size-4 text-[color:var(--pp-color-orange-primary)]" /> {urgentPet.city} · {urgentPet.neighborhood}</p>
                  <p className="flex items-center gap-2"><CalendarDays className="size-4 text-[color:var(--pp-color-teal-accent)]" /> Zadnji put viđen: {dateLabel(urgentPet.date)}</p>
                </div>
                <ButtonLink href={`tel:${urgentPet.contactPhone.replace(/\s/g, '')}`} className="mt-5 w-full"><Phone className="size-4" /> Kontaktiraj vlasnika</ButtonLink>
              </Card>
            </div>
          </Card>

          <Card radius="28" className="p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-4">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                  <Input placeholder="Pretraži po imenu, pasmini, lokaciji..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-12" />
                </label>
                <div className="flex flex-wrap gap-2">
                  <FilterPill active={statusFilter === 'lost'} onClick={() => setStatusFilter(statusFilter === 'lost' ? 'all' : 'lost')}>Izgubljeni</FilterPill>
                  <FilterPill active={statusFilter === 'found'} onClick={() => setStatusFilter(statusFilter === 'found' ? 'all' : 'found')}>Pronađeni</FilterPill>
                  <FilterPill active={speciesFilter === 'pas'} onClick={() => setSpeciesFilter(speciesFilter === 'pas' ? 'all' : 'pas')}>Psi</FilterPill>
                  <FilterPill active={speciesFilter === 'macka'} onClick={() => setSpeciesFilter(speciesFilter === 'macka' ? 'all' : 'macka')}>Mačke</FilterPill>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:w-[420px]">
                <label className="space-y-2">
                  <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Lokacija</span>
                  <Select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
                    <option value="all">Svi gradovi</option>
                    {CITIES.map((city) => <option key={city} value={city}>{city}</option>)}
                  </Select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Datum</span>
                  <Input type="date" value={dateFilter} onChange={(event) => setDateFilter(event.target.value)} />
                </label>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-[color:var(--pp-color-muted-text)]">Aktivne objave</p>
                  <h2 className="mt-1 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{filteredPets.length} oglasa u pretrazi</h2>
                </div>
                <Badge variant="teal">Fallback siguran ako backend nema oglasa</Badge>
              </div>

              {filteredPets.length ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredPets.map((pet) => <PetAlertCard key={pet.id} pet={pet} />)}
                </div>
              ) : (
                <Card radius="28" tone="sage" className="p-10 text-center">
                  <Search className="mx-auto size-12 text-[color:var(--pp-color-orange-primary)]" />
                  <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">Nema oglasa za ovu pretragu.</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Promijenite filtere ili objavite novo upozorenje kako bi zajednica mogla pomoći.</p>
                </Card>
              )}
            </div>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <Card radius="28" tone="cream" className="overflow-hidden p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><Map className="size-5 text-[color:var(--pp-color-teal-accent)]" /> Karta viđenja</h2>
                  <Badge variant="sage">Preview</Badge>
                </div>
                <div className="relative mt-5 h-64 overflow-hidden rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-sage-surface)]">
                  <div className="absolute inset-x-8 top-1/2 h-px bg-[color:var(--pp-color-teal-accent)]/30" />
                  <div className="absolute inset-y-8 left-1/2 w-px bg-[color:var(--pp-color-orange-primary)]/25" />
                  {pets.slice(0, 4).map((pet, index) => (
                    <span
                      key={pet.id}
                      className={cn('absolute flex size-10 items-center justify-center rounded-full border-2 border-white text-white shadow-[var(--pp-shadow-small-card)]', pet.status === 'lost' ? 'bg-[color:var(--pp-color-error)]' : 'bg-[color:var(--pp-color-success)]')}
                      style={{ left: `${18 + index * 19}%`, top: `${24 + (index % 2) * 34}%` }}
                      title={pet.name}
                    >
                      <MapPin className="size-5" />
                    </span>
                  ))}
                </div>
                <ButtonLink href="/mapa?category=izgubljeni" className="mt-5 w-full" variant="secondary">Otvori mapu</ButtonLink>
              </Card>

              <Card radius="28" tone="orange" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><AlertTriangle className="size-5 text-[color:var(--pp-color-error)]" /> Sigurnosna napomena</h2>
                <div className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                  <p>Ne šaljite novac unaprijed osobama koje tvrde da su pronašle ljubimca.</p>
                  <p>Provjerite identitet prije susreta i dogovorite javno, sigurno mjesto.</p>
                  <p>Ako je situacija hitna ili sumnjiva, uključite lokalne službe.</p>
                </div>
              </Card>

              <Card radius="28" tone="teal" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]"><HeartHandshake className="size-5 text-[color:var(--pp-color-teal-accent)]" /> Kako pomoći</h2>
                <ul className="mt-4 space-y-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
                  <li>• Podijelite objavu u lokalne kvartovske grupe.</li>
                  <li>• Javite točnu lokaciju i vrijeme viđenja.</li>
                  <li>• Ne lovite plašljive životinje naglo.</li>
                </ul>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
