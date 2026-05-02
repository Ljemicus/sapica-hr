'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import {
  Star, MapPin, Award, ChevronLeft, GraduationCap, Clock, Calendar,
  MessageCircle, CheckCircle2, Share2, Check, Mail,
  BookOpen, ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/shared/star-rating';
import { AvailabilityCalendar } from '@/components/shared/availability-calendar';
import { TRAINING_TYPE_LABELS, type TrainingProgram, type TrainingType } from '@/lib/types';
import type { PublicProviderReview, PublicTrainerProfile } from '@/lib/public/provider-profile-sanitizers';

import { useUser } from '@/hooks/use-user';
import { useLanguage } from '@/lib/i18n/context';
import { TrainerBookingDialog } from './booking-dialog';

const TRAINING_TYPE_LABELS_EN: Record<TrainingType, string> = { osnovna: 'Basic obedience', napredna: 'Advanced training', agility: 'Agility', ponasanje: 'Behaviour correction', stenci: 'Puppies' };

interface TrainerProfileProps { trainer: PublicTrainerProfile; programs: TrainingProgram[]; reviews: PublicProviderReview[]; availableDates: Set<string>; }

export function TrainerProfile({ trainer, programs, reviews, availableDates }: TrainerProfileProps) {
  const { user } = useUser();
  const router = useRouter();
  const [showBooking, setShowBooking] = useState(false);
  const [copied, setCopied] = useState(false);
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;
  const trainingLabel = (type: TrainingType) => isEn ? TRAINING_TYPE_LABELS_EN[type] : TRAINING_TYPE_LABELS[type];

  const hasReviews = trainer.review_count > 0;
  const safeRatingLabel = hasReviews && trainer.rating !== null ? trainer.rating.toFixed(1) : trainer.noReviewsLabel;
  const safeHourlyPrice = trainer.price_per_hour && trainer.price_per_hour > 0 ? trainer.price_per_hour : null;
  const hasPrice = safeHourlyPrice !== null;

  const copy = {
    linkCopied: isEn ? 'Link copied!' : 'Link kopiran!',
    copyFail: isEn ? 'Could not copy the link' : 'Nije moguće kopirati link',
    back: isEn ? 'Back' : 'Natrag',
    share: isEn ? 'Share' : 'Podijeli',
    copied: isEn ? 'Copied!' : 'Kopirano!',
    dogTrainer: isEn ? 'Dog trainer' : 'Trener pasa',
    certified: isEn ? 'Certificate listed' : 'Certifikat naveden',
    reviews: isEn ? 'reviews' : 'recenzija',
    programs: isEn ? 'programs' : 'programa',
    aboutKicker: isEn ? 'Get to know' : 'Upoznajte',
    about: isEn ? 'About the trainer' : 'O treneru',
    aboutFallback: isEn ? 'This trainer has not added a bio yet. Contact them directly for more information about their programs.' : 'Ovaj trener još nije dodao opis. Kontaktirajte ga izravno za više informacija o programima.',
    contactKicker: isEn ? 'Reach out' : 'Kontaktirajte nas',
    contact: isEn ? 'Contact information' : 'Kontakt informacije',
    phone: isEn ? 'Phone' : 'Telefon',
    email: 'Email',
    address: isEn ? 'Address' : 'Adresa',
    city: isEn ? 'City' : 'Grad',
    noContact: isEn ? 'No contact details listed yet. Use the message button or send a training request.' : 'Kontakt informacije nisu navedene. Koristite gumb za poruku ili upit za termin.',
    specializationsKicker: isEn ? 'Areas of expertise' : 'Područja stručnosti',
    specializations: isEn ? 'Specializations' : 'Specijalizacije',
    programsKicker: isEn ? 'Training plans' : 'Planovi treninga',
    programsTitle: isEn ? 'Programs' : 'Programi',
    noPrograms: isEn ? 'No published training programs yet' : 'Još nema objavljenih programa treninga',
    noProgramsText: isEn ? 'Contact the trainer for a custom plan or individual sessions.' : 'Kontaktirajte trenera za individualne dogovore',
    certificatesKicker: isEn ? 'Credentials' : 'Kvalifikacije',
    certificates: isEn ? 'Certificates' : 'Certifikati',
    reviewsKicker: isEn ? 'What others say' : 'Što kažu drugi',
    reviewsTitle: isEn ? 'Reviews' : 'Recenzije',
    noReviews: isEn ? 'No reviews yet' : 'Još nema recenzija',
    beFirst: isEn ? 'Be the first to share an experience with this trainer' : 'Budite prvi koji će podijeliti iskustvo s ovim trenerom',
    perHour: isEn ? 'per hour' : 'po satu',
    priceByArrangement: isEn ? 'price by arrangement' : 'cijena po dogovoru',
    specializationsCount: isEn ? 'specializations' : 'specijalizacija',
    certificatesCount: isEn ? 'certificates' : 'certifikata',
    book: isEn ? 'Book training' : 'Zakaži trening',
    contactBtn: isEn ? 'Send a message' : 'Pošalji poruku',
    signIn: isEn ? 'Sign in to book' : 'Prijavi se za zakazivanje',
    next14: isEn ? 'Next 14 days' : 'Idućih 14 dana',
    available: isEn ? 'Available' : 'Dostupan',
    unavailable: isEn ? 'Unavailable' : 'Nedostupan',
    weeks: isEn ? 'weeks' : 'tjedana',
    sessions: isEn ? 'sessions' : 'sesija',
    ratingLabel: isEn ? 'Rating' : 'Ocjena',
  };

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
                <GraduationCap className="h-3 w-3" />
                {copy.dogTrainer}
              </span>
              {trainer.certified && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
                  <Award className="h-3 w-3" />
                  {copy.certified}
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="flex items-end gap-5 md:gap-6 animate-fade-in-up delay-100">
              <div className="avatar-gradient-border flex-shrink-0 animate-scale-in">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-white shadow-2xl">
                  <AvatarFallback className="bg-white text-gray-700 text-3xl md:text-4xl font-bold">
                    {trainer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pb-1">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] leading-[1.05] mb-3">
                  {trainer.name}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {trainer.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {hasReviews ? (
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-teal-600" />
                    )}
                    {safeRatingLabel}
                  </span>
                  {programs.length > 0 && (
                    <span className="flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 flex-shrink-0" />
                      {programs.length} {copy.programs}
                    </span>
                  )}
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
                <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{trainer.bio || copy.aboutFallback}</p>

                {/* Inline stats strip */}
                <div className="grid grid-cols-3 gap-4 mt-7 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {hasReviews && trainer.rating !== null ? trainer.rating.toFixed(1) : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.ratingLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {programs.length}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.programs}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {trainer.review_count}
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

            {/* Specializations */}
            <section className="animate-fade-in-up delay-200">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.specializationsKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-6">{copy.specializations}</h2>
              <div className="detail-section-card p-7 md:p-8">
                <div className="flex flex-wrap gap-3">
                  {trainer.specializations.map((spec) => (
                    <Badge
                      key={spec}
                      className="bg-warm-peach dark:bg-warm-orange/15 text-orange-700 dark:text-orange-300 border-0 text-sm px-4 py-2 font-semibold rounded-xl"
                    >
                      {trainingLabel(spec)}
                    </Badge>
                  ))}
                </div>
              </div>
            </section>

            {/* Programs */}
            <section className="animate-fade-in-up delay-300">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.programsKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6">
                {copy.programsTitle}
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-sm px-3 py-0.5 w-fit">
                  {programs.length}
                </Badge>
              </h2>
              {programs.length === 0 ? (
                <div className="detail-section-card p-10 md:p-12 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
                    <BookOpen className="h-7 w-7 text-warm-orange" />
                  </div>
                  <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">{copy.noPrograms}</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{copy.noProgramsText}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {programs.map((program) => (
                    <div key={program.id} className="detail-section-card p-6 group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{program.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1.5 bg-gray-50 dark:bg-gray-800">{trainingLabel(program.type)}</Badge>
                        </div>
                        <span className="text-2xl font-extrabold text-gradient font-[var(--font-heading)]">{program.price}&euro;</span>
                      </div>
                      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">{program.description}</p>
                      <div className="flex items-center gap-5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-warm-orange" />{program.duration_weeks} {copy.weeks}</div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-warm-orange" />{program.sessions} {copy.sessions}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Availability */}
            <div className="animate-fade-in-up delay-300">
              <AvailabilityCalendar availableDates={availableDates} />
            </div>

            {/* Reviews */}
            <section className="animate-fade-in-up delay-300">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.reviewsKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6">
                {copy.reviewsTitle}
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-sm px-3 py-0.5 w-fit">
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

            {/* Certificates */}
            {trainer.certificates.length > 0 && (
              <section className="animate-fade-in-up delay-300">
                <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.certificatesKicker}</p>
                <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-6">{copy.certificates}</h2>
                <div className="space-y-3">
                  {trainer.certificates.map((cert) => (
                    <div key={cert} className="detail-section-card p-5 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-semibold">{cert}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Premium Sidebar ── */}
          <div className="space-y-6">
            <div className="detail-sidebar-panel sticky top-20 p-7 md:p-8 space-y-7">

              {/* Price hero */}
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-medium mb-2">
                  {hasPrice ? (isEn ? 'from' : 'već od') : copy.priceByArrangement}
                </p>
                <div className="text-4xl md:text-5xl font-extrabold text-gradient font-[var(--font-heading)] leading-none">
                  {hasPrice ? `${safeHourlyPrice}€` : trainer.priceFallbackLabel}
                </div>
                <p className="text-muted-foreground text-xs mt-2.5">{hasPrice ? copy.perHour : copy.contactBtn}</p>
              </div>

              {/* Primary CTA */}
              {user ? (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-full h-13 text-[15px] font-bold"
                    size="lg"
                    onClick={() => setShowBooking(true)}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {copy.book}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Link href={`/poruke?trainer=${trainer.id}`} className="block">
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
                <Link href={`/prijava?redirect=/trener/${trainer.id}`} className="block">
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
                  <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 font-[var(--font-heading)]">{programs.length}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.programs}</div>
                </div>
                <div className="rounded-2xl bg-teal-50 dark:bg-teal-900/20 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-[var(--font-heading)]">{trainer.review_count}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.reviews}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-[var(--font-heading)]">{trainer.specializations.length}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.specializationsCount}</div>
                </div>
                <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-[var(--font-heading)]">{trainer.certificates.length}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.certificatesCount}</div>
                </div>
              </div>

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

      {showBooking && <TrainerBookingDialog open={showBooking} onOpenChange={setShowBooking} trainer={trainer} programs={programs} />}
    </div>
  );
}
