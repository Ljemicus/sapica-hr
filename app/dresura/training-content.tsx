'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Award, Shield, X, Filter, SlidersHorizontal, GraduationCap, Clock, Users, ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { EmptyState } from '@/components/shared/empty-state';
import { useLanguage } from '@/lib/i18n/context';
import { CITIES, TRAINING_TYPE_LABELS, type Trainer, type TrainingType, type TrainingProgram } from '@/lib/types';

const gradients = [
  'from-blue-400 to-cyan-300',
  'from-green-400 to-emerald-300',
  'from-purple-400 to-pink-300',
  'from-orange-400 to-amber-300',
  'from-teal-400 to-cyan-300',
  'from-rose-400 to-orange-300',
];

const TRAINING_TYPE_LABELS_EN: Record<TrainingType, string> = {
  osnovna: 'Basic obedience',
  napredna: 'Advanced training',
  agility: 'Agility',
  ponasanje: 'Behaviour correction',
  stenci: 'Puppies',
};

interface FilterPanelProps {
  city: string;
  type: string;
  activeFilterCount: number;
  onCityChange: (city: string) => void;
  onTypeChange: (type: string) => void;
  onApply: () => void;
  onClear: () => void;
}

function FilterPanel({ city, type, activeFilterCount, onCityChange, onTypeChange, onApply, onClear }: FilterPanelProps) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const trainingLabel = (value: TrainingType) => isEn ? TRAINING_TYPE_LABELS_EN[value] : TRAINING_TYPE_LABELS[value];

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
        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 block">{isEn ? 'Training type' : 'Vrsta treninga'}</Label>
        <div className="space-y-1">
          {(Object.entries(TRAINING_TYPE_LABELS) as [TrainingType, string][]).map(([key]) => (
            <label key={key} className="premium-radio-option group">
              <input
                type="radio"
                name="training-type"
                value={key}
                checked={type === key}
                onChange={(e) => onTypeChange(e.target.value)}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-sm group-hover:text-foreground transition-colors">{trainingLabel(key)}</span>
            </label>
          ))}
          {type && (
            <button onClick={() => onTypeChange('')} className="text-xs text-warm-orange hover:underline mt-2 pl-3">
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

interface TrainingContentProps {
  trainers: Trainer[];
  initialParams: { city?: string; type?: string };
}

export function TrainingContent({ trainers, initialParams }: TrainingContentProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [city, setCity] = useState(initialParams.city || '');
  const [type, setType] = useState(initialParams.type || '');

  const trainingLabel = (value: TrainingType) => isEn ? TRAINING_TYPE_LABELS_EN[value] : TRAINING_TYPE_LABELS[value];
  const basePath = isEn ? '/dresura/en' : '/dresura';

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (type) params.set('type', type);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }, [basePath, city, type, router]);

  const clearFilters = () => {
    setCity('');
    setType('');
    router.push(basePath);
  };

  const activeFilterCount = [city, type].filter(Boolean).length;

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
              {isEn ? 'Dog training' : 'Školovanje pasa'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-6 font-[var(--font-heading)] animate-fade-in-up delay-100">
              {isEn
                ? 'Professional training\nfor every dog.'
                : 'Profesionalna školovanje\nza svakog psa.'}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg animate-fade-in-up delay-200">
              {isEn
                ? 'From basic obedience to agility — certified trainers who use positive reinforcement methods.'
                : 'Od osnove poslušnosti do agility-ja — certificirani treneri koji koriste pozitivan pristup školovanju pasa.'}
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
              <span className="font-semibold text-foreground">{trainers.length}</span>{' '}
              {isEn ? (trainers.length === 1 ? 'trainer found' : 'trainers found') : (trainers.length === 1 ? 'trener pronađen' : 'trenera pronađeno')}
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
                <FilterPanel city={city} type={type} activeFilterCount={activeFilterCount} onCityChange={setCity} onTypeChange={setType} onApply={applyFilters} onClear={clearFilters} />
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
            {type && (
              <Badge variant="secondary" className="gap-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 rounded-lg px-3 py-1.5">
                {trainingLabel(type as TrainingType)}
                <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setType(''); applyFilters(); }} />
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
              <FilterPanel city={city} type={type} activeFilterCount={activeFilterCount} onCityChange={setCity} onTypeChange={setType} onApply={applyFilters} onClear={clearFilters} />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {trainers.length === 0 ? (
              <EmptyState
                icon={GraduationCap}
                title={isEn ? 'No matching trainers' : 'Nema odgovarajućih trenera'}
                description={isEn ? 'Change the filters or try searching without a city to see more profiles.' : 'Promijenite filtere ili pokušajte pretragu bez grada kako biste vidjeli više profila.'}
                action={
                  <Button variant="outline" onClick={clearFilters} className="hover:bg-orange-50 hover:text-orange-600 rounded-xl">
                    {isEn ? 'Reset filters' : 'Poništi filtere'}
                  </Button>
                }
              />
            ) : (
              <div className="space-y-6 animate-fade-in">
                {trainers.map((trainer, i) => (
                  <TrainerCard key={trainer.id} trainer={trainer} index={i} />
                ))}
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

function TrainerCard({ trainer, index }: { trainer: Trainer; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const gradient = gradients[trainer.name.charCodeAt(0) % gradients.length];
  const isPremium = trainer.certified;
  const { language } = useLanguage();
  const isEn = language === 'en';
  const trainingLabel = (value: TrainingType) => isEn ? TRAINING_TYPE_LABELS_EN[value] : TRAINING_TYPE_LABELS[value];

  useEffect(() => {
    if (expanded && programs.length === 0) {
      fetch(`/api/trainers/${trainer.id}/programs`)
        .then(r => r.ok ? r.json() : [])
        .then(setPrograms)
        .catch(() => setPrograms([]));
    }
  }, [expanded, trainer.id, programs.length]);

  return (
    <article className="group overflow-hidden rounded-2xl bg-white dark:bg-card border border-border/30 provider-card">
      <div className="flex flex-col md:flex-row">
        {/* Left: gradient avatar panel */}
        <div className={`relative w-full md:w-72 min-h-[220px] bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
          <div className="absolute inset-0 paw-pattern opacity-[0.07]" />
          <div className="absolute inset-0 bg-black/5" />

          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between text-white/90 text-xs font-medium">
            <span className="flex items-center gap-1 drop-shadow-sm">
              <MapPin className="h-3 w-3" />
              {trainer.city}
            </span>
            <span className="rounded-full bg-white/95 px-3 py-1.5 text-indigo-600 font-bold shadow-sm">
              <GraduationCap className="h-3 w-3 inline mr-1" />
              {isEn ? 'Training' : 'Školovanje'}
            </span>
          </div>

          <div className="text-center relative p-8">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl mx-auto mb-4">
              <AvatarFallback className="bg-white text-gray-700 text-2xl font-bold">
                {trainer.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex gap-1.5 justify-center flex-wrap">
              {trainer.certified && (
                <span className="inline-flex items-center bg-white/90 text-blue-600 text-xs font-medium shadow-sm rounded-full px-2.5 py-1">
                  <Shield className="h-3 w-3 mr-1" />{isEn ? 'Certified' : 'Certificiran'}
                </span>
              )}
              {isPremium && (
                <span className="inline-flex items-center bg-white/90 text-amber-600 text-xs font-semibold shadow-sm rounded-full px-2.5 py-1">
                  <Award className="h-3 w-3 mr-1" />Premium
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: content */}
        <div className="flex-1 p-7">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-xl font-[var(--font-heading)]">{trainer.name}</h3>
              <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1.5">
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">{trainer.rating.toFixed(1)}</span>
                  <span className="text-amber-600/60 dark:text-amber-500/60">({trainer.review_count})</span>
                </span>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{isEn ? 'Pricing by arrangement' : 'Cijene prema dogovoru'}</span>
          </div>

          <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{trainer.bio}</p>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {trainer.specializations.map((s) => (
              <span key={s} className="inline-flex items-center text-xs font-medium bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-lg">
                {trainingLabel(s)}
              </span>
            ))}
          </div>

          {trainer.certificates.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {trainer.certificates.map((c) => (
                <span key={c} className="inline-flex items-center text-xs font-medium bg-accent dark:bg-accent/50 text-accent-foreground border border-border/40 px-2.5 py-1 rounded-lg">
                  <GraduationCap className="h-3 w-3 mr-1.5" />{c}
                </span>
              ))}
            </div>
          )}

          {programs.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1.5 text-sm font-semibold text-warm-orange hover:text-orange-600 transition-colors"
              >
                {expanded ? (isEn ? 'Hide' : 'Sakrij') : (isEn ? 'Show' : 'Prikaži')} {isEn ? 'programs' : 'programe'} ({programs.length})
                {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {expanded && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  {programs.map((program) => (
                    <ProgramCard key={program.id} program={program} />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="pt-4 mt-4 border-t border-border/40">
            <Link href={`/trener/${trainer.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-warm-orange hover:gap-2.5 transition-all">
              {isEn ? 'View profile' : 'Pogledaj profil'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProgramCard({ program }: { program: TrainingProgram }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const trainingLabel = (value: TrainingType) => isEn ? TRAINING_TYPE_LABELS_EN[value] : TRAINING_TYPE_LABELS[value];

  return (
    <div className="p-5 bg-accent/50 dark:bg-accent/30 rounded-xl border border-border/40">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-bold text-sm font-[var(--font-heading)]">{program.name}</h4>
          <span className="inline-flex items-center text-xs font-medium mt-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md">
            {trainingLabel(program.type)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{isEn ? 'Pricing by arrangement' : 'Cijena prema dogovoru'}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{program.description}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" />{program.duration_weeks} {isEn ? 'weeks' : 'tjedana'}</span>
        <span className="flex items-center gap-1.5"><Users className="h-3 w-3" />{program.sessions} {isEn ? 'sessions' : 'sesija'}</span>
      </div>
    </div>
  );
}
