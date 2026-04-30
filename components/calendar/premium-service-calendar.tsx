'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, format, isSameDay, isToday, startOfMonth, subMonths } from 'date-fns';
import { hr } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Sparkles, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CalendarSlot = {
  id: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  label?: string | null;
  status?: 'available' | 'booked' | 'pending' | 'blocked' | string | null;
};

type CalendarBooking = {
  id: string;
  date: string;
  title: string;
  start_time?: string | null;
  end_time?: string | null;
  status?: string | null;
};

type PremiumServiceCalendarProps = {
  title: string;
  description: string;
  serviceLabel: string;
  accent?: 'orange' | 'teal' | 'rose';
  slots?: CalendarSlot[];
  bookings?: CalendarBooking[];
  availableDates?: Set<string>;
  actions?: ReactNode;
  setupPanel?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  onToggleDate?: (date: string) => void;
  onDeleteSlot?: (slotId: string) => void;
  onDeleteDay?: (date: string) => void;
  deletingSlotIds?: Set<string>;
};

const accentClass = {
  orange: {
    gradient: 'from-orange-500 via-amber-500 to-teal-500',
    soft: 'bg-orange-50 text-orange-700 border-orange-100',
    ring: 'ring-orange-400',
    day: 'bg-orange-500 text-white shadow-orange-500/20',
  },
  teal: {
    gradient: 'from-teal-500 via-emerald-500 to-orange-500',
    soft: 'bg-teal-50 text-teal-700 border-teal-100',
    ring: 'ring-teal-400',
    day: 'bg-teal-600 text-white shadow-teal-600/20',
  },
  rose: {
    gradient: 'from-rose-500 via-orange-500 to-teal-500',
    soft: 'bg-rose-50 text-rose-700 border-rose-100',
    ring: 'ring-rose-400',
    day: 'bg-rose-500 text-white shadow-rose-500/20',
  },
};

function toTime(value?: string | null) {
  return value ? value.slice(0, 5) : '';
}

function statusLabel(status?: string | null) {
  if (status === 'pending') return 'Na čekanju';
  if (status === 'confirmed' || status === 'booked') return 'Rezervirano';
  if (status === 'blocked') return 'Blokirano';
  return 'Dostupno';
}

export function PremiumServiceCalendar({
  title,
  description,
  serviceLabel,
  accent = 'orange',
  slots = [],
  bookings = [],
  availableDates,
  actions,
  setupPanel,
  emptyTitle = 'Nema postavljenih termina',
  emptyDescription = 'Dodajte dostupnost ili primijenite radne sate kako bi korisnici mogli pronaći slobodan termin.',
  onToggleDate,
  onDeleteSlot,
  onDeleteDay,
  deletingSlotIds = new Set(),
}: PremiumServiceCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const palette = accentClass[accent];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = (monthStart.getDay() + 6) % 7;

  const groupedSlots = useMemo(() => {
    return slots.reduce<Record<string, CalendarSlot[]>>((acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    }, {});
  }, [slots]);

  const groupedBookings = useMemo(() => {
    return bookings.reduce<Record<string, CalendarBooking[]>>((acc, booking) => {
      if (!acc[booking.date]) acc[booking.date] = [];
      acc[booking.date].push(booking);
      return acc;
    }, {});
  }, [bookings]);

  const dateHasAvailability = (date: string) => Boolean(groupedSlots[date]?.length || availableDates?.has(date));
  const selectedSlots = groupedSlots[selectedDate] ?? [];
  const selectedBookings = groupedBookings[selectedDate] ?? [];
  const openDays = days.filter((day) => dateHasAvailability(format(day, 'yyyy-MM-dd'))).length;
  const totalSlots = slots.length || availableDates?.size || 0;

  return (
    <section className="overflow-hidden rounded-[2rem] border bg-card shadow-sm">
      <div className={`relative overflow-hidden bg-gradient-to-r ${palette.gradient} p-5 text-white md:p-7`}>
        <div className="absolute inset-0 opacity-[0.10] paw-pattern" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/16 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
              <CalendarDays className="h-3.5 w-3.5" />
              {serviceLabel}
            </div>
            <h2 className="font-[var(--font-heading)] text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/82 md:text-base">{description}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[22rem]">
            <div className="rounded-2xl bg-white/14 p-3 backdrop-blur">
              <p className="text-2xl font-extrabold">{openDays}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">dana</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-3 backdrop-blur">
              <p className="text-2xl font-extrabold">{totalSlots}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">slotova</p>
            </div>
            <div className="rounded-2xl bg-white/14 p-3 backdrop-blur">
              <p className="text-2xl font-extrabold">{bookings.length}</p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-white/70">upita</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="border-b p-4 md:p-6 lg:border-b-0 lg:border-r">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Pregled mjeseca</p>
              <h3 className="mt-1 font-[var(--font-heading)] text-2xl font-bold capitalize">{format(currentMonth, 'LLLL yyyy.', { locale: hr })}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {actions}
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'].map((day) => (
              <div key={day} className="py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{day}</div>
            ))}
            {Array.from({ length: startDay }, (_, index) => <div key={`empty-${index}`} />)}
            {days.map((day) => {
              const date = format(day, 'yyyy-MM-dd');
              const hasAvailability = dateHasAvailability(date);
              const bookingCount = groupedBookings[date]?.length ?? 0;
              const slotCount = groupedSlots[date]?.length ?? 0;
              const isSelected = selectedDate === date;
              const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <button
                  key={date}
                  type="button"
                  disabled={isPast && Boolean(onToggleDate)}
                  onClick={() => {
                    setSelectedDate(date);
                    if (onToggleDate) onToggleDate(date);
                  }}
                  className={`group relative min-h-[4.7rem] rounded-2xl border p-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-35 ${
                    hasAvailability ? `${palette.day} border-transparent shadow-lg` : 'bg-muted/35 text-muted-foreground hover:bg-muted/60'
                  } ${isSelected ? `ring-2 ring-offset-2 ${palette.ring}` : ''} ${isToday(day) ? 'border-orange-400' : ''}`}
                >
                  <span className="text-sm font-bold">{format(day, 'd')}</span>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1 text-[10px] font-semibold opacity-85">
                    <span>{slotCount || (hasAvailability ? 'dan' : '')}</span>
                    {bookingCount > 0 ? <span className="rounded-full bg-black/12 px-1.5 py-0.5">{bookingCount}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2"><span className={`h-3 w-3 rounded-full bg-gradient-to-r ${palette.gradient}`} /> Dostupno</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full border-2 border-orange-400" /> Danas</span>
            <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-muted" /> Bez termina</span>
          </div>
        </div>

        <aside className="space-y-4 p-4 md:p-6">
          {setupPanel}
          <div className="rounded-3xl border bg-background/70 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Odabrani dan</p>
                <h3 className="font-[var(--font-heading)] text-xl font-bold capitalize">{format(new Date(`${selectedDate}T00:00`), 'EEEE, d. MMMM', { locale: hr })}</h3>
              </div>
              {onDeleteDay && selectedSlots.length > 0 ? (
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-red-600" onClick={() => onDeleteDay(selectedDate)}>
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Dan
                </Button>
              ) : null}
            </div>

            {selectedSlots.length === 0 && selectedBookings.length === 0 && !availableDates?.has(selectedDate) ? (
              <div className="rounded-3xl border border-dashed p-6 text-center">
                <Sparkles className="mx-auto mb-3 h-8 w-8 text-muted-foreground/45" />
                <p className="font-medium">{emptyTitle}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{emptyDescription}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableDates?.has(selectedDate) && selectedSlots.length === 0 ? (
                  <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${palette.soft}`}>Cijeli dan označen kao dostupan</div>
                ) : null}
                {selectedSlots.map((slot) => (
                  <div key={slot.id} className="group flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {toTime(slot.start_time)} {slot.end_time ? `— ${toTime(slot.end_time)}` : ''}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{slot.label || statusLabel(slot.status)}</p>
                    </div>
                    {onDeleteSlot ? (
                      <button
                        type="button"
                        disabled={deletingSlotIds.has(slot.id)}
                        onClick={() => onDeleteSlot(slot.id)}
                        className="rounded-full p-1.5 text-muted-foreground opacity-60 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-40"
                        aria-label="Obriši termin"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ))}
                {selectedBookings.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-orange-100 bg-orange-50/70 px-4 py-3">
                    <p className="font-semibold">{booking.title}</p>
                    <p className="text-xs text-muted-foreground">{toTime(booking.start_time)} {booking.end_time ? `— ${toTime(booking.end_time)}` : ''} · {statusLabel(booking.status)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
