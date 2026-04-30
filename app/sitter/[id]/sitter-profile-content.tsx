'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Heart, Award, Zap, Star, Clock, CheckCircle2, Camera } from 'lucide-react';
import { ProfileHero } from '@/components/shared/petpark/profile-hero';
import { ReviewBlock } from '@/components/shared/petpark/review-block';
import { ServicesPrices } from '@/components/shared/petpark/services-prices';
import { BookingCTASidebar } from '@/components/shared/petpark/booking-cta-sidebar';
import { TrustPanel } from '@/components/shared/petpark/trust-panel';
import { useLanguage } from '@/lib/i18n/context';
import { useUser } from '@/hooks/use-user';
import { AvailabilityCalendar } from '@/components/shared/availability-calendar';
import type { PublicSitterProfile, PublicProviderReview } from '@/lib/types/public-provider';
import type { Availability, ServiceType } from '@/lib/types';
import { SERVICE_LABELS } from '@/lib/types';
import { BookingDialog } from './booking-dialog';

interface SitterProfileContentProps {
  profile: PublicSitterProfile;
  reviews: PublicProviderReview[];
  availability: Availability[];
}

const SERVICE_LABELS_EN: Record<string, string> = {
  boarding: 'Overnight stay',
  walking: 'Dog walking',
  'house-sitting': 'House sitting',
  'drop-in': 'Drop-in visit',
  daycare: 'Day care',
};

export function SitterProfileContent({ profile, reviews, availability }: SitterProfileContentProps) {
  const { user } = useUser();
  const [showBooking, setShowBooking] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const { language } = useLanguage();
  const isEn = language === 'en';

  const tService = (service: string) =>
    isEn ? SERVICE_LABELS_EN[service] || service : SERVICE_LABELS[service as ServiceType] || service;

  const copy = {
    trustedSitter: isEn ? 'Trusted sitter' : 'Provjeren sitter',
    verifiedProfile: isEn ? 'Verified' : 'Verificiran',
    topPick: isEn ? 'Top pick' : 'Top izbor',
    instantBook: isEn ? 'Instant Book' : 'Trenutna Rezervacija',
    responds: isEn ? 'Replies' : 'Odgovara',
    yearsExperience: isEn ? 'yrs experience' : 'god. iskustva',
    aboutKicker: isEn ? 'Get to know' : 'Upoznajte',
    about: isEn ? 'About the sitter' : 'O sitteru',
    bioFallback: isEn ? 'This sitter has not added a bio yet.' : 'Ovaj sitter još nije dodao opis.',
    servicesKicker: isEn ? 'What we offer' : 'Što nudimo',
    services: isEn ? 'Services & pricing' : 'Usluge i cijene',
    perDay: isEn ? '/ day' : '/ dan',
    gallery: isEn ? 'Gallery' : 'Galerija',
    photos: isEn ? 'photos' : 'fotografija',
    ratingLabel: isEn ? 'Rating' : 'Ocjena',
    experienceLabel: isEn ? 'Experience' : 'Iskustvo',
    reviewsLabel: isEn ? 'reviews' : 'recenzija',
    book: isEn ? 'Book this sitter' : 'Rezerviraj sittera',
  };

  const availableDates = new Set(availability.map((a) => a.date));
  const hasPhotos = profile.photos && profile.photos.length > 0;
  const heroPhoto = hasPhotos ? profile.photos[activePhoto] || profile.photos[0] : null;
  const galleryPhotos = hasPhotos ? profile.photos : [];

  const servicePrices = profile.services.map((s) => ({
    service: s,
    label: tService(s),
    price: profile.prices[s] || 0,
  }));

  const badges = [
    { icon: 'custom' as const, label: copy.trustedSitter, customIcon: <Heart className="h-3 w-3" /> },
    ...(profile.verified ? [{ icon: 'verified' as const, label: copy.verifiedProfile }] : []),
    ...(profile.superhost ? [{ icon: 'custom' as const, label: copy.topPick, customIcon: <Award className="h-3 w-3" /> }] : []),
    ...(profile.instantBooking ? [{ icon: 'custom' as const, label: copy.instantBook, customIcon: <Zap className="h-3 w-3" /> }] : []),
  ];

  const extraMeta = [
    { icon: <Star className="h-4 w-4 flex-shrink-0" />, label: `${profile.rating.toFixed(1)} (${profile.reviewCount})` },
    ...(profile.responseTime ? [{ icon: <Clock className="h-4 w-4 flex-shrink-0" />, label: `${copy.responds} ${profile.responseTime}` }] : []),
    { icon: <CheckCircle2 className="h-4 w-4 flex-shrink-0" />, label: `${profile.experienceYears} ${copy.yearsExperience}` },
  ];

  return (
    <div className="concept-zero">
      <ProfileHero
        name={profile.name}
        city={profile.city}
        rating={profile.rating}
        reviewCount={profile.reviewCount}
        profileImage={profile.profileImage}
        badges={badges}
        extraMeta={extraMeta}
        hasPhotoBackground={!!heroPhoto}
      />

      {/* Photo gallery thumbnails — inline below hero */}
      {galleryPhotos.length > 0 && (
        <div className="container mx-auto px-6 md:px-10 lg:px-16 -mt-8 relative z-10">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {galleryPhotos.slice(0, 5).map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhoto(i)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  i === activePhoto ? 'border-orange-500 shadow-lg' : 'border-white/50 hover:border-white'
                }`}
              >
                <Image src={photo} alt={`${profile.name} photo ${i + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

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
                <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{profile.description || copy.bioFallback}</p>

                {/* Inline stats strip */}
                <div className="grid grid-cols-3 gap-4 mt-7 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {profile.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.ratingLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {profile.experienceYears}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.experienceLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {profile.reviewCount}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.reviewsLabel}</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Services & Pricing */}
            <section className="animate-fade-in-up delay-100">
              <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.servicesKicker}</p>
              <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight mb-6">{copy.services}</h2>
              <ServicesPrices
                services={servicePrices}
                unitLabel={copy.perDay}
                emptyMessage={isEn ? 'Pricing available on request' : 'Cijena po dogovoru'}
              />
            </section>

            {/* Photo Gallery — full section */}
            {galleryPhotos.length > 0 && (
              <section className="animate-fade-in-up delay-200">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm uppercase tracking-[0.25em] text-warm-orange mb-3 font-semibold">{copy.gallery}</p>
                    <h2 className="text-2xl md:text-3xl font-extrabold font-[var(--font-heading)] leading-tight flex items-center gap-3">
                      <Camera className="h-6 w-6 text-warm-orange" />
                      {galleryPhotos.length} {copy.photos}
                    </h2>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryPhotos.map((photo, i) => (
                    <button
                      key={i}
                      onClick={() => setActivePhoto(i)}
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                        i === activePhoto ? 'border-orange-500 shadow-lg' : 'border-transparent hover:border-orange-300'
                      }`}
                    >
                      <Image src={photo} alt={`${profile.name} photo ${i + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Availability Calendar */}
            <div className="animate-fade-in-up delay-200">
              <AvailabilityCalendar availableDates={availableDates} />
            </div>

            {/* Reviews */}
            <ReviewBlock
              reviews={reviews}
              serviceLabel={tService}
              reviewServiceType={reviews[0] ? 'boarding' : undefined}
            />

            {/* Trust Panel */}
            <TrustPanel />
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">
            <BookingCTASidebar
              priceFrom={profile.priceFrom}
              priceUnit={copy.perDay}
              onBook={() => setShowBooking(true)}
              messageHref={`/poruke?to=${profile.id}`}
              signInHref={`/prijava?redirect=/sitter/${profile.id}`}
              stats={[
                { value: profile.reviewCount, label: copy.reviewsLabel, accent: 'orange' },
                { value: profile.experienceYears, label: copy.experienceLabel, accent: 'teal' },
              ]}
              availableDates={availableDates}
            />
          </div>
        </div>
      </div>

      {showBooking && user && (
        <BookingDialog
          open={showBooking}
          onOpenChange={setShowBooking}
          profile={{
            user_id: profile.id,
            bio: profile.description,
            experience_years: profile.experienceYears,
            services: profile.services as ServiceType[],
            prices: profile.prices as Record<ServiceType, number>,
            verified: profile.verified,
            superhost: profile.superhost,
            response_time: profile.responseTime,
            rating_avg: profile.rating,
            review_count: profile.reviewCount,
            location_lat: null,
            location_lng: null,
            city: profile.city,
            photos: profile.photos,
            created_at: new Date().toISOString(),
            instant_booking: profile.instantBooking,
            user: {
              id: profile.id,
              email: '',
              name: profile.name,
              role: 'sitter',
              avatar_url: profile.profileImage,
              phone: null,
              city: profile.city,
              created_at: new Date().toISOString(),
            },
          }}
          userId={user.id}
          pets={[]}
        />
      )}
    </div>
  );
}
