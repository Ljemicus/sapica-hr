'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { enUS, hr } from 'date-fns/locale';
import {
  Star, MapPin, Clock, Shield, Award, Calendar, MessageCircle,
  Heart, ChevronLeft, CheckCircle2, Home, Dog, House, Eye, Sun,
  Share2, Check, ArrowRight, Camera, Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/shared/star-rating';
import { SERVICE_LABELS, type Availability, type ServiceType, type Pet } from '@/lib/types';
import type { PublicSitterProfile, PublicSitterSafeReview } from '@/lib/public/provider-profile-sanitizers';
import { useUser } from '@/hooks/use-user';
import { AvailabilityCalendar } from '@/components/shared/availability-calendar';
import { useLanguage } from '@/lib/i18n/context';
import { BookingDialog } from './booking-dialog';
import { ImageGallery } from '@/components/sitters/image-gallery';

const serviceIcons: Record<ServiceType, React.ElementType> = {
  boarding: Home,
  walking: Dog,
  'house-sitting': House,
  'drop-in': Eye,
  daycare: Sun,
};

const serviceColors: Record<ServiceType, string> = {
  boarding: 'from-orange-500 to-amber-500',
  walking: 'from-emerald-500 to-teal-500',
  'house-sitting': 'from-blue-500 to-cyan-500',
  'drop-in': 'from-purple-500 to-violet-500',
  daycare: 'from-rose-500 to-orange-500',
};

const serviceColorsBg: Record<ServiceType, string> = {
  boarding: 'bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400',
  walking: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400',
  'house-sitting': 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400',
  'drop-in': 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400',
  daycare: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400',
};

const SERVICE_LABELS_EN: Record<ServiceType, string> = {
  boarding: 'Boarding',
  walking: 'Walks',
  'house-sitting': 'House sitting',
  'drop-in': 'Drop-in visit',
  daycare: 'Day care',
};

interface SitterProfileContentProps {
  profile: PublicSitterProfile;
  reviews: PublicSitterSafeReview[];
  availability: Availability[];
  bookingPets: Pet[];
  bookingUserId: string | null;
}

export function SitterProfileContent({ profile, reviews, availability, bookingPets, bookingUserId }: SitterProfileContentProps) {
  const { user } = useUser();
  const [showBooking, setShowBooking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activePhoto] = useState(0);
  const router = useRouter();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const locale = isEn ? enUS : hr;
  const tService = (service: ServiceType) => isEn ? SERVICE_LABELS_EN[service] : SERVICE_LABELS[service];

  const copy = {
    back: isEn ? 'Back' : 'Natrag',
    share: isEn ? 'Share' : 'Podijeli',
    copied: isEn ? 'Copied!' : 'Kopirano!',
    linkCopied: isEn ? 'Link copied!' : 'Link kopiran!',
    copyFail: isEn ? 'Could not copy the link' : 'Nije moguće kopirati link',
    trustedSitter: isEn ? 'Trusted sitter' : 'Provjeren sitter',
    verifiedProfile: isEn ? 'Verified' : 'Verificiran',
    topPick: isEn ? 'Top pick' : 'Top izbor',
    reviewsLabel: isEn ? 'reviews' : 'recenzija',
    responds: isEn ? 'Replies' : 'Odgovara',
    yearsExperience: isEn ? 'yrs experience' : 'god. iskustva',
    yearsShort: isEn ? 'years' : 'godina',
    aboutKicker: isEn ? 'Get to know' : 'Upoznajte',
    about: isEn ? 'About the sitter' : 'O sitteru',
    bioFallback: isEn ? 'This sitter has not added a bio yet.' : 'Ovaj sitter još nije dodao opis.',
    servicesKicker: isEn ? 'What we offer' : 'Što nudimo',
    services: isEn ? 'Services & pricing' : 'Usluge i cijene',
    perDay: isEn ? '/ day' : '/ dan',
    reviewsKicker: isEn ? 'What others say' : 'Što kažu drugi',
    reviewsTitle: isEn ? 'Reviews' : 'Recenzije',
    noReviews: isEn ? 'No reviews yet' : 'Još nema recenzija',
    beFirst: isEn ? 'Be the first to share an experience with this sitter.' : 'Budite prvi koji će podijeliti iskustvo s ovim sitterom.',
    from: isEn ? 'from' : 'već od',
    priceByArrangement: isEn ? 'price by arrangement' : 'cijena po dogovoru',
    depending: isEn ? 'depending on service and timing' : 'ovisno o usluzi i terminu',
    sendBooking: isEn ? 'Book this sitter' : 'Rezerviraj sittera',
    sendMessage: isEn ? 'Send a message' : 'Pošalji poruku',
    signInSend: isEn ? 'Sign in to book' : 'Prijavi se za rezervaciju',
    next14: isEn ? 'Next 14 days' : 'Idućih 14 dana',
    available: isEn ? 'Available' : 'Dostupan',
    unavailable: isEn ? 'Unavailable' : 'Nedostupan',
    gallery: isEn ? 'Gallery' : 'Galerija',
    photos: isEn ? 'photos' : 'fotografija',
    experienceLabel: isEn ? 'Experience' : 'Iskustvo',
    ratingLabel: isEn ? 'Rating' : 'Ocjena',
    responseLabel: isEn ? 'Response' : 'Odgovor',
  };

  const availableDates = new Set(availability.map((a) => a.date));
  const hasPhotos = profile.photos && profile.photos.length > 0;
  const heroPhoto = hasPhotos ? profile.photos![activePhoto] || profile.photos![0] : null;
  const galleryPhotos = hasPhotos ? profile.photos! : [];

  const lowestPrice = Math.min(...Object.values(profile.prices).filter((p): p is number => typeof p === 'number' && p > 0));
  const hasReviews = profile.review_count > 0;
  const hasPrice = Number.isFinite(lowestPrice);

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
        {/* Background — photo or warm editorial gradient */}
        {heroPhoto ? (
          <>
            <Image
              src={heroPhoto}
              alt={profile.name || 'Sitter profile'}
              fill
              className="object-cover transition-opacity duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 detail-hero-gradient" />
            <div className="absolute inset-0 paw-pattern opacity-[0.04]" />
          </>
        )}

        {/* Navigation bar */}
        <div className="container mx-auto px-6 md:px-10 lg:px-16 relative z-10 pt-6 md:pt-8">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className={`rounded-full h-10 px-4 ${heroPhoto ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'}`}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {copy.back}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className={`rounded-full h-10 px-4 ${heroPhoto ? 'text-white/80 hover:text-white hover:bg-white/10' : 'text-foreground/70 hover:text-foreground hover:bg-foreground/5'}`}
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
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm ${heroPhoto ? 'bg-white/95 text-orange-600' : 'bg-warm-peach text-orange-700 dark:bg-warm-orange/20 dark:text-orange-400'}`}>
                <Heart className="h-3 w-3" />
                {copy.trustedSitter}
              </span>
              {profile.verified && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm ${heroPhoto ? 'bg-white/95 text-teal-600' : 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                  <Shield className="h-3 w-3" />
                  {copy.verifiedProfile}
                </span>
              )}
              {profile.superhost && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm ${heroPhoto ? 'bg-white/95 text-amber-600' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                  <Award className="h-3 w-3" />
                  {copy.topPick}
                </span>
              )}
              {profile.instant_booking && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-1.5 shadow-sm ${heroPhoto ? 'bg-white/95 text-purple-600' : 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'}`}>
                  <Zap className="h-3 w-3" />
                  {isEn ? 'Instant Book' : 'Trenutna Rezervacija'}
                </span>
              )}
            </div>

            {/* Identity */}
            <div className="flex items-end gap-5 md:gap-6 animate-fade-in-up delay-100">
              <div className="avatar-gradient-border flex-shrink-0 animate-scale-in">
                <Avatar className="h-24 w-24 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-white shadow-2xl">
                  <AvatarImage src={profile.avatarUrl || ''} alt={profile.name} />
                  <AvatarFallback className="bg-white text-gray-700 text-3xl md:text-4xl font-bold">
                    {profile.avatarInitials || profile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="pb-1">
                <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold font-[var(--font-heading)] leading-[1.05] mb-3 ${heroPhoto ? 'text-white drop-shadow-md' : ''}`}>
                  {profile.name}
                </h1>
                <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm ${heroPhoto ? 'text-white/85' : 'text-muted-foreground'}`}>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    {profile.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {hasReviews ? (
                      <Star className={`h-4 w-4 ${heroPhoto ? 'fill-amber-300 text-amber-300' : 'fill-amber-400 text-amber-400'}`} />
                    ) : (
                      <Heart className={`h-4 w-4 ${heroPhoto ? 'text-white/85' : 'text-emerald-600'}`} />
                    )}
                    {hasReviews && profile.rating_avg !== null ? profile.rating_avg.toFixed(1) : profile.noReviewsLabel}
                  </span>
                  {profile.response_time && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      {copy.responds} {profile.response_time}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                    {profile.experience_years} {copy.yearsExperience}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo gallery thumbnails — inline in hero */}
          {galleryPhotos.length > 0 && (
            <div className="mt-6 animate-fade-in-up delay-200">
              <ImageGallery 
                images={galleryPhotos}
                title=""
                maxThumbnails={5}
                className="!space-y-3"
              />
            </div>
          )}
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
                <p className="text-muted-foreground leading-relaxed text-[15px] md:text-base">{profile.bio || copy.bioFallback}</p>

                {/* Inline stats strip */}
                <div className="grid grid-cols-3 gap-4 mt-7 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {profile.review_count > 0 && profile.rating_avg !== null ? profile.rating_avg.toFixed(1) : '—'}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.ratingLabel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {profile.experience_years}
                    </div>
                    <div className="text-xs text-muted-foreground font-medium mt-1">{copy.yearsShort}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl font-extrabold text-gradient font-[var(--font-heading)]">
                      {profile.review_count}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.services.map((service) => {
                  const Icon = serviceIcons[service] || Heart;
                  const color = serviceColors[service] || 'from-orange-500 to-amber-500';
                  const bgColor = serviceColorsBg[service] || 'bg-orange-50 text-orange-600';
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
                          {profile.prices[service]}&euro; {copy.perDay}
                        </div>
                      </div>
                      <h3 className="font-bold text-base font-[var(--font-heading)]">{tService(service)}</h3>
                    </div>
                  );
                })}
              </div>
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
                <ImageGallery 
                  images={galleryPhotos}
                  title=""
                  maxThumbnails={8}
                />
              </section>
            )}

            {/* Availability Calendar */}
            <div className="animate-fade-in-up delay-200">
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
                          <AvatarImage src={review.reviewer?.avatar_url || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-300 text-white text-sm font-semibold">
                            {review.reviewer?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-bold text-sm">{review.reviewer?.name}</span>
                            <StarRating rating={review.rating} size="sm" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                            <span className={`inline-flex rounded-full px-2 py-0.5 font-medium ${serviceColorsBg[review.booking?.service_type as ServiceType] || 'bg-gray-100 text-gray-600'}`}>
                              {tService(review.booking?.service_type as ServiceType)}
                            </span>
                            <span>&middot;</span>
                            <span>{format(new Date(review.created_at), isEn ? 'MMM d, yyyy' : 'd. MMM yyyy.', { locale })}</span>
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
                  {hasPrice ? `${lowestPrice}€` : profile.priceFallbackLabel}
                </div>
                <p className="text-muted-foreground text-xs mt-2.5">{hasPrice ? copy.depending : copy.sendMessage}</p>
              </div>

              {/* Primary CTA */}
              {user && user.role === 'owner' ? (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-full h-13 text-[15px] font-bold"
                    size="lg"
                    onClick={() => setShowBooking(true)}
                  >
                    {copy.sendBooking}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                  <Link href={`/poruke?provider=${profile.id}`} className="block">
                    <Button
                      variant="outline"
                      className="w-full hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-600 hover:border-orange-300 rounded-full h-12 text-[15px] font-semibold"
                      size="lg"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      {copy.sendMessage}
                    </Button>
                  </Link>
                </div>
              ) : !user ? (
                <Link href={`/prijava?redirect=/sitter/${profile.id}`} className="block">
                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-lg shadow-orange-200/50 dark:shadow-orange-900/20 rounded-full h-13 text-[15px] font-bold"
                    size="lg"
                  >
                    {copy.signInSend}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : null}

              <Separator className="opacity-50" />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-warm-peach dark:bg-warm-orange/15 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 font-[var(--font-heading)]">{profile.review_count}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.reviewsLabel}</div>
                </div>
                <div className="rounded-2xl bg-teal-50 dark:bg-teal-900/20 px-4 py-4 text-center">
                  <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-[var(--font-heading)]">{profile.experience_years}</div>
                  <div className="text-[11px] text-muted-foreground font-medium mt-1 uppercase tracking-wider">{copy.experienceLabel}</div>
                </div>
              </div>

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

      {showBooking && user && (
        <BookingDialog
          open={showBooking}
          onOpenChange={setShowBooking}
          profile={profile}
          userId={bookingUserId || user.id}
          pets={bookingPets}
        />
      )}
    </div>
  );
}
