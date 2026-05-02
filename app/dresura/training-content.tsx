'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { EmptyStateCard } from '@/components/shared/petpark/empty-state-card';
import { PetParkBadge } from '@/components/shared/petpark/pp-badge';
import { ServiceListingCard } from '@/components/shared/petpark/service-listing-card';
import { CITIES, TRAINING_TYPE_LABELS, type TrainingType } from '@/lib/types';

export type PublicTrainingListingItem = {
  id: string;
  name: string;
  city: string;
  profileHref: string;
  description: string;
  specializations: TrainingType[];
  serviceTags: string[];
  certificates: string[];
  certified: boolean;
  rating: number | null;
  reviewCount: number;
  priceFrom: number | null;
  responseLabel?: string;
};

const TRAINING_TYPE_LABELS_EN: Record<TrainingType, string> = {
  osnovna: 'Basic obedience',
  napredna: 'Advanced training',
  agility: 'Agility',
  ponasanje: 'Behaviour correction',
  stenci: 'Puppies',
};

const LISTING_COPY = {
  hr: {
    eyebrow: 'Dresura pasa',
    title: 'Trening koji psu i vlasniku daje jasniji ritam.',
    description: 'Usporedi trenere po gradu, području rada, recenzijama i jasnim informacijama prije prvog upita.',
    filterTitle: 'Pronađi trenera',
    filterDescription: 'Odaberi vrstu treninga i grad. PetPark prikazuje stvarne profile bez lažnih ocjena i bez javnih kontakata u karticama.',
    allTypes: 'Sve vrste',
    allCities: 'Svi gradovi',
    type: 'Vrsta treninga',
    city: 'Grad',
    more: 'Više',
    apply: 'Primijeni',
    applyFilters: 'Primijeni filtere',
    clearAll: 'Očisti filtere',
    resultsOne: 'trener pronađen',
    resultsMany: 'trenera pronađeno',
    noReviews: 'Novo na PetParku · još nema recenzija',
    reviewsLabel: 'Recenzije',
    priceTitle: 'Cijena',
    priceFallback: 'Cijena po dogovoru',
    priceFrom: 'od',
    profileCta: 'Pogledaj profil',
    verified: 'Certifikat naveden',
    categoryLabel: 'Dresura',
    responseLabel: 'Upit kroz PetPark',
    emptyTitle: 'Još nemamo trenere za ove filtere.',
    emptyDescription: 'PetPark se puni grad po grad. Pokušaj promijeniti grad ili vrstu treninga, ili ostavi interes i javit ćemo ti kad novi partneri stignu.',
    emptyPrimary: 'Očisti filtere',
    emptySecondary: 'Ostavi interes',
    trustTitle: 'Kako čitamo kartice',
    trustOne: 'Ocjene prikazujemo tek kad postoje recenzije.',
    trustTwo: 'Ako cijena nije potvrđena, kartica prikazuje: Cijena po dogovoru.',
    trustThree: 'Kontakti se ne izlažu u javnom listingu.',
  },
  en: {
    eyebrow: 'Dog training',
    title: 'Training that gives dogs and owners a clearer rhythm.',
    description: 'Compare trainers by city, area of work, reviews, and clear information before sending the first request.',
    filterTitle: 'Find a trainer',
    filterDescription: 'Choose a training type and city. PetPark shows real profiles without fake ratings or public contact details on cards.',
    allTypes: 'All types',
    allCities: 'All cities',
    type: 'Training type',
    city: 'City',
    more: 'More',
    apply: 'Apply',
    applyFilters: 'Apply filters',
    clearAll: 'Clear filters',
    resultsOne: 'trainer found',
    resultsMany: 'trainers found',
    noReviews: 'New on PetPark · no reviews yet',
    reviewsLabel: 'Reviews',
    priceTitle: 'Price',
    priceFallback: 'Price by arrangement',
    priceFrom: 'from',
    profileCta: 'View profile',
    verified: 'Certificate listed',
    categoryLabel: 'Training',
    responseLabel: 'Request through PetPark',
    emptyTitle: 'No trainers match these filters yet.',
    emptyDescription: 'PetPark is growing city by city. Try changing the city or training type, or leave your interest and we will let you know when new partners arrive.',
    emptyPrimary: 'Clear filters',
    emptySecondary: 'Leave interest',
    trustTitle: 'How to read cards',
    trustOne: 'Ratings appear only when reviews exist.',
    trustTwo: 'If price is not confirmed, the card shows: Price by arrangement.',
    trustThree: 'Contacts are not exposed in public listings.',
  },
} as const;

interface TrainingContentProps {
  trainers: PublicTrainingListingItem[];
  initialParams: { city?: string; type?: string };
}

export function TrainingContent({ trainers, initialParams, forcedLanguage }: TrainingContentProps & { forcedLanguage?: 'hr' | 'en' }) {
  const router = useRouter();
  const activeLanguage = forcedLanguage || 'hr';
  const isEn = activeLanguage === 'en';
  const copy = LISTING_COPY[activeLanguage];
  const [city, setCity] = useState(initialParams.city || '');
  const [type, setType] = useState(initialParams.type || '');
  const basePath = activeLanguage === 'en' ? '/dresura/en' : '/dresura';

  const trainingLabel = useCallback((value: TrainingType) => (isEn ? TRAINING_TYPE_LABELS_EN[value] : TRAINING_TYPE_LABELS[value]), [isEn]);

  const pushFilters = useCallback((nextCity = city, nextType = type) => {
    const params = new URLSearchParams();
    if (nextCity) params.set('city', nextCity);
    if (nextType) params.set('type', nextType);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  }, [basePath, city, router, type]);

  const clearFilters = () => {
    setCity('');
    setType('');
    pushFilters('', '');
  };

  const removeCity = () => {
    setCity('');
    pushFilters('', type);
  };

  const removeType = () => {
    setType('');
    pushFilters(city, '');
  };

  const activeFilterCount = [city, type].filter(Boolean).length;

  const typeOptions: { value: string; label: string }[] = useMemo(() => [
    { value: '', label: copy.allTypes },
    ...(Object.entries(TRAINING_TYPE_LABELS) as [TrainingType, string][]).map(([key]) => ({
      value: key,
      label: trainingLabel(key),
    })),
  ], [copy.allTypes, trainingLabel]);

  return (
    <div className="bg-[color:var(--pp-cream)] text-[color:var(--pp-ink)]">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,var(--pp-cream),var(--pp-trainer-bg),var(--pp-warm-white))]">
        <div className="absolute inset-0 paw-pattern opacity-[0.04]" />
        <div className="container relative mx-auto px-6 py-16 md:px-10 md:py-24 lg:px-16">
          <div className="max-w-3xl space-y-5">
            <PetParkBadge variant="trainer">{copy.eyebrow}</PetParkBadge>
            <h1 className="font-heading text-4xl font-black leading-[1.06] tracking-[-0.055em] md:text-6xl">
              {copy.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[color:var(--pp-muted)] md:text-lg">
              {copy.description}
            </p>
          </div>
        </div>
      </section>

      <div className="container relative z-10 mx-auto -mt-8 px-6 md:px-10 lg:px-16">
        <div className="rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] p-5 shadow-[var(--pp-shadow-card)] md:p-7">
          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-heading text-2xl font-black tracking-[-0.04em]">{copy.filterTitle}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-[color:var(--pp-muted)]">{copy.filterDescription}</p>
            </div>
            <p className="text-sm font-bold text-[color:var(--pp-muted)]">
              <span className="text-[color:var(--pp-ink)]">{trainers.length}</span>{' '}
              {trainers.length === 1 ? copy.resultsOne : copy.resultsMany}
              {city ? <span className="text-[color:var(--pp-trainer-accent)]"> · {city}</span> : null}
            </p>
          </div>

          <div className="mb-5 flex flex-wrap gap-2" aria-label={copy.type}>
            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setType(option.value)}
                data-active={type === option.value}
                className={`min-h-10 rounded-[var(--pp-radius-pill)] border px-4 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)] focus-visible:ring-offset-2 ${
                  type === option.value
                    ? 'border-[color:var(--pp-trainer-accent)] bg-[color:var(--pp-trainer-accent)] text-white'
                    : 'border-[color:var(--pp-line)] bg-[color:var(--pp-cream)] text-[color:var(--pp-muted)] hover:text-[color:var(--pp-ink)]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="training-city-filter">{copy.city}</label>
            <select
              id="training-city-filter"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="min-h-11 w-full rounded-[var(--pp-radius-16)] border border-[color:var(--pp-line)] bg-[color:var(--pp-cream)] px-3 py-2 text-[color:var(--pp-ink)] outline-none focus:ring-2 focus:ring-[color:var(--pp-logo-teal)] sm:max-w-[240px]"
            >
              <option value="">{copy.allCities}</option>
              {CITIES.map((availableCity) => (
                <option key={availableCity} value={availableCity}>{availableCity}</option>
              ))}
            </select>

            <Button onClick={() => pushFilters()} className="min-h-11 rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-forest)] px-6 font-extrabold text-white hover:bg-[color:var(--pp-forest-dark)]">
              {copy.apply}
            </Button>

            {activeFilterCount > 0 ? (
              <button onClick={clearFilters} className="min-h-10 rounded-[var(--pp-radius-pill)] px-3 text-sm font-extrabold text-[color:var(--pp-trainer-accent)] hover:bg-[color:var(--pp-cream)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)]">
                {copy.clearAll}
              </button>
            ) : null}

            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" />} className="relative ml-auto rounded-[var(--pp-radius-pill)] sm:hidden">
                <SlidersHorizontal className="mr-1.5 h-4 w-4" />
                {copy.more}
                {activeFilterCount > 0 ? (
                  <Badge className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center bg-[color:var(--pp-trainer-accent)] p-0 text-xs">
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] overflow-y-auto">
                <SheetTitle className="mb-6 font-heading">{isEn ? 'Filters' : 'Filteri'}</SheetTitle>
                <div className="space-y-5">
                  <div>
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[color:var(--pp-muted)]">{copy.type}</p>
                    <div className="flex flex-wrap gap-2">
                      {typeOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setType(option.value)}
                          className={`min-h-10 rounded-[var(--pp-radius-pill)] border px-3 text-xs font-extrabold ${type === option.value ? 'border-[color:var(--pp-trainer-accent)] bg-[color:var(--pp-trainer-accent)] text-white' : 'border-[color:var(--pp-line)] bg-[color:var(--pp-cream)] text-[color:var(--pp-muted)]'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="training-mobile-city-filter" className="mb-3 block text-xs font-black uppercase tracking-[0.16em] text-[color:var(--pp-muted)]">{copy.city}</label>
                    <select id="training-mobile-city-filter" value={city} onChange={(event) => setCity(event.target.value)} className="min-h-11 w-full rounded-[var(--pp-radius-16)] border border-[color:var(--pp-line)] bg-[color:var(--pp-cream)] px-3 py-2 outline-none focus:ring-2 focus:ring-[color:var(--pp-logo-teal)]">
                      <option value="">{copy.allCities}</option>
                      {CITIES.map((availableCity) => <option key={availableCity} value={availableCity}>{availableCity}</option>)}
                    </select>
                  </div>
                  <Button onClick={() => pushFilters()} className="w-full rounded-[var(--pp-radius-pill)] bg-[color:var(--pp-forest)] font-extrabold hover:bg-[color:var(--pp-forest-dark)]">
                    {copy.applyFilters}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {activeFilterCount > 0 ? (
        <div className="container mx-auto px-6 pt-6 md:px-10 lg:px-16">
          <div className="flex flex-wrap gap-2">
            {city ? (
              <Badge variant="secondary" className="gap-1.5 rounded-[var(--pp-radius-pill)] border-[color:var(--pp-trainer-accent)]/20 bg-[color:var(--pp-trainer-bg)] px-3 py-1.5 text-[color:var(--pp-trainer-accent)]">
                <MapPin className="h-3 w-3" />{city}
                <button type="button" onClick={removeCity} aria-label={isEn ? 'Remove city filter' : 'Ukloni filter grada'} className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)]">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null}
            {type ? (
              <Badge variant="secondary" className="gap-1.5 rounded-[var(--pp-radius-pill)] border-[color:var(--pp-trainer-accent)]/20 bg-[color:var(--pp-trainer-bg)] px-3 py-1.5 text-[color:var(--pp-trainer-accent)]">
                {trainingLabel(type as TrainingType)}
                <button type="button" onClick={removeType} aria-label={isEn ? 'Remove training type filter' : 'Ukloni filter vrste treninga'} className="ml-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-logo-teal)]">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="container mx-auto px-6 py-10 md:px-10 lg:px-16">
        {trainers.length === 0 ? (
          <EmptyStateCard
            variant="waitlist"
            title={copy.emptyTitle}
            description={copy.emptyDescription}
            primaryActionLabel={copy.emptyPrimary}
            primaryActionHref={basePath}
            secondaryActionLabel={copy.emptySecondary}
            secondaryActionHref="/kontakt"
            icon={<GraduationCap className="h-8 w-8" />}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {trainers.map((trainer) => (
              <ServiceListingCard
                key={trainer.id}
                name={trainer.name}
                city={trainer.city}
                description={trainer.description}
                href={trainer.profileHref}
                initials={trainer.name.charAt(0).toUpperCase()}
                serviceTags={trainer.specializations.map((item) => trainingLabel(item))}
                metaTags={trainer.certificates}
                verified={trainer.certified}
                rating={trainer.rating}
                reviewCount={trainer.reviewCount}
                priceFrom={trainer.priceFrom}
                priceLabel={copy.priceFrom}
                priceFallbackLabel={copy.priceFallback}
                noReviewsLabel={copy.noReviews}
                reviewsLabel={copy.reviewsLabel}
                priceTitle={copy.priceTitle}
                verifiedLabel={copy.verified}
                ctaLabel={copy.profileCta}
                categoryLabel={copy.categoryLabel}
                responseLabel={trainer.responseLabel || copy.responseLabel}
                variant="trainer"
              />
            ))}
          </div>
        )}

        <aside className="mt-8 rounded-[var(--pp-radius-32)] border border-[color:var(--pp-line)] bg-[color:var(--pp-warm-white)] p-5 shadow-[var(--pp-shadow-card)]">
          <h2 className="font-heading text-2xl font-black tracking-[-0.04em]">{copy.trustTitle}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[copy.trustOne, copy.trustTwo, copy.trustThree].map((item) => (
              <p key={item} className="rounded-[var(--pp-radius-20)] bg-[color:var(--pp-cream)] p-4 text-sm font-bold leading-6 text-[color:var(--pp-muted)]">
                {item}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
