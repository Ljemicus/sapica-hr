import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell, CalendarDays, CheckCircle2, MessageCircle, PawPrint, Settings, ShieldAlert, Syringe, UsersRound } from 'lucide-react';
import {
  AppHeader,
  Badge,
  ButtonLink,
  Card,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { getAuthUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Upozorenja | PetPark',
  description: 'PetPark centar za poruke, rezervacije, izgubljene ljubimce i podsjetnike.',
};

const navItems = [
  { href: '/poruke', label: 'Poruke' },
  { href: '/kalendar', label: 'Kalendar' },
  { href: '/pet-passport', label: 'Pet Passport' },
  { href: '/postavke', label: 'Postavke' },
];

const tabs = ['Sve', 'Važno', 'Poruke', 'Rezervacije', 'Ljubimci', 'Zajednica'];

const notifications = [
  { title: 'Nestao pas Roko u Spinutu', description: 'Nova hitna objava u vašem području. Ako ste u blizini, provjerite detalje i podijelite.', time: 'prije 8 min', category: 'Važno', href: '/izgubljeni', icon: ShieldAlert, tone: 'error' as const, unread: true },
  { title: 'Maca Milo je pronađena', description: 'Objava koju ste pratili označena je kao pronađena i sigurna.', time: 'prije 24 min', category: 'Ljubimci', href: '/izgubljeni', icon: CheckCircle2, tone: 'success' as const, unread: true },
  { title: 'Nova poruka od Maje', description: 'Maja je odgovorila na upit za čuvanje preko vikenda.', time: 'prije 1 h', category: 'Poruke', href: '/poruke', icon: MessageCircle, tone: 'teal' as const, unread: true },
  { title: 'Rezervacija prihvaćena', description: 'Termin za grooming je potvrđen za petak u 17:30.', time: 'danas 12:10', category: 'Rezervacije', href: '/kalendar', icon: CalendarDays, tone: 'success' as const, unread: false },
  { title: 'Podsjetnik prije rezervacije', description: 'Sutra imate dogovorenu šetnju. Provjerite lokaciju i napomene.', time: 'danas 09:00', category: 'Rezervacije', href: '/kalendar/dan', icon: Bell, tone: 'orange' as const, unread: false },
  { title: 'Cjepivo uskoro istječe', description: 'Pet Passport podsjetnik: provjerite godišnje cijepljenje za Lunu.', time: 'jučer', category: 'Ljubimci', href: '/pet-passport', icon: Syringe, tone: 'orange' as const, unread: false },
  { title: 'Odgovor u zajednici', description: 'Netko je odgovorio na vašu temu o socijalizaciji šteneta.', time: 'jučer', category: 'Zajednica', href: '/zajednica', icon: UsersRound, tone: 'teal' as const, unread: false },
];

function NotificationCard({ item }: { item: (typeof notifications)[number] }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)] focus-visible:ring-offset-2">
      <Card radius="28" interactive className={cn('p-5', item.unread && 'border-[color:var(--pp-color-orange-primary)]/35')}>
        <div className="flex items-start gap-4">
          <span className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-[var(--pp-radius-control)] text-white shadow-[var(--pp-shadow-small-card)]',
            item.tone === 'error' && 'bg-[color:var(--pp-color-error)]',
            item.tone === 'success' && 'bg-[color:var(--pp-color-success)]',
            item.tone === 'teal' && 'bg-[color:var(--pp-color-teal-accent)]',
            item.tone === 'orange' && 'bg-[color:var(--pp-color-orange-primary)]',
          )}>
            <Icon className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={item.tone === 'error' ? 'error' : item.tone === 'success' ? 'success' : item.tone === 'orange' ? 'orange' : 'teal'}>{item.category}</Badge>
              {item.unread ? <Badge variant="orange">Novo</Badge> : <Badge variant="sage">Pročitano</Badge>}
              <span className="text-xs font-black text-[color:var(--pp-color-muted-text)]">{item.time}</span>
            </div>
            <h2 className="mt-3 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)] group-hover:text-[color:var(--pp-color-orange-primary)]">{item.title}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{item.description}</p>
            <span className="mt-4 inline-flex text-sm font-black text-[color:var(--pp-color-orange-primary)]">Otvori</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function AlertsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fupozorenja');

  return (
    <main data-petpark-route="upozorenja" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <AppHeader navItems={navItems} actions={<ButtonLink href="/postavke" size="sm"><Settings className="size-4" /> Postavke</ButtonLink>} />

      <section className="relative px-5 pb-12 pt-10 sm:px-8 lg:px-20">
        <LeafDecoration className="-right-12 top-24 hidden rotate-12 lg:block" />
        <PawDecoration className="right-[12%] top-[360px] hidden size-16 rotate-12 opacity-35 xl:block" />

        <div className="mx-auto max-w-[1500px] space-y-6">
          <Card radius="28" className="p-6 sm:p-8 lg:p-10">
            <Badge variant="orange"><Bell className="size-3" /> Centar obavijesti</Badge>
            <h1 className="mt-5 text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)] sm:text-7xl">Upozorenja</h1>
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">Poruke, rezervacije, izgubljeni ljubimci i podsjetnici na jednom mjestu.</p>
          </Card>

          <Card radius="24" className="p-3">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {tabs.map((tab, index) => (
                <button key={tab} type="button" className={cn('shrink-0 rounded-[var(--pp-radius-control)] px-4 py-3 text-sm font-black transition', index === 0 ? 'bg-[color:var(--pp-color-orange-primary)] text-white shadow-[var(--pp-shadow-small-card)]' : 'text-[color:var(--pp-color-muted-text)] hover:bg-[color:var(--pp-color-sage-surface)] hover:text-[color:var(--pp-color-forest-text)]')}>{tab}</button>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <section className="space-y-4">
              {notifications.length ? notifications.map((item) => <NotificationCard key={item.title} item={item} />) : (
                <Card radius="28" tone="sage" className="p-10 text-center">
                  <Bell className="mx-auto size-12 text-[color:var(--pp-color-orange-primary)]" />
                  <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">Nema novih upozorenja.</h2>
                  <p className="mt-3 text-sm font-semibold text-[color:var(--pp-color-muted-text)]">Kad se nešto važno dogodi, pojavit će se ovdje.</p>
                </Card>
              )}
            </section>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <Card radius="28" tone="cream" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em]"><Settings className="size-5 text-[color:var(--pp-color-orange-primary)]" /> Preference</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Uredi koje vrste obavijesti želiš primati.</p>
                <ButtonLink href="/postavke" className="mt-5 w-full" variant="secondary">Otvori postavke</ButtonLink>
              </Card>

              <Card radius="28" tone="orange" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em]"><ShieldAlert className="size-5 text-[color:var(--pp-color-error)]" /> Sigurnost</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Za izgubljene ljubimce provjerite identitet i ne šaljite novac unaprijed.</p>
              </Card>

              <Card radius="28" tone="teal" className="p-5">
                <h2 className="text-xl font-black tracking-[-0.03em]">Brzi linkovi</h2>
                <div className="mt-4 grid gap-2">
                  <ButtonLink href="/poruke" variant="secondary" className="justify-start"><MessageCircle className="size-4" /> Poruke</ButtonLink>
                  <ButtonLink href="/kalendar" variant="secondary" className="justify-start"><CalendarDays className="size-4" /> Kalendar</ButtonLink>
                  <ButtonLink href="/pet-passport" variant="secondary" className="justify-start"><PawPrint className="size-4" /> Pet Passport</ButtonLink>
                </div>
              </Card>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
