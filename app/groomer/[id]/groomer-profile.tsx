'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import {
  Star, MapPin, Shield, ChevronLeft, Scissors, Droplets, Sparkles,
  Calendar, MessageCircle, Share2, Check, Clock, Mail,
  ClipboardList, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/shared/star-rating';
import { AvailabilityCalendar } from '@/components/shared/availability-calendar';
import {
  GROOMING_SERVICE_LABELS,
  GROOMER_SPECIALIZATION_LABELS,
  type GroomingServiceType,
  type GroomerAvailabilitySlot,
  type GroomerSpecialization,
} from '@/lib/types';
import type { PublicGroomerProfile, PublicProviderReview } from '@/lib/public/provider-profile-sanitizers';
import {
  getActiveServices,
  getOrderedDays,
  formatWorkingHours,
  hasWorkingHours,
} from '@/lib/profile-helpers';
import { useUser } from '@/hooks/use-user';
import { useLanguage } from '@/lib/i18n/context';
import { GroomerBookingDialog } from './booking-dialog';


const serviceIcons: Record<GroomingServiceType, React.ElementType> = {
  sisanje: Scissors,
  kupanje: Droplets,
  trimanje: Scissors,
  nokti: Scissors,
  cetkanje: Sparkles,
};

const serviceColors: Record<GroomingServiceType, string> = {
  sisanje: 'from-pink-500 to-rose-500',
  kupanje: 'from-blue-500 to-cyan-500',
  trimanje: 'from-purple-500 to-pink-500',
  nokti: 'from-orange-500 to-amber-500',
  cetkanje: 'from-teal-500 to-emerald-500',
};

const serviceColorsBg: Record<GroomingServiceType, string> = {
  sisanje: 'bg-pink-50 dark:bg-pink-950/20 text-pink-600 dark:text-pink-400',
  kupanje: 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
  trimanje: 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
  nokti: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
  cetkanje: 'bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400',
};

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

const DAY_LABELS_EN: Record<string, string> = {
  Pon: 'Mon', Uto: 'Tue', Sri: 'Wed', 'Čet': 'Thu', Pet: 'Fri', Sub: 'Sat', Ned: 'Sun',
};

interface GroomerProfileProps {
  groomer: PublicGroomerProfile;
  reviews: PublicProviderReview[];
  availableDates: Set<string>;
}

export function GroomerProfile({ groomer, reviews, availableDates }: GroomerProfileProps) {
  const { user } = useUser();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [availabilitySlots, setAvailabilitySlots] = useState<GroomerAvailabilitySlot[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [preselectedSlot, setPreselectedSlot] = useState<GroomerAvailabilitySlot | null>(null);
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;

  const lowestPrice = Math.min(...Object.values(groomer.prices).filter((price) => price > 0));
  const hasReviews = groomer.review_count > 0;
  const hasPrice = Number.isFinite(lowestPrice);
  const safeRatingLabel = hasReviews && groomer.rating !== null ? groomer.rating.toFixed(1) : groomer.noReviewsLabel;
  const safePriceLabel = hasPrice ? `${lowestPrice}` : groomer.priceFallbackLabel;
  const serviceLabel = (value: GroomingServiceType) =>
    isEn ? GROOMING_SERVICE_LABELS_EN[value] : GROOMING_SERVICE_LABELS[value];
  const specializationLabel = isEn
    ? GROOMER_SPECIALIZATION_LABELS_EN[groomer.specialization]
    : GROOMER_SPECIALIZATION_LABELS[groomer.specialization];
  const dayLabel = (day: string) => (isEn ? DAY_LABELS_EN[day] || day : day);

  const copy = {
    linkCopied: isEn ? 'Link copied!' : 'Link kopiran!',
    copyFail: isEn ? 'Could not copy the link' : 'Nije moguće kopirati link',
    back: isEn ? 'Back' : 'Natrag',
    share: isEn ? 'Share' : 'Podijeli',
    copied: isEn ? 'Copied!' : 'Kopirano!',
    verified: isEn ? 'Verified profile' : 'Verificiran profil',
    reviews: isEn ? 'reviews' : 'recenzija',
    services: isEn ? 'services' : 'usluga',
    aboutKicker: isEn ? 'Get to know' : 'Upoznajte',
    about: isEn ? 'About the groomer' : 'O groomeru',
    aboutFallback: isEn
      ? 'This groomer has not added a bio yet. Contact them directly for more information about their services.'
      : 'Ovaj groomer još nije dodao opis. Kontaktirajte ga izravno za više informacija o uslugama.',
    contactKicker: isEn ? 'Reach out' : 'Kontaktirajte nas',
    contact: isEn ? 'Contact information' : 'Kontakt informacije',
    phone: isEn ? 'Phone' : 'Telefon',
    email: 'Email',
    address: isEn ? 'Address' : 'Adresa',
    noContact: isEn
      ? 'No contact details listed yet. Use the contact button to send an inquiry.'
      : 'Kontakt informacije nisu navedene. Koristite gumb "Kontaktiraj" za upit.',
    servicesKicker: isEn ? 'What we offer' : 'Što nudimo',
    servicesPricing: isEn ? 'Services & pricing' : 'Usluge i cijene',
    noServices: isEn
      ? 'Services and pricing are not listed yet. Contact the groomer for more information.'
      : 'Usluge i cijene trenutno nisu navedene. Kontaktirajte za više informacija.',
    slotsKicker: isEn ? 'Book a time' : 'Rezervirajte termin',
    freeSlots: isEn ? 'Available slots' : 'Slobodni termini',
    loadingSlots: isEn ? 'Loading slots...' : 'Učitavam termine...',
    chooseDate: isEn
      ? 'Click an available date above to see open slots.'
      : 'Klikni na slobodan datum iznad da vidiš termine.',
    noDateSlots: isEn
      ? 'There are currently no open slots for the selected date.'
      : 'Za odabrani datum trenutno nema slobodnih termina.',
    reviewsKicker: isEn ? 'What others say' : 'Što kažu drugi',
    reviewsTitle: isEn ? 'Reviews' : 'Recenzije',
    noReviews: isEn ? 'No reviews yet' : 'Još nema recenzija',
    beFirst: isEn ? 'Be the first to rate this groomer.' : 'Budite prvi koji će ocijeniti ovog groomera.',
    from: isEn ? 'from' : 'već od',
    priceByArrangement: isEn ? 'price by arrangement' : 'cijena po dogovoru',
    depending: isEn ? 'depending on service and pet size' : 'ovisno o usluzi i veličini ljubimca',
    perService: isEn ? 'per service' : 'po usluzi',
    book: isEn ? 'Book appointment' : 'Zakaži termin',
    contactBtn: isEn ? 'Send a message' : 'Pošalji poruku',
    signIn: isEn ? 'Sign in to book' : 'Prijavi se za zakazivanje',
    workingHours: isEn ? 'Working hours' : 'Radno vrijeme',
    closed: isEn ? 'Closed' : 'Zatvoreno',
    next14: isEn ? 'Next 14 days' : 'Idućih 14 dana',
    available: isEn ? 'Available' : 'Dostupan',
    unavailable: isEn ? 'Unavailable' : 'Nedostupan',
    until: isEn ? 'until' : 'do',
    ratingLabel: isEn ? 'Rating' : 'Ocjena',
    servicesLabel: isEn ? 'Services' : 'Usluge',
  };

  useEffect(() => {
    const loadSlots = async () => {
      const fromDate = new Date().toISOString().split('T')[0];
      const toDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString().split('T')[0];
      setAvailabilityLoading(true);
      try {
        const response = await fetch(
          `/api/groomer-availability?groomer_id=${groomer.id}&from_date=${fromDate}&to_date=${toDate}`
        );
        const data = await response.json();
        setAvailabilitySlots(Array.isArray(data) ? data : []);
      } catch {
        setAvailabilitySlots([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };
    loadSlots();
  }, [groomer.id]);

  const selectedDateSlots = useMemo(
    () => availabilitySlots.filter((slot) => slot.date === selectedDate),
    [availabilitySlots, selectedDate]
  );

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success(copy.linkCopied);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(copy.copyFail);
    }
  };

  return (
    <div className="concept-zero overflow-x-clip">
      {/* ── Cinematic Hero ── */}
      <section className="relative overflow-hidden min-h-[70vh] md:min-h-[75vh] flex flex-col">
        <div className="absolute inset-0 detail-hero-gradient" />
        <div className="absolute inset-0 paw-pattern opacity-[0.04]" />

        {/* Navigation bar */}
        <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 pt-6 md:pt-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="rounded-full h-10 px-4 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {copy.back}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="rounded-full h-10 px-4 text-foreground/70 hover:text-foreground hover:bg-foreground/5"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Share2 className="h-4 w-4 mr-1" />}
              {copied ? copy.copied : copy.share}
            </Button>
          </div>
        </div>

        {/* Hero content — pushed to bottom */}
        <div className="flex-1" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 pb-12 md:pb-16 lg:pb-20">
          <div className="max-w-3xl">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-5 animate-fade-in-up">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm bg-warm-peach text-orange-700 dark:bg-warm-orange/20 dark:text-orange-400">
                <Scissors className="h-3 w-3" />
                {specializationLabel}
              </span>
              {groomer.verified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  <Shield className="h-3 w-3" />
                  {copy.verified}
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="flex items-end gap-5 md:gap-6 animate-fade-in-up delay-100">
              <div className="avatar-gradient-border flex-shrink-0 animate-scale-in">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-white shadow-2xl">
                  <AvatarFallback className="bg-white text-gray-700 text-3xl md:text-4xl font-bold">
                    {groomer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pb-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] leading-[1.05] mb-3">
                  {groomer.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {groomer.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {hasReviews ? (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ) : (
                      <Shield className="h-4 w-4 text-emerald-600" />
                    )}
                    {safeRatingLabel}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ClipboardList className="h-4 w-4 flex-shrink-0" />
                    {groomer.services.length} {copy.services}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Grid ── */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-12 md:py-16 lg:py-20 pb-24 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* ── Main Content ── */}
          <div className="lg:col-span-2 space-y-12 md:space-y-14">

            {/* About */}
            <section className="animate-fade-in-up">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.aboutKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-5">{copy.about}</h2>
              <div className="detail-section-card p-7 md:p-8">
                <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{groomer.bio || copy.aboutFallback}</p>

                {/* Inline stats strip */}
                <div className="grid grid-cols-3 gap-4 mt-7 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {hasReviews && groomer.rating !== null ? groomer.rating.toFixed(1) : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.ratingLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {groomer.services.length}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.servicesLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {groomer.review_count}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.reviews}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="animate-fade-in-up delay-100">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.contactKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-6">{copy.contact}</h2>
              <div className="detail-section-card p-10 md:p-12 text-center">
                <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
                  <Mail className="h-7 w-7 text-warm-orange" />
                </div>
                <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">{copy.contact}</p>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{copy.noContact}</p>
              </div>
            </section>

            {/* Services & Pricing */}
            <section className="animate-fade-in-up delay-200">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.servicesKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-6">{copy.servicesPricing}</h2>
              {getActiveServices(groomer).length === 0 ? (
                <div className="detail-section-card p-10 md:p-12 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
                    <Scissors className="h-7 w-7 text-warm-orange" />
                  </div>
                  <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">{copy.servicesPricing}</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{copy.noServices}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getActiveServices(groomer).map((service) => {
                    const Icon = serviceIcons[service];
                    const color = serviceColors[service];
                    const bgColor = serviceColorsBg[service];
                    return (
                      <div
                        key={service}
                        className="detail-section-card p-6 group cursor-default"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${bgColor}`}>
                            {groomer.prices[service]}&euro; {copy.perService}
                          </div>
                        </div>
                        <h3 className="font-bold text-base font-[var(--font-heading)]">{serviceLabel(service)}</h3>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Availability Calendar */}
            <div className="animate-fade-in-up delay-200">
              <AvailabilityCalendar
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {/* Time Slots */}
            <section className="animate-fade-in-up delay-300">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.slotsKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex items-center gap-3 mb-6">
                <Clock className="h-6 w-6 text-warm-orange" />
                {copy.freeSlots}
              </h2>
              <div className="detail-section-card p-7 md:p-8">
                {availabilityLoading ? (
                  <p className="text-sm text-muted-foreground">{copy.loadingSlots}</p>
                ) : !selectedDate ? (
                  <p className="text-sm text-muted-foreground">{copy.chooseDate}</p>
                ) : selectedDateSlots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{copy.noDateSlots}</p>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold">
                      {format(new Date(`${selectedDate}T00:00:00`), isEn ? 'MMMM d, yyyy' : 'd. MMMM yyyy.', { locale })}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {selectedDateSlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          className="rounded-xl border border-border/30 bg-white dark:bg-card p-4 text-left hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
                          onClick={() => { setPreselectedSlot(slot); setShowBooking(true); }}
                        >
                          <div className="font-bold text-sm text-orange-600 dark:text-orange-400 group-hover:text-orange-700">{slot.start_time.slice(0, 5)}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{copy.until} {slot.end_time.slice(0, 5)}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section className="animate-fade-in-up delay-300">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.reviewsKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex items-center gap-3 mb-6">
                {copy.reviewsTitle}
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-sm px-3 py-0.5">
                  {reviews.length}
                </Badge>
              </h2>

              {reviews.length === 0 ? (
                <div className="detail-section-card p-10 md:p-12 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
                    <MessageCircle className="h-7 w-7 text-warm-orange" />
                  </div>
                  <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">{copy.noReviews}</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{copy.beFirst}</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {reviews.map((review, i) => (
                    <div key={`${review.created_at}-${i}`} className={`detail-section-card p-6 md:p-7 ${i > 0 ? 'mt-4' : ''}`}>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-11 w-11 border-2 border-border/20 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm font-semibold">
                            {review.author_initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm">{review.author_name}</span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <div className="text-xs text-muted-foreground mb-3">
                            {format(new Date(review.created_at), isEn ? 'MMM d, yyyy' : 'd. MMM yyyy.', { locale })}
                          </div>
                          <p className="text-[15px] text-muted-foreground leading-relaxed">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ── Premium Sidebar ── */}
          <div className="space-y-6">
            <div className="detail-sidebar-panel sticky top-20 p-7 md:p-8 space-y-7">

              {/* Price hero */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">{hasPrice ? copy.from : copy.priceByArrangement}</p>
                <div className="text-4xl md:text-5xl font-extrabold text-gradient font-[var(--font-heading)] leading-none">
                  {hasPrice ? `${safePriceLabel}€` : safePriceLabel}
                </div>
                <p className="text-muted-foreground text-xs mt-2.5">{hasPrice ? copy.depending : copy.contactBtn}</p>
              </div>

              {/* Primary CTA */}
              {user ? (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-full h-13 text-[15px] font-bold"
                    size="lg"
                    onClick={() => setShowBooking(true)}
                  >
                    <Scissors className="h-4 w-4 mr-2" />
                    {copy.book}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Link href={`/poruke?groomer=${groomer.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:border-orange-300 rounded-full h-12 text-[15px] font-semibold"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {copy.contactBtn}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link href={`/prijava?redirect=/groomer/${groomer.id}`} className="block">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-full h-13 text-[15px] font-bold"
                    size="lg"
                  >
                    {copy.signIn}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}

              <Separator className="opacity-50" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-warm-peach dark:bg-warm-orange/15 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 font-[var(--font-heading)]">{groomer.services.length}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.services}</div>
                </div>
                <div className="rounded-2xl bg-teal-50 dark:bg-teal-900/20 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-[var(--font-heading)]">{groomer.review_count}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.reviews}</div>
                </div>
              </div>

              {/* Working Hours */}
              {hasWorkingHours(groomer) && (
                <>
                  <Separator className="opacity-50" />
                  <div>
                    <h3 className="font-bold text-sm mb-4 flex items-center gap-2 font-[var(--font-heading)]">
                      <Clock className="h-4 w-4 text-warm-orange" />{copy.workingHours}
                    </h3>
                    <div className="space-y-2.5">
                      {getOrderedDays().map((day) => {
                        const hours = groomer.working_hours?.[day];
                        return (
                          <div key={day} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{dayLabel(day)}</span>
                            {hours ? (
                              <span className="font-semibold">{formatWorkingHours(hours)}</span>
                            ) : (
                              <span className="text-muted-foreground/50">{copy.closed}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <Separator className="opacity-50" />

              {/* Mini 14-day calendar */}
              <div>
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2 font-[var(--font-heading)]">
                  <Calendar className="h-4 w-4 text-warm-orange" />
                  {copy.next14}
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
                        title={`${format(date, 'd.M.')} — ${isAvailable ? copy.available : copy.unavailable}`}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800" />
                    <span>{copy.available}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gray-50 dark:bg-gray-800/50 ring-1 ring-gray-200 dark:ring-gray-700" />
                    <span>{copy.unavailable}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <GroomerBookingDialog
          open={showBooking}
          onOpenChange={(open) => { setShowBooking(open); if (!open) setPreselectedSlot(null); }}
          groomer={groomer}
          initialDate={selectedDate || undefined}
          initialSlot={preselectedSlot}
        />
      )}
    </div>
  );
}
