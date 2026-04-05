'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Award, Shield, X, SlidersHorizontal, GraduationCap, Clock, Users, ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

  const typeOptions: { value: string; label: string }[] = [
    { value: '', label: isEn ? 'All types' : 'Sve vrste' },
    ...(Object.entries(TRAINING_TYPE_LABELS) as [TrainingType, string][]).map(([key]) => ({
      value: key,
      label: trainingLabel(key),
    })),
  ];

  return (
    <div>
      {/* ══════════════════════════════════════════
          EDITORIAL HERO
          ══════════════════════════════════════════ */}
      <section className="relative organizations-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.02]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-24 relative">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="section-kicker">
              {isEn ? 'Dog training' : 'Školovanje pasa'}
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] mb-6 font-[var(--font-heading)]">
              {isEn
                ? 'Professional training\nfor every dog.'
                : 'Profesionalno školovanje\nza svakog psa.'}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
              {isEn
                ? 'From basic obedience to agility — certified trainers who use positive reinforcement methods.'
                : 'Od osnove poslušnosti do agility-ja — certificirani treneri koji koriste pozitivan pristup školovanju pasa.'}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FILTER SECTION
          ══════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 -mt-8 relative z-10">
        <div className="community-section-card p-5 md:p-7">
          {/* Training type pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {typeOptions.map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                data-active={type === t.value}
                className={`filter-pill ${
                  type === t.value
                    ? 'bg-warm-orange text-white'
                    : 'bg-white dark:bg-card border border-border/40 text-foreground hover:border-warm-orange/30'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* City + apply row */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="premium-select max-w-[220px]"
            >
              <option value="">{isEn ? 'All cities' : 'Svi gradovi'}</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Button onClick={applyFilters} className="bg-warm-orange hover:bg-orange-600 btn-hover rounded-xl h-11 px-6 font-semibold">
              {isEn ? 'Apply' : 'Primijeni'}
            </Button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-warm-orange hover:underline self-center">
                {isEn ? 'Clear all' : 'Ukloni sve'}
              </button>
            )}

            {/* Mobile sheet trigger */}
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" />} className="sm:hidden relative rounded-xl ml-auto">
                <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                {isEn ? 'More' : 'Više'}
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] overflow-y-auto">
                <SheetTitle className="mb-6 font-[var(--font-heading)]">{isEn ? 'Filters' : 'Filteri'}</SheetTitle>
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{isEn ? 'Training type' : 'Vrsta treninga'}</p>
                    <div className="flex flex-wrap gap-2">
                      {typeOptions.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => setType(t.value)}
                          data-active={type === t.value}
                          className={`filter-pill text-xs ${
                            type === t.value
                              ? 'bg-warm-orange text-white'
                              : 'bg-white dark:bg-card border border-border/40 text-foreground'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{isEn ? 'City' : 'Grad'}</p>
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="premium-select">
                      <option value="">{isEn ? 'All cities' : 'Svi gradovi'}</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Button onClick={applyFilters} className="w-full bg-warm-orange hover:bg-orange-600 btn-hover rounded-xl h-11 font-semibold">
                    {isEn ? 'Apply filters' : 'Primijeni filtere'}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results count */}
          <div className="pt-4 border-t border-border/50 mt-5">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{trainers.length}</span>{' '}
              {isEn ? (trainers.length === 1 ? 'trainer found' : 'trainers found') : (trainers.length === 1 ? 'trener pronađen' : 'trenera pronađeno')}
              {city && <span className="text-warm-orange"> · {city}</span>}
            </p>
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
          RESULTS GRID
          ══════════════════════════════════════════ */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 animate-fade-in">
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
    <article className="group community-section-card provider-card overflow-hidden">
      {/* Card header - gradient avatar */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden`}>
        <div className="absolute inset-0 paw-pattern opacity-[0.07]" />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-500" />

        <Avatar className="h-24 w-24 border-4 border-white shadow-xl group-hover:scale-105 transition-transform duration-500">
          <AvatarFallback className="bg-white text-gray-700 text-2xl font-bold">
            {trainer.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Bottom info */}
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

        {/* Trust badges */}
        <div className="absolute top-4 right-4 flex gap-1.5">
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

      {/* Card body */}
      <div className="p-6 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-lg font-[var(--font-heading)] group-hover:text-warm-orange transition-colors">
              {trainer.name}
            </h3>
            <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2.5 py-1 rounded-full">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{trainer.rating.toFixed(1)}</span>
              <span className="text-xs text-amber-600/60 dark:text-amber-500/60">({trainer.review_count})</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{trainer.bio}</p>

        <div className="flex flex-wrap gap-1.5">
          {trainer.specializations.map((s) => (
            <span key={s} className="inline-flex items-center text-xs font-medium bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 px-2.5 py-1 rounded-lg">
              {trainingLabel(s)}
            </span>
          ))}
        </div>

        {trainer.certificates.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
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

        <div className="pt-4 border-t border-border/40">
          <Link href={`/trener/${trainer.id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-warm-orange hover:gap-2.5 transition-all">
            {isEn ? 'View profile' : 'Pogledaj profil'}
            <ArrowRight className="h-4 w-4" />
          </Link>
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
