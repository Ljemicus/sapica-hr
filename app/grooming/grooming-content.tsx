'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Shield, Scissors, ArrowRight, X, Filter, SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { EmptyState } from '@/components/shared/empty-state';
import { useLanguage } from '@/lib/i18n/context';
import { CITIES, GROOMING_SERVICE_LABELS, GROOMER_SPECIALIZATION_LABELS, type Groomer, type GroomerSpecialization, type GroomingServiceType } from '@/lib/types';

const GROOMING_SERVICE_LABELS_EN: Record<GroomingServiceType, string> = {
  sisanje: 'Haircut',
  kupanje: 'Bath',
  trimanje: 'Hand stripping',
  nokti: 'Nails',
  cetkanje: 'Brushing',
};

const GROOMER_SPECIALIZATION_LABELS_EN: Record<GroomerSpecialization, string> = {
  psi: 'Dogs',
  macke: 'Cats',
  oba: 'Dogs & cats',
};

const gradients = [
  'from-pink-400 to-rose-300',
  'from-purple-400 to-pink-300',
  'from-orange-400 to-amber-300',
  'from-teal-400 to-cyan-300',
  'from-blue-400 to-cyan-300',
  'from-green-400 to-emerald-300',
];

interface GroomingFilterPanelProps {
  city: string;
  service: string;
  activeFilterCount: number;
  onCityChange: (city: string) => void;
  onServiceChange: (service: string) => void;
  onApply: () => void;
  onClear: () => void;
}

function GroomingFilterPanel({ city, service, activeFilterCount, onCityChange, onServiceChange, onApply, onClear }: GroomingFilterPanelProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const serviceLabel = (value: GroomingServiceType) => isEn ? GROOMING_SERVICE_LABELS_EN[value] : GROOMING_SERVICE_LABELS[value];

  return (
    <div className="space-y-7">
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">{isEn ? 'City' : 'Grad'}</Label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="premium-select"
        >
          <option value="">{isEn ? 'All cities' : 'Svi gradovi'}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">{isEn ? 'Service type' : 'Vrsta usluge'}</Label>
        <div className="space-y-1">
          {(Object.entries(GROOMING_SERVICE_LABELS) as [GroomingServiceType, string][]).map(([key]) => (
            <label key={key} className="premium-radio-option group">
              <input
                type="radio"
                name="grooming-service"
                value={key}
                checked={service === key}
                onChange={(e) => onServiceChange(e.target.value)}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-sm group-hover:text-foreground transition-colors">{serviceLabel(key)}</span>
            </label>
          ))}
          {service && (
            <button onClick={() => onServiceChange('')} className="text-xs text-warm-orange hover:underline mt-2 pl-3">
              {isEn ? 'Clear selection' : 'Poništi odabir'}
            </button>
          )}
        </div>
      </div>
      <div className="pt-2">
        <Button onClick={onApply} className="w-full bg-orange-500 hover:bg-orange-600 btn-hover rounded-xl h-11 font-semibold">
          {isEn ? 'Apply filters' : 'Primijeni filtere'}
        </Button>
        {activeFilterCount > 0 && (
          <button onClick={onClear} className="w-full text-center text-xs text-muted-foreground hover:text-warm-orange mt-3 transition-colors">
            {isEn ? 'Clear all filters' : 'Očisti sve filtere'}
          </button>
        )}
      </div>
    </div>
  );
}

interface GroomingContentProps {
  groomers: Groomer[];
  initialParams: { city?: string; service?: string };
}

export function GroomingContent({ groomers, initialParams }: GroomingContentProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [city, setCity] = useState(initialParams.city || '');
  const [service, setService] = useState(initialParams.service || '');

  const serviceLabel = (value: GroomingServiceType) => isEn ? GROOMING_SERVICE_LABELS_EN[value] : GROOMING_SERVICE_LABELS[value];
  const specializationLabel = (value: GroomerSpecialization) => isEn ? GROOMER_SPECIALIZATION_LABELS_EN[value] : GROOMER_SPECIALIZATION_LABELS[value];
  const basePath = isEn ? '/njega/en' : '/njega';

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (service) params.set('service', service);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }, [basePath, city, service, router]);

  const clearFilters = () => {
    setCity('');
    setService('');
    router.push(basePath);
  };

  const activeFilterCount = [city, service].filter(Boolean).length;

  return (
    <div>
      {/* ══════════════════════════════════════════
          EDITORIAL HERO
          ══════════════════════════════════════════ */}
      <section className="relative browse-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-5 font-semibold animate-fade-in-up">
              {isEn ? 'Grooming' : 'Njega ljubimaca'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-6 font-[var(--font-heading)] animate-fade-in-up delay-100">
              {isEn ? 'Professional grooming\nyour pet deserves.' : 'Profesionalna njega\nkoju vaš ljubimac zaslužuje.'}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in-up delay-200">
              {isEn
                ? 'Expert coat care, bathing, and styling from verified groomers across Croatia.'
                : 'Stručna njega dlake, kupanje i styling od verificiranih groomera diljem Hrvatske.'}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TOOLBAR
          ══════════════════════════════════════════ */}
      <div className="sticky top-14 z-30 glass-strong border-b border-border/50">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{groomers.length}</span>{' '}
              {isEn ? (groomers.length === 1 ? 'groomer found' : 'groomers found') : (groomers.length === 1 ? 'groomer pronađen' : 'groomera pronađeno')}
              {city && <span className="text-warm-orange"> · {city}</span>}
            </p>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" />} className="md:hidden relative rounded-xl">
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                {isEn ? 'Filters' : 'Filteri'}
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetTitle className="mb-6 font-[var(--font-heading)]">{isEn ? 'Filters' : 'Filteri'}</SheetTitle>
                <GroomingFilterPanel city={city} service={service} activeFilterCount={activeFilterCount} onCityChange={setCity} onServiceChange={setService} onApply={applyFilters} onClear={clearFilters} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ACTIVE FILTERS
          ══════════════════════════════════════════ */}
      {activeFilterCount > 0 && (
        <div className="container mx-auto px-6 md:px-10 lg:px-16 pt-6">
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {city && (
              <Badge variant="secondary" className="gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 rounded-lg px-3 py-1.5">
                <MapPin className="h-3 w-3" />{city}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setCity(''); applyFilters(); }} />
              </Badge>
            )}
            {service && (
              <Badge variant="secondary" className="gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 rounded-lg px-3 py-1.5">
                {serviceLabel(service as GroomingServiceType)}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setService(''); applyFilters(); }} />
              </Badge>
            )}
            <button onClick={clearFilters} className="text-xs text-warm-orange hover:underline self-center ml-1">
              {isEn ? 'Clear all' : 'Ukloni sve'}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════
          MAIN CONTENT
          ══════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-10">
        <div className="flex gap-10">
          {/* Desktop filter sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32 filter-panel rounded-2xl p-6 border border-border/30 shadow-sm">
              <h2 className="font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                {isEn ? 'Filters' : 'Filteri'}
              </h2>
              <GroomingFilterPanel city={city} service={service} activeFilterCount={activeFilterCount} onCityChange={setCity} onServiceChange={setService} onApply={applyFilters} onClear={clearFilters} />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {groomers.length === 0 ? (
              <EmptyState
                icon={Scissors}
                title={isEn ? 'No groomers found' : 'Nema pronađenih groomera'}
                description={isEn ? 'Try changing the filters or searching in another city.' : 'Pokušajte promijeniti filtere ili pretražiti u drugom gradu.'}
                action={
                  <Button variant="outline" onClick={clearFilters} className="hover:bg-orange-50 hover:text-orange-600 rounded-xl">
                    {isEn ? 'Reset filters' : 'Poništi filtere'}
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 animate-fade-in">
                {groomers.map((groomer) => {
                  const gradient = gradients[groomer.name.charCodeAt(0) % gradients.length];
                  return (
                    <Link key={groomer.id} href={`/groomer/${groomer.id}`}>
                      <article className="group provider-card overflow-hidden cursor-pointer rounded-2xl bg-white dark:bg-card border border-border/30">
                        {/* Card header */}
                        <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
                          <div className="absolute inset-0 paw-pattern opacity-[0.07]" />
                          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />

                          <Avatar className="h-24 w-24 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
                            <AvatarFallback className="bg-white text-gray-700 text-2xl font-bold">
                              {groomer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>

                          {/* Bottom info */}
                          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white/90 text-xs font-medium">
                            <span className="flex items-center gap-1 drop-shadow-sm">
                              <MapPin className="h-3 w-3" />
                              {groomer.city}
                            </span>
                            <span className="rounded-full bg-white/95 px-3 py-1.5 text-pink-600 font-bold shadow-sm">
                              <Scissors className="h-3 w-3 inline mr-1" />
                              {isEn ? 'Grooming' : 'Njega'}
                            </span>
                          </div>

                          {/* Trust badges */}
                          <div className="absolute top-4 right-4 flex gap-1.5">
                            {groomer.verified && (
                              <span className="inline-flex items-center bg-white/90 text-blue-600 text-xs font-medium shadow-sm rounded-full px-2.5 py-1">
                                <Shield className="h-3 w-3 mr-1" />
                                {isEn ? 'Verified' : 'Verificiran'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card body */}
                        <div className="p-6 space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-bold text-lg font-[var(--font-heading)] group-hover:text-warm-orange transition-colors">
                                {groomer.name}
                              </h3>
                              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
                                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{groomer.rating.toFixed(1)}</span>
                                <span className="text-xs text-amber-600/60 dark:text-amber-500/60">({groomer.review_count})</span>
                              </div>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{groomer.bio}</p>

                          <div className="flex flex-wrap gap-1.5">
                            {groomer.services.map((s) => (
                              <span key={s} className="inline-flex items-center text-xs font-medium bg-accent dark:bg-accent/50 text-accent-foreground px-2.5 py-1 rounded-lg">
                                {serviceLabel(s)}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-border/40">
                            <span className="inline-flex items-center text-xs font-medium bg-pink-50 dark:bg-pink-950/30 text-pink-700 dark:text-pink-400 px-2.5 py-1 rounded-lg">
                              {specializationLabel(groomer.specialization)}
                            </span>
                            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-warm-orange group-hover:gap-2.5 transition-all">
                              {isEn ? 'View profile' : 'Pogledaj profil'}
                              <ArrowRight className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  );
                })}
              </div>
            )}
            <p className="text-center text-sm text-muted-foreground italic py-6 mt-4">
              {isEn ? 'Pricing is set by each provider on their profile.' : 'Cijene određuju pružatelji usluga na svojim profilima'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
