import type { ReactNode } from 'react';
import { CalendarDays, Clock3, Mail, MessageCircle, PawPrint, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { Badge } from '@/components/shared/petpark/design-foundation';
import type { BookingRequestEventSummary } from '@/lib/petpark/booking-requests/activity';
import { cn } from '@/lib/utils';
import { BookingRequestConversation } from './booking-request-conversation';

type DetailField = {
  label: string;
  value: ReactNode;
  className?: string;
};

type ContactField = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  masked?: boolean;
};

type BookingRequestDetailSurfaceProps = {
  requestId: string;
  role: 'owner' | 'provider';
  isTargeted?: boolean;
  unreadNotificationCount?: number;
  serviceLabel: string;
  providerName?: string;
  statusLabel: string;
  statusTone?: 'pending' | 'contacted' | 'closed' | 'withdrawn';
  dateRange: string;
  petName: string;
  petTypeLabel: string;
  submittedAt: string;
  notes?: string | null;
  events: BookingRequestEventSummary[];
  conversationEnabled: boolean;
  contact?: ContactField;
  fields?: DetailField[];
  actions?: ReactNode;
  footerCopy?: string;
};

const statusToneClasses = {
  pending: 'border-[color:var(--pp-color-warning)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-warning)]',
  contacted: 'border-[color:var(--pp-color-teal-accent)]/25 bg-[color:var(--pp-color-info-surface)] text-[color:var(--pp-color-teal-accent)]',
  closed: 'border-[color:var(--pp-color-muted-text)]/20 bg-[color:var(--pp-color-cream-surface)] text-[color:var(--pp-color-muted-text)]',
  withdrawn: 'border-[color:var(--pp-color-orange-primary)]/25 bg-[color:var(--pp-color-warning-surface)] text-[color:var(--pp-color-orange-primary)]',
};

function Timeline({ events }: { events: BookingRequestEventSummary[] }) {
  if (!events.length) {
    return (
      <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-3 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">
        Aktivnost će se pojaviti ovdje kada se status upita promijeni.
      </div>
    );
  }

  return (
    <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Aktivnost upita</p>
      <ol className="mt-3 space-y-3">
        {events.map((event) => (
          <li key={event.id} className="flex gap-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)]">
            <span className="mt-1 size-2 shrink-0 rounded-full bg-[color:var(--pp-color-teal-accent)]" aria-hidden />
            <span>
              <strong className="block text-[color:var(--pp-color-forest-text)]">{event.summary}</strong>
              <span>{event.createdAtLabel}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function ContactCard({ contact, role }: { contact?: ContactField; role: 'owner' | 'provider' }) {
  const hasContact = Boolean(contact?.name || contact?.email || contact?.phone);

  return (
    <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3 md:col-span-2">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">
        {role === 'owner' ? 'Kontakt koji si poslao' : 'Kontakt vlasnika'}
      </p>
      {hasContact ? (
        <div className="mt-2 grid gap-2 text-sm font-bold leading-6 text-[color:var(--pp-color-forest-text)] sm:grid-cols-2">
          {contact?.name ? <p className="sm:col-span-2"><UserRound className="mr-2 inline size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden />{contact.name}</p> : null}
          {contact?.email ? <p className="break-all"><Mail className="mr-2 inline size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden />{contact.email}</p> : null}
          {contact?.phone ? <p className="break-all"><Phone className="mr-2 inline size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden />{contact.phone}</p> : null}
        </div>
      ) : (
        <p className="mt-2 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)]">Kontakt je zabilježen uz upit.</p>
      )}
      <p className="mt-2 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">
        {role === 'owner'
          ? 'Na owner strani kontakt prikazujemo maskirano. Puni kontakt vidi samo pružatelj kojem je upit poslan.'
          : 'Kontakt i razgovor koristi samo za ovaj upit. Nema automatskog plaćanja ni zaključavanja termina.'}
      </p>
    </div>
  );
}

export function BookingRequestDetailSurface({
  requestId,
  role,
  isTargeted = false,
  unreadNotificationCount = 0,
  serviceLabel,
  providerName,
  statusLabel,
  statusTone = 'pending',
  dateRange,
  petName,
  petTypeLabel,
  submittedAt,
  notes,
  events,
  conversationEnabled,
  contact,
  fields = [],
  actions,
  footerCopy,
}: BookingRequestDetailSurfaceProps) {
  const defaultFooter = role === 'owner'
    ? 'Ovo je upit, ne potvrđena rezervacija. Pružatelj ručno dogovara detalje.'
    : 'Ručni upit bez plaćanja i bez zaključavanja termina. Označavanje statusa ne potvrđuje rezervaciju.';

  return (
    <details
      open={isTargeted || unreadNotificationCount > 0}
      className={cn(
        'group mt-5 rounded-[var(--pp-radius-card-24)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4',
        isTargeted && 'ring-4 ring-[color:var(--pp-color-orange-primary)]/10',
      )}
      data-petpark-booking-request-detail
      data-request-id={requestId}
      data-role={role}
    >
      <summary className="cursor-pointer list-none text-sm font-black text-[color:var(--pp-color-forest-text)] marker:hidden">
        <span className="inline-flex flex-wrap items-center gap-2">
          {unreadNotificationCount > 0 ? <Badge variant="orange">{unreadNotificationCount} novo</Badge> : null}
          <span>Detalji upita</span>
          {isTargeted ? <span className="rounded-full bg-[color:var(--pp-color-warning-surface)] px-2 py-1 text-[11px] text-[color:var(--pp-color-orange-primary)]">Otvoreno iz obavijesti</span> : null}
          <span className="text-xs font-bold text-[color:var(--pp-color-muted-text)] group-open:hidden">+</span>
          <span className="hidden text-xs font-bold text-[color:var(--pp-color-muted-text)] group-open:inline">−</span>
        </span>
      </summary>

      <div className="mt-4 space-y-4">
        <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-black text-[color:var(--pp-color-forest-text)]">{serviceLabel}</span>
            {providerName ? <span className="rounded-full bg-white/75 px-3 py-1 text-xs font-black text-[color:var(--pp-color-teal-accent)]">{providerName}</span> : null}
            <span className={cn('rounded-full border px-3 py-1 text-xs font-black', statusToneClasses[statusTone])}>{statusLabel}</span>
          </div>
          <div className="mt-3 grid gap-2 text-sm font-bold leading-6 text-[color:var(--pp-color-muted-text)] md:grid-cols-3">
            <span><CalendarDays className="mr-1 inline size-4 text-[color:var(--pp-color-orange-primary)]" aria-hidden />{dateRange}</span>
            <span><PawPrint className="mr-1 inline size-4 text-[color:var(--pp-color-teal-accent)]" aria-hidden />{petName} · {petTypeLabel}</span>
            <span><Clock3 className="mr-1 inline size-4 text-[color:var(--pp-color-muted-text)]" aria-hidden />Poslano {submittedAt}</span>
          </div>
        </div>

        <div className="grid gap-3 text-sm font-semibold leading-6 text-[color:var(--pp-color-muted-text)] md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className={cn('rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3', field.className)}>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">{field.label}</p>
              <div className="mt-1 text-[color:var(--pp-color-forest-text)]">{field.value}</div>
            </div>
          ))}
          <ContactCard contact={contact} role={role} />
          {notes ? (
            <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3 md:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[color:var(--pp-color-orange-primary)]">Napomena</p>
              <p className="mt-1 whitespace-pre-wrap break-words text-[color:var(--pp-color-forest-text)]">{notes}</p>
            </div>
          ) : null}
        </div>

        <Timeline events={events} />
        <BookingRequestConversation requestId={requestId} enabled={conversationEnabled} />
        {actions ? <div className="rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-3">{actions}</div> : null}

        <div className="flex gap-3 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-sage-surface)] p-3 text-xs font-bold leading-5 text-[color:var(--pp-color-muted-text)]">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
          <span>{footerCopy || defaultFooter}</span>
        </div>
      </div>
    </details>
  );
}
