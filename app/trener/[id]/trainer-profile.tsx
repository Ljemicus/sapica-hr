'use client';

import { useState } from 'react';
import { GraduationCap, BookOpen, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProfileHero } from '@/components/shared/petpark/profile-hero';
import { ReviewBlock } from '@/components/shared/petpark/review-block';
import { BookingCTASidebar } from '@/components/shared/petpark/booking-cta-sidebar';
import { TrustPanel } from '@/components/shared/petpark/trust-panel';
import { useLanguage } from '@/lib/i18n/context';
import type { PublicTrainerProfile, PublicProviderReview } from '@/lib/types/public-provider';
import type { TrainingType } from '@/lib/types';
import { TrainerBookingDialog } from './booking-dialog';

interface TrainerProfileProps {
  trainer: PublicTrainerProfile;
  reviews: PublicProviderReview[];
  availableDates: Set<string>;
}

const TRAINING_TYPE_LABELS_EN: Record<string, string> = {
  osnovna: 'Basic obedience',
  napredna: 'Advanced training',
  agility: 'Agility',
  ponasanje: 'Behaviour correction',
  stenci: 'Puppies',
};

export function TrainerProfile({ trainer, reviews, availableDates }: TrainerProfileProps) {
  const [showBooking, setShowBooking] = useState(false);
  const { language } = useLanguage();
  const isEn = language === 'en';

  const trainingLabel = (type: string) =>
    isEn ? TRAINING_TYPE_LABELS_EN[type] || type : type;

  const copy = {
    aboutKicker: isEn ? 'Get to know' : 'Upoznajte',
    about: isEn ? 'About the trainer' : 'O treneru',
    aboutFallback: isEn
      ? 'This trainer has not added a bio yet. Contact them directly for more information about their programs.'
      : 'Ovaj trener još nije dodao opis. Kontaktirajte ga izravno za više informacija o programima.',
    specializationsKicker: isEn ? 'Areas of expertise' : 'Područja stručnosti',
    specializations: isEn ? 'Specializations' : 'Specijalizacije',
    programsKicker: isEn ? 'Training plans' : 'Planovi treninga',
    programsTitle: isEn ? 'Programs' : 'Programi',
    noPrograms: isEn ? 'No published training programs yet' : 'Još nema objavljenih programa treninga',
    noProgramsText: isEn ? 'Contact the trainer for a custom plan or individual sessions.' : 'Kontaktirajte trenera za individualne dogovore',
    certificatesKicker: isEn ? 'Credentials' : 'Kvalifikacije',
    certificates: isEn ? 'Certificates' : 'Certifikati',
    ratingLabel: isEn ? 'Rating' : 'Ocjena',
    programsLabel: isEn ? 'Programs' : 'Programa',
    reviews: isEn ? 'reviews' : 'recenzija',
    weeks: isEn ? 'weeks' : 'tjedana',
    sessions: isEn ? 'sessions' : 'sesija',
    perHour: isEn ? 'per hour' : 'po satu',
  };

  return (
    <div className="concept-zero">
      <ProfileHero
        name={trainer.name}
        city={trainer.city}
        rating={trainer.rating}
        reviewCount={trainer.reviewCount}
        profileImage={trainer.profileImage}
        badges={[
          { icon: 'custom', label: isEn ? 'Dog trainer' : 'Trener pasa', customIcon: <GraduationCap className="h-3 w-3" /> },
          ...(trainer.certified ? [{ icon: 'certified' as const, label: isEn ? 'Certified trainer' : 'Certificirani trener' }] : []),
        ]}
        extraMeta={[
          ...(trainer.programs.length > 0 ? [{ icon: <BookOpen className="h-4 w-4 flex-shrink-0" />, label: `${trainer.programs.length} ${isEn ? 'programs' : 'programa'}` }] : []),
        ]}
      />

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
                <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{trainer.description || copy.aboutFallback}</p>

                {/* Inline stats strip */}
                <div className="grid grid-cols-3 gap-4 mt-7 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {trainer.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.ratingLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {trainer.programs.length}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.programsLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {trainer.reviewCount}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.reviews}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Specializations */}
            <section className="animate-fade-in-up delay-100">
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
            <section className="animate-fade-in-up delay-200">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.programsKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-6">
                {copy.programsTitle}
                <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-0 text-sm px-3 py-0.5 w-fit">
                  {trainer.programs.length}
                </Badge>
              </h2>
              {trainer.programs.length === 0 ? (
                <div className="detail-section-card p-10 md:p-12 text-center">
                  <div className="inline-flex h-16 w-16 rounded-full bg-warm-peach dark:bg-warm-orange/15 items-center justify-center mb-5">
                    <BookOpen className="h-7 w-7 text-warm-orange" />
                  </div>
                  <p className="text-foreground font-bold text-lg font-[var(--font-heading)] mb-2">{copy.noPrograms}</p>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">{copy.noProgramsText}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trainer.programs.map((program) => (
                    <div key={program.id} className="detail-section-card p-6 group">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors font-[var(--font-heading)]">{program.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1.5 bg-gray-50 dark:bg-gray-800">{trainingLabel(program.type)}</Badge>
                        </div>
                        <span className="text-2xl font-extrabold text-gradient font-[var(--font-heading)]">{program.price}€</span>
                      </div>
                      <p className="text-[15px] text-muted-foreground leading-relaxed mb-4">{program.description}</p>
                      <div className="flex items-center gap-5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-warm-orange" />{program.durationWeeks} {copy.weeks}</div>
                        <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-warm-orange" />{program.sessions} {copy.sessions}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Availability */}
            <div className="animate-fade-in-up delay-300">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{isEn ? 'Availability' : 'Dostupnost'}</p>
              {/* Simple availability calendar without slot selection for trainer */}
              <div className="detail-section-card p-7 md:p-8">
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
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-50 dark:bg-emerald-900/30 ring-1 ring-emerald-200 dark:ring-emerald-800" />
                    <span>{isEn ? 'Available' : 'Dostupan'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm bg-gray-50 dark:bg-gray-800/50 ring-1 ring-gray-200 dark:ring-gray-700" />
                    <span>{isEn ? 'Unavailable' : 'Nedostupan'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <ReviewBlock reviews={reviews} />

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

            {/* Trust Panel */}
            <TrustPanel />
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            <BookingCTASidebar
              priceFrom={trainer.priceFrom}
              priceUnit={copy.perHour}
              onBook={() => setShowBooking(true)}
              messageHref={`/poruke?trainer=${trainer.id}`}
              signInHref={`/prijava?redirect=/trener/${trainer.id}`}
              stats={[
                { value: trainer.programs.length, label: isEn ? 'programs' : 'programa', accent: 'orange' },
                { value: trainer.reviewCount, label: copy.reviews, accent: 'teal' },
                { value: trainer.specializations.length, label: isEn ? 'specializations' : 'specijalizacija', accent: 'indigo' },
                { value: trainer.certificates.length, label: isEn ? 'certificates' : 'certifikata', accent: 'blue' },
              ]}
              availableDates={availableDates}
            />
          </div>
        </div>
      </div>

      {showBooking && (
        <TrainerBookingDialog
          open={showBooking}
          onOpenChange={setShowBooking}
          trainer={{
            id: trainer.id,
            name: trainer.name,
            city: trainer.city,
            specializations: trainer.specializations as TrainingType[],
            price_per_hour: trainer.pricePerHour,
            certificates: trainer.certificates,
            rating: trainer.rating,
            review_count: trainer.reviewCount,
            bio: trainer.description || '',
            certified: trainer.certified,
          }}
          programs={trainer.programs.map((p) => ({
            id: p.id,
            trainer_id: trainer.id,
            name: p.name,
            type: p.type as any,
            duration_weeks: p.durationWeeks,
            sessions: p.sessions,
            price: p.price,
            description: p.description,
          }))}
        />
      )}
    </div>
  );
}
