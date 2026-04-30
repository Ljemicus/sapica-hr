'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { hr, enUS } from 'date-fns/locale';
import { Clock, Calendar } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { AvailabilityCalendar } from '@/components/shared/availability-calendar';

interface AvailabilityBlockProps {
  availableDates: Set<string>;
  onSelectDate?: (date: string) => void;
  selectedDate?: string;
  slots?: Array<{ id: string; start_time: string; end_time: string }>;
  onSelectSlot?: (slot: { id: string; start_time: string; end_time: string }) => void;
  loading?: boolean;
}

export function AvailabilityBlock({
  availableDates,
  onSelectDate,
  selectedDate,
  slots = [],
  onSelectSlot,
  loading = false,
}: AvailabilityBlockProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;
  const [internalDate, setInternalDate] = useState(selectedDate || '');

  const activeDate = selectedDate !== undefined ? selectedDate : internalDate;

  const handleDateSelect = (date: string) => {
    if (onSelectDate) {
      onSelectDate(date);
    } else {
      setInternalDate(date);
    }
  };

  const copy = {
    slotsKicker: isEn ? 'Book a time' : 'Rezervirajte termin',
    freeSlots: isEn ? 'Available slots' : 'Slobodni termini',
    loadingSlots: isEn ? 'Loading slots...' : 'Učitavam termine...',
    chooseDate: isEn ? 'Click an available date above to see open slots.' : 'Klikni na slobodan datum iznad da vidiš termine.',
    noDateSlots: isEn ? 'There are currently no open slots for the selected date.' : 'Za odabrani datum trenutno nema slobodnih termina.',
    until: isEn ? 'until' : 'do',
  };

  const selectedDateSlots = slots.filter((slot) => {
    // For groomer/trainer slots that include date field
    if ('date' in slot && (slot as unknown as Record<string, string>).date === activeDate) return true;
    // For generic slots without date, show all when a date is selected
    return activeDate ? true : false;
  });

  return (
    <div className="space-y-6">
      <AvailabilityCalendar
        availableDates={availableDates}
        selectedDate={activeDate}
        onSelectDate={handleDateSelect}
      />

      <section className="animate-fade-in-up delay-300">
        <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.slotsKicker}</p>
        <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex items-center gap-3 mb-6">
          <Clock className="h-6 w-6 text-warm-orange" />
          {copy.freeSlots}
        </h2>
        <div className="detail-section-card p-7 md:p-8">
          {loading ? (
            <p className="text-sm text-muted-foreground">{copy.loadingSlots}</p>
          ) : !activeDate ? (
            <p className="text-sm text-muted-foreground">{copy.chooseDate}</p>
          ) : selectedDateSlots.length === 0 ? (
            <p className="text-sm text-muted-foreground">{copy.noDateSlots}</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-semibold">
                {format(new Date(`${activeDate}T00:00:00`), isEn ? 'MMMM d, yyyy' : 'd. MMMM yyyy.', { locale })}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {selectedDateSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    className="rounded-xl border border-border/30 bg-white dark:bg-card p-4 text-left hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                    onClick={() => onSelectSlot?.(slot)}
                  >
                    <div className="font-bold text-sm text-orange-600 dark:text-orange-400 group-hover:text-orange-700">
                      {slot.start_time.slice(0, 5)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {copy.until} {slot.end_time.slice(0, 5)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
