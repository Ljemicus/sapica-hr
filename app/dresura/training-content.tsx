'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star, MapPin, Award, Shield, X, Filter, SlidersHorizontal, GraduationCap, Clock, Users, ChevronDown, ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
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
    <div className="space-y-6">
      <div>
        <Label className="text-sm font-medium mb-2 block">{isEn ? 'City' : 'Grad'}</Label>
        <select
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm transition-colors focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
        >
          <option value="">{isEn ? 'All cities' : 'Svi gradovi'}</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <Label className="text-sm font-medium mb-2 block">{isEn ? 'Training type' : 'Vrsta treninga'}</Label>
        <div className="space-y-2">
          {(Object.entries(TRAINING_TYPE_LABELS) as [TrainingType, string][]).map(([key]) => (
            <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="training-type"
                value={key}
                checked={type === key}
                onChange={(e) => onTypeChange(e.target.value)}
                className="accent-orange-500 w-4 h-4"
              />
              <span className="text-sm group-hover:text-orange-600 transition-colors">{trainingLabel(key)}</span>
            </label>
          ))}
          {type && (
            <button onClick={() => onTypeChange('')} className="text-xs text-orange-500 hover:underline mt-1">
              {isEn ? 'Clear selection' : 'Poništi odabir'}
            </button>
          )}
        </div>
      </div>
      <Separator />
      <div className="flex gap-2">
        <Button onClick={onApply} className="flex-1 bg-orange-500 hover:bg-orange-600 btn-hover">
          {isEn ? 'Apply filters' : 'Primijeni filtere'}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={onClear} className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
            <X className="h-4 w-4" />
          </Button>
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
    <div className="container mx-auto px-4 py-8">
      <div className="sticky top-14 z-30 -mx-4 px-4 py-4 glass-strong border-b border-border/50 mb-6 -mt-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-orange-500" />
              {isEn ? 'Dog training' : 'Školovanje pasa'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {trainers.length} {isEn ? (trainers.length === 1 ? 'trainer found' : 'trainers found') : (trainers.length === 1 ? 'trener pronađen' : 'trenera pronađeno')}
              {city && (isEn ? ` in ${city}` : ` u gradu ${city}`)}
            </p>
          </div>
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" />} className="md:hidden relative">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              {isEn ? 'Filters' : 'Filteri'}
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetTitle className="mb-4">{isEn ? 'Filters' : 'Filteri'}</SheetTitle>
              <FilterPanel city={city} type={type} activeFilterCount={activeFilterCount} onCityChange={setCity} onTypeChange={setType} onApply={applyFilters} onClear={clearFilters} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
          {city && (
            <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              <MapPin className="h-3 w-3" />{city}
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setCity(''); applyFilters(); }} />
            </Badge>
          )}
          {type && (
            <Badge variant="secondary" className="gap-1 bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100">
              {trainingLabel(type as TrainingType)}
              <X className="h-3 w-3 cursor-pointer ml-1" onClick={() => { setType(''); applyFilters(); }} />
            </Badge>
          )}
          <button onClick={clearFilters} className="text-xs text-orange-500 hover:underline self-center ml-1">
            {isEn ? 'Clear all' : 'Ukloni sve'}
          </button>
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden md:block w-64 flex-shrink-0">
          <Card className="p-5 sticky top-32 border-0 shadow-sm rounded-2xl">
            <h2 className="font-semibold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
              <Filter className="h-4 w-4" />
              {isEn ? 'Filters' : 'Filteri'}
            </h2>
            <FilterPanel city={city} type={type} activeFilterCount={activeFilterCount} onCityChange={setCity} onTypeChange={setType} onApply={applyFilters} onClear={clearFilters} />
          </Card>
        </aside>

        <div className="flex-1 min-w-0">
          {trainers.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={isEn ? 'No matching trainers' : 'Nema odgovarajućih trenera'}
              description={isEn ? 'Change the filters or try searching without a city to see more profiles.' : 'Promijenite filtere ili pokušajte pretragu bez grada kako biste vidjeli više profila.'}
              action={
                <Button variant="outline" onClick={clearFilters} className="hover:bg-orange-50 hover:text-orange-600">
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
          <p className="text-center text-sm text-muted-foreground italic py-4">
            {isEn ? 'Pricing is set by each provider on their profile.' : 'Cijene određuju pružatelji usluga na svojim profilima'}
          </p>
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
    <Card className={`group overflow-hidden border-0 shadow-sm rounded-2xl animate-fade-in-up delay-${((index % 3) + 1) * 100}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className={`relative w-full md:w-64 min-h-[200px] bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 overflow-hidden`}>
            <div className="absolute inset-0 paw-pattern opacity-10" />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white/90 text-xs font-medium">
              <span>{trainer.city}</span>
              <span className="rounded-full bg-white/90 px-2.5 py-1 text-indigo-600 shadow-sm">{isEn ? 'Training' : 'Školovanje'}</span>
            </div>
            <div className="text-center relative p-6">
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg mx-auto mb-3">
                <AvatarFallback className="bg-white/90 text-gray-700 text-2xl font-bold">
                  {trainer.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex gap-1.5 justify-center flex-wrap">
                {trainer.certified && (
                  <Badge className="bg-white/90 text-blue-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5">
                    <Shield className="h-3 w-3 mr-1" />{isEn ? 'Certified' : 'Certificiran'}
                  </Badge>
                )}
                {isPremium && (
                  <Badge className="bg-white/90 text-amber-600 text-xs shadow-sm hover:bg-white/90 rounded-full px-2.5 font-semibold">
                    <Award className="h-3 w-3 mr-1" />Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-xl">{trainer.name}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{trainer.city}</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {trainer.rating.toFixed(1)} ({trainer.review_count})
                  </span>
                </div>
              </div>
              <span className="text-sm text-muted-foreground">{isEn ? 'Pricing by arrangement' : 'Cijene prema dogovoru'}</span>
            </div>

            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{trainer.bio}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {trainer.specializations.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs font-normal bg-indigo-50 text-indigo-700">
                  {trainingLabel(s)}
                </Badge>
              ))}
            </div>

            {trainer.certificates.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {trainer.certificates.map((c) => (
                  <Badge key={c} variant="outline" className="text-xs font-normal">
                    <GraduationCap className="h-3 w-3 mr-1" />{c}
                  </Badge>
                ))}
              </div>
            )}

            {programs.length > 0 && (
              <div>
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="flex items-center gap-1 text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors"
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

            <div className="pt-3 mt-3 border-t border-border/50">
              <Link href={`/trener/${trainer.id}`} className="text-sm font-medium text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
                {isEn ? 'View profile' : 'Pogledaj profil'} <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProgramCard({ program }: { program: TrainingProgram }) {
  const { language } = useLanguage();
  const isEn = language === 'en';
  const trainingLabel = (value: TrainingType) => isEn ? TRAINING_TYPE_LABELS_EN[value] : TRAINING_TYPE_LABELS[value];

  return (
    <div className="p-4 bg-accent rounded-xl border border-border/50">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold text-sm">{program.name}</h4>
          <Badge variant="secondary" className="text-xs mt-1 bg-indigo-50 text-indigo-600">
            {trainingLabel(program.type)}
          </Badge>
        </div>
        <span className="text-sm text-muted-foreground">{isEn ? 'Pricing by arrangement' : 'Cijena prema dogovoru'}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{program.description}</p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{program.duration_weeks} {isEn ? 'weeks' : 'tjedana'}</span>
        <span className="flex items-center gap-1"><Users className="h-3 w-3" />{program.sessions} {isEn ? 'sessions' : 'sesija'}</span>
      </div>
    </div>
  );
}
