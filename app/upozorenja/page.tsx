import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Bell, CalendarDays, MessageCircle, PawPrint, Settings, ShieldAlert } from 'lucide-react';
import {
  AppHeader,
  Badge,
  ButtonLink,
  Card,
  LeafDecoration,
  PawDecoration,
} from '@/components/shared/petpark/design-foundation';
import { NotificationReadAction } from '@/components/shared/petpark/notification-read-action';
import { getAuthUser } from '@/lib/auth';
import { getNotificationsForProfile, type BookingRequestNotificationSummary } from '@/lib/petpark/booking-requests/activity';
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

const tabs = ['Sve', 'Booking upiti', 'Nepročitano', 'Pročitano'];

function notificationTone(type: BookingRequestNotificationSummary['type']) {
  if (type === 'booking_request_created') return 'orange' as const;
  if (type === 'booking_request_withdrawn') return 'error' as const;
  if (type === 'booking_request_closed') return 'sage' as const;
  return 'teal' as const;
}

function NotificationCard({ item }: { item: BookingRequestNotificationSummary }) {
  const tone = notificationTone(item.type);
  const unread = !item.readAt;

  return (
    <Card radius="28" interactive className={cn('p-5', unread && 'border-[color:var(--pp-color-orange-primary)]/35')}>
      <div className="flex items-start gap-4">
        <span className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-[var(--pp-radius-control)] text-white shadow-[var(--pp-shadow-small-card)]',
          tone === 'error' && 'bg-[color:var(--pp-color-error)]',
          tone === 'sage' && 'bg-[color:var(--pp-color-muted-text)]',
          tone === 'teal' && 'bg-[color:var(--pp-color-teal-accent)]',
          tone === 'orange' && 'bg-[color:var(--pp-color-orange-primary)]',
        )}>
          <Bell className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={tone === 'error' ? 'error' : tone === 'orange' ? 'orange' : tone === 'teal' ? 'teal' : 'sage'}>Booking upit</Badge>
            {unread ? <Badge variant="orange">Novo</Badge> : <Badge variant="sage">Pročitano</Badge>}
            <span className="text-xs font-black text-[color:var(--pp-color-muted-text)]">{item.createdAtLabel}</span>
          </div>
          <h2 className="mt-3 text-xl font-black tracking-[-0.03em] text-[color:var(--pp-color-forest-text)]">{item.title}</h2>
          <p className="mt-2 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">{item.body}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link href={item.targetPath} className="inline-flex text-sm font-black text-[color:var(--pp-color-orange-primary)]">Otvori</Link>
            <NotificationReadAction notificationId={item.id} read={!unread} />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default async function AlertsPage() {
  const user = await getAuthUser();
  if (!user) redirect('/prijava?redirect=%2Fupozorenja');

  const notifications = await getNotificationsForProfile(user.id);
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

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
            <p className="mt-5 max-w-3xl text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)] sm:text-lg">In-app obavijesti za booking upite. Nema emaila, SMS-a ni vanjskih slanja.</p>
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
              {notifications.length ? notifications.map((item) => <NotificationCard key={item.id} item={item} />) : (
                <Card radius="28" tone="sage" className="p-10 text-center">
                  <Bell className="mx-auto size-12 text-[color:var(--pp-color-orange-primary)]" />
                  <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">Nema novih upozorenja.</h2>
                  <p className="mt-3 text-sm font-semibold text-[color:var(--pp-color-muted-text)]">Kad se dogodi nešto važno oko booking upita, pojavit će se ovdje.</p>
                </Card>
              )}
            </section>

            <aside className="space-y-5 xl:sticky xl:top-28 xl:self-start">
              <Card radius="28" tone="cream" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em]"><Settings className="size-5 text-[color:var(--pp-color-orange-primary)]" /> Pregled</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Imaš {notifications.length} obavijesti, od toga {unreadCount} nepročitanih.</p>
                <ButtonLink href="/moji-upiti" className="mt-5 w-full" variant="secondary">Moji upiti</ButtonLink>
              </Card>

              <Card radius="28" tone="orange" className="p-5">
                <h2 className="flex items-center gap-2 text-xl font-black tracking-[-0.03em]"><ShieldAlert className="size-5 text-[color:var(--pp-color-error)]" /> Sigurnost</h2>
                <p className="mt-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">Ove obavijesti su samo unutar PetParka. Ne šalju se e-mail, SMS, WhatsApp ni push poruke.</p>
              </Card>

              <Card radius="28" tone="teal" className="p-5">
                <h2 className="text-xl font-black tracking-[-0.03em]">Brzi linkovi</h2>
                <div className="mt-4 grid gap-2">
                  <ButtonLink href="/moji-upiti" variant="secondary" className="justify-start"><MessageCircle className="size-4" /> Moji upiti</ButtonLink>
                  <ButtonLink href="/moje-usluge" variant="secondary" className="justify-start"><CalendarDays className="size-4" /> Moje usluge</ButtonLink>
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
