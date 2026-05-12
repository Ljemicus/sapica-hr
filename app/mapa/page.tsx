import type { Metadata } from 'next';
import Link from 'next/link';
import { Bell, CheckCircle2, Crosshair, Dog, Home, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';
import {
  AppHeader,
  Badge,
  Button,
  ButtonLink,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'PetPark mapa | PetPark',
  description: 'Pronađi usluge, izgubljene ljubimce i korisne lokacije u blizini kroz PetPark mapu.',
};

const navItems = [
  { href: '/usluge', label: 'Usluge' },
  { href: '/izgubljeni', label: 'Izgubljeni' },
  { href: '/udomljavanje', label: 'Udomljavanje' },
  { href: '/zajednica', label: 'Zajednica' },
];

const filters = ['Usluge', 'Sitteri', 'Groomeri', 'Treneri', 'Izgubljeni', 'Pronađeni', 'Udomljavanje'];

const places = [
  { title: 'Maja Pet Sitting', type: 'Sitter', location: 'Rijeka · Trsat', href: '/usluge', tone: 'orange' as const, x: 28, y: 36, icon: Home },
  { title: 'Grooming Luna', type: 'Groomer', location: 'Zagreb · Maksimir', href: '/usluge', tone: 'orange' as const, x: 62, y: 31, icon: Sparkles },
  { title: 'Pronađena maca', type: 'Pronađeni', location: 'Rijeka · Mlaka', href: '/izgubljeni', tone: 'success' as const, x: 42, y: 62, icon: CheckCircle2 },
  { title: 'Nestao pas Roko', type: 'Izgubljeni', location: 'Split · Spinut', href: '/izgubljeni', tone: 'error' as const, x: 74, y: 68, icon: Bell },
  { title: 'Udruga Šapice', type: 'Udomljavanje', location: 'Osijek', href: '/udomljavanje', tone: 'teal' as const, x: 52, y: 48, icon: Dog },
];

function Pin({ place, selected = false }: { place: (typeof places)[number]; selected?: boolean }) {
  const Icon = place.icon;
  return (
    <Link
      href={place.href}
      className={cn(
        'absolute flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white text-white shadow-[var(--pp-shadow-soft-card)] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]',
        place.tone === 'orange' && 'bg-[color:var(--pp-color-orange-primary)]',
        place.tone === 'teal' && 'bg-[color:var(--pp-color-teal-accent)]',
        place.tone === 'success' && 'bg-[color:var(--pp-color-success)]',
        place.tone === 'error' && 'bg-[color:var(--pp-color-error)]',
        selected && 'scale-110 ring-4 ring-[color:var(--pp-color-warning-surface)]',
      )}
      style={{ left: `${place.x}%`, top: `${place.y}%` }}
      aria-label={place.title}
    >
      <Icon className="size-5" />
    </Link>
  );
}

export default function MapPage() {
  const selected = places[0];

  return (
    <main data-petpark-route="mapa" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/pretraga" size="sm">Pretraga</ButtonLink>} />

      <section className="relative px-5 pb-10 pt-8 sm:px-8 lg:px-16">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[360px] hidden size-16 rotate-12 opacity-35 xl:block" />

        <div className="mx-auto max-w-[1500px] space-y-6">
          <Card radius="28" className="p-6 sm:p-8">
            <Badge variant="orange"><MapPin className="size-3" /> Lokalni pregled</Badge>
            <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)] sm:text-7xl">PetPark mapa</h1>
                <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">Pronađi usluge, izgubljene ljubimce i korisne lokacije u blizini.</p>
              </div>
              <Button variant="secondary" disabled><Crosshair className="size-4" /> Koristi moju lokaciju</Button>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <aside className="space-y-5 xl:sticky xl:top-24 xl:self-start">
              <Card radius="28" className="p-5">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" />
                  <Input placeholder="Grad, kvart ili adresa" className="pl-12" />
                </label>
                <div className="mt-5 flex flex-wrap gap-2">
                  {filters.map((filter, index) => <Badge key={filter} variant={index < 4 ? 'orange' : index === 5 ? 'success' : 'teal'}>{filter}</Badge>)}
                </div>
              </Card>

              <Card radius="28" tone="sage" className="p-5">
                <h2 className="text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">U blizini</h2>
                <div className="mt-4 space-y-3">
                  {places.map((place) => {
                    const Icon = place.icon;
                    return (
                      <Link key={place.title} href={place.href} className="flex items-center gap-3 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-card-surface)] p-3 shadow-[var(--pp-shadow-small-card)] transition hover:-translate-y-0.5">
                        <span className="flex size-11 items-center justify-center rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]"><Icon className="size-5" /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black text-[color:var(--pp-color-forest-text)]">{place.title}</span>
                          <span className="block text-xs font-bold text-[color:var(--pp-color-muted-text)]">{place.location}</span>
                        </span>
                        <Badge variant="teal">{place.type}</Badge>
                      </Link>
                    );
                  })}
                </div>
              </Card>
            </aside>

            <section className="min-h-[680px] overflow-hidden rounded-[var(--pp-radius-card-28)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-sage-surface)] shadow-[var(--pp-shadow-soft-card)]">
              <div className="relative h-[680px] overflow-hidden">
                <div className="absolute inset-0 opacity-70" style={{ backgroundImage: 'linear-gradient(90deg, rgba(45, 109, 104, .12) 1px, transparent 1px), linear-gradient(rgba(45, 109, 104, .12) 1px, transparent 1px)', backgroundSize: '72px 72px' }} />
                <div className="absolute left-[8%] top-[18%] h-[62%] w-[78%] rounded-[48%] border-[18px] border-[color:var(--pp-color-card-surface)]/70" />
                <div className="absolute left-[18%] top-[30%] h-[38%] w-[62%] -rotate-12 rounded-[45%] border-[14px] border-[color:var(--pp-color-cream-surface)]/80" />
                <div className="absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-[color:var(--pp-color-sage-surface-strong)] to-transparent" />

                {places.map((place, index) => <Pin key={place.title} place={place} selected={index === 0} />)}

                <Card radius="24" className="absolute bottom-6 left-6 right-6 max-w-md p-5 sm:right-auto">
                  <Badge variant="orange"><ShieldCheck className="size-3" /> Odabrano</Badge>
                  <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[color:var(--pp-color-forest-text)]">{selected.title}</h2>
                  <p className="mt-2 text-sm font-bold text-[color:var(--pp-color-muted-text)]">{selected.location}</p>
                  <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Ilustrativni pin za buduću realnu mapu. SDK i geolokacija nisu spojeni u ovom prolazu.</p>
                  <ButtonLink href={selected.href} className="mt-5" size="sm">Otvori detalje</ButtonLink>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
