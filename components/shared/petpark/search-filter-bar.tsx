import type { FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { PetParkButton } from './pp-button';

type SearchFilterBarProps = {
  service?: string;
  city?: string;
  date?: string;
  petType?: string;
  query?: string;
  submitLabel?: string;
  popularCities?: string[];
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onPopularCityClick?: (city: string) => void;
  className?: string;
};

export function SearchFilterBar({ service, city, date, petType, query, submitLabel = 'Pretraži', popularCities = [], onSubmit, onPopularCityClick, className }: SearchFilterBarProps) {
  return (
    <form onSubmit={onSubmit} className={cn('rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-surface)] p-4 shadow-[var(--pp-shadow-card)]', className)}>
      <div className="grid gap-3 md:grid-cols-5">
        <label className="space-y-1 text-sm font-bold text-[color:var(--pp-muted)]">
          Usluga
          <input name="service" defaultValue={service} className="w-full rounded-[var(--pp-radius-16)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] px-3 py-2 text-[color:var(--pp-ink)] outline-none focus:ring-2 focus:ring-[color:var(--pp-logo-teal)]" />
        </label>
        <label className="space-y-1 text-sm font-bold text-[color:var(--pp-muted)]">
          Grad
          <input name="city" defaultValue={city} className="w-full rounded-[var(--pp-radius-16)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] px-3 py-2 text-[color:var(--pp-ink)] outline-none focus:ring-2 focus:ring-[color:var(--pp-logo-teal)]" />
        </label>
        <label className="space-y-1 text-sm font-bold text-[color:var(--pp-muted)]">
          Datum
          <input name="date" defaultValue={date} className="w-full rounded-[var(--pp-radius-16)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] px-3 py-2 text-[color:var(--pp-ink)] outline-none focus:ring-2 focus:ring-[color:var(--pp-logo-teal)]" />
        </label>
        <label className="space-y-1 text-sm font-bold text-[color:var(--pp-muted)]">
          Ljubimac
          <input name="petType" defaultValue={petType} className="w-full rounded-[var(--pp-radius-16)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] px-3 py-2 text-[color:var(--pp-ink)] outline-none focus:ring-2 focus:ring-[color:var(--pp-logo-teal)]" />
        </label>
        <label className="space-y-1 text-sm font-bold text-[color:var(--pp-muted)]">
          Pojam
          <input name="query" defaultValue={query} className="w-full rounded-[var(--pp-radius-16)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] px-3 py-2 text-[color:var(--pp-ink)] outline-none focus:ring-2 focus:ring-[color:var(--pp-logo-teal)]" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {popularCities.map((popularCity) => (
            <button key={popularCity} type="button" onClick={() => onPopularCityClick?.(popularCity)} className="rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-cream)] px-3 py-1 text-xs font-extrabold text-[color:var(--pp-muted)] hover:text-[color:var(--pp-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)]">
              {popularCity}
            </button>
          ))}
        </div>
        <PetParkButton type="submit">{submitLabel}</PetParkButton>
      </div>
    </form>
  );
}
