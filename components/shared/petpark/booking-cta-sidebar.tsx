'use client';

import Link from 'next/link';
import { ArrowRight, MessageCircle, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/use-user';

interface BookingCTASidebarProps {
  priceFrom: number | null;
  priceUnit?: string;
  priceNote?: string;
  onBook: () => void;
  messageHref: string;
  signInHref: string;
  stats: Array<{ value: number | string; label: string; accent?: 'orange' | 'teal' | 'indigo' | 'blue' }>;
  workingHours?: Array<{ day: string; hours: string | null }>;
  availableDates?: Set<string>;
}

export function BookingCTASidebar({
  priceFrom,
  priceUnit = 'po usluzi',
  priceNote,
  onBook,
  messageHref,
  signInHref,
  stats,
  workingHours,
  availableDates,
}: BookingCTASidebarProps) {
  const { user } = useUser();

  const accentBg: Record<string, string> = {
    orange: 'bg-warm-peach dark:bg-warm-orange/15 text-orange-600 dark:text-orange-400',
    teal: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="detail-sidebar-panel sticky top-20 p-7 md:p-8 space-y-7">
      {/* Price hero */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">već od</p>
        <div className="text-5xl md:text-6xl font-extrabold text-gradient font-[var(--font-heading)] leading-none">
          {priceFrom !== null && priceFrom > 0 ? `${priceFrom}€` : '—'}
        </div>
        {priceFrom !== null && priceFrom > 0 && (
          <p className="text-muted-foreground text-xs mt-2.5">{priceNote || priceUnit}</p>
        )}
        {(priceFrom === null || priceFrom <= 0) && (
          <p className="text-muted-foreground text-xs mt-2.5">Cijena po dogovoru</p>
        )}
      </div>

      {/* Primary CTA */}
      {user ? (
        <div className="space-y-3">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-full h-13 text-[15px] font-bold"
            size="lg"
            onClick={onBook}
          >
            {user.role === 'owner' ? 'Rezerviraj' : 'Zakaži termin'}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Link href={messageHref} className="block">
            <Button
              variant="outline"
              className="w-full hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:border-orange-300 rounded-full h-12 text-[15px] font-semibold"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Pošalji poruku
            </Button>
          </Link>
        </div>
      ) : (
        <Link href={signInHref} className="block">
          <Button
            className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-full h-13 text-[15px] font-bold"
            size="lg"
          >
            Prijavi se za zakazivanje
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      )}

      <Separator className="opacity-50" />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <div key={i} className={`rounded-2xl px-4 py-4 text-center ${accentBg[stat.accent || 'orange']}`}>
            <div className="text-2xl font-extrabold font-[var(--font-heading)]">{stat.value}</div>
            <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Working Hours */}
      {workingHours && workingHours.length > 0 && (
        <>
          <Separator className="opacity-50" />
          <div>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2 font-[var(--font-heading)]">
              <Clock className="h-4 w-4 text-warm-orange" />Radno vrijeme
            </h3>
            <div className="space-y-2.5">
              {workingHours.map((wh) => (
                <div key={wh.day} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{wh.day}</span>
                  {wh.hours ? (
                    <span className="font-semibold">{wh.hours}</span>
                  ) : (
                    <span className="text-muted-foreground/50">Zatvoreno</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Mini 14-day calendar */}
      {availableDates && (
        <>
          <Separator className="opacity-50" />
          <div>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2 font-[var(--font-heading)]">
              <Calendar className="h-4 w-4 text-warm-orange" />
              Idućih 14 dana
            </h3>
            <div className="grid grid-cols-7 gap-1.5">
              {Array.from({ length: 14 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const isAvailable = availableDates.has(dateStr);
                return (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all duration-200 ${
                      isAvailable
                        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/50'
                        : 'bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-600'
                    }`}
                    title={`${formatDate(date, 'd.M.')} — ${isAvailable ? 'Dostupan' : 'Nedostupan'}`}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800" />
                <span>Dostupan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-50 dark:bg-gray-800/50 ring-1 ring-gray-200 dark:ring-gray-700" />
                <span>Nedostupan</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function formatDate(date: Date, _fmt: string): string {
  return `${date.getDate()}.${date.getMonth() + 1}.`;
}
