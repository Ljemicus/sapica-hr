import type {
  Availability,
  Groomer,
  GroomingServiceType,
  GroomerSpecialization,
  PublicSitterReview,
  ServiceType,
  SitterProfile,
  Trainer,
  TrainingProgram,
  TrainingType,
} from '@/lib/types';

export type ProviderProfileType = 'groomer' | 'trainer' | 'sitter';

export type PublicGroomerProfile = {
  id: string;
  type: 'groomer';
  name: string;
  city: string;
  profileHref: string;
  safeBio: string;
  bio: string;
  services: GroomingServiceType[];
  serviceTags: string[];
  specialization: GroomerSpecialization;
  specializations: string[];
  verified: boolean;
  rating: number | null;
  reviewCount: number;
  review_count: number;
  prices: Record<GroomingServiceType, number>;
  priceFrom: number | null;
  noReviewsLabel: string;
  priceFallbackLabel: string;
  avatarInitials: string;
  availabilitySummary?: string;
  safeLocationDisplay?: string;
};

export type PublicTrainerProfile = {
  id: string;
  type: 'trainer';
  name: string;
  city: string;
  profileHref: string;
  safeBio: string;
  bio: string;
  serviceTags: string[];
  specializations: TrainingType[];
  certificates: string[];
  certified: boolean;
  rating: number | null;
  reviewCount: number;
  review_count: number;
  price_per_hour: number | null;
  priceFrom: number | null;
  noReviewsLabel: string;
  priceFallbackLabel: string;
  avatarInitials: string;
  availabilitySummary?: string;
  safeLocationDisplay?: string;
};

export type PublicSitterProfile = {
  id: string;
  type: 'sitter';
  name: string;
  city: string;
  profileHref: string;
  safeBio: string;
  bio: string;
  services: ServiceType[];
  serviceTags: string[];
  prices: Record<ServiceType, number>;
  verified: boolean;
  superhost: boolean;
  response_time: string | null;
  rating: number | null;
  rating_avg: number | null;
  reviewCount: number;
  review_count: number;
  priceFrom: number | null;
  noReviewsLabel: string;
  priceFallbackLabel: string;
  avatarInitials: string;
  avatarUrl: string | null;
  photos: string[];
  instant_booking?: boolean;
  availabilitySummary?: string;
  safeLocationDisplay?: string;
};

export type PublicGroomerPageData = {
  groomer: PublicGroomerProfile | null;
  reviews: ReturnType<typeof sanitizeProviderReviews>;
  availableDates: string[];
};

export type PublicTrainerPageData = {
  trainer: PublicTrainerProfile | null;
  programs: PublicTrainingProgram[];
  reviews: ReturnType<typeof sanitizeProviderReviews>;
  availableDates: string[];
};

export type PublicSitterPageData = {
  profile: PublicSitterProfile | null;
  reviews: PublicSitterReview[];
  availability: Availability[];
};

export type PublicTrainingProgram = TrainingProgram;

const NO_REVIEWS_HR = 'Novo na PetParku · još nema recenzija';
const PRICE_FALLBACK_HR = 'Cijena po dogovoru';

function safeText(value: string | null | undefined, fallback = ''): string {
  const text = String(value || '').trim();
  if (!text) return fallback;
  if (/\.test\b/i.test(text)) return fallback;
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text)) return fallback;
  if (/\+?\d[\d\s().-]{7,}/.test(text)) return fallback;
  return text;
}

function avatarInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'PP';
}

function ratingOrNull(rating: number | null | undefined, reviewCount: number): number | null {
  if (reviewCount <= 0) return null;
  const value = Number(rating || 0);
  return value > 0 ? value : null;
}

function priceFrom(values: Array<number | null | undefined>): number | null {
  const positive = values.map((value) => Number(value || 0)).filter((value) => value > 0);
  return positive.length > 0 ? Math.min(...positive) : null;
}

function sanitizePrices<T extends string>(prices: Record<T, number>): Record<T, number> {
  return Object.fromEntries(Object.entries(prices).map(([key, value]) => [key, Number(value || 0) > 0 ? Number(value) : 0])) as Record<T, number>;
}

export function sanitizeProviderReviews<T extends { id: string; rating: number; comment: string; created_at: string; author_name?: string; author_initial?: string }>(reviews: T[]) {
  return reviews.map((review) => ({
    ...review,
    author_name: safeText(review.author_name, 'PetPark korisnik'),
    author_initial: safeText(review.author_initial, 'P').slice(0, 2),
    comment: safeText(review.comment),
    rating: Number(review.rating || 0),
  }));
}

export function sanitizeGroomerProfile(groomer: Groomer | null): PublicGroomerProfile | null {
  if (!groomer) return null;
  const reviewCount = Number(groomer.review_count || 0);
  const prices = sanitizePrices(groomer.prices);
  const name = safeText(groomer.name, 'PetPark groomer');
  const city = safeText(groomer.city, 'Hrvatska');
  return {
    id: groomer.id,
    type: 'groomer',
    name,
    city,
    profileHref: `/groomer/${groomer.id}`,
    safeBio: safeText(groomer.bio, 'Profil groomera na PetParku.'),
    bio: safeText(groomer.bio, 'Profil groomera na PetParku.'),
    services: groomer.services,
    serviceTags: groomer.services,
    specialization: groomer.specialization,
    specializations: [groomer.specialization],
    verified: Boolean(groomer.verified),
    rating: ratingOrNull(groomer.rating, reviewCount),
    reviewCount,
    review_count: reviewCount,
    prices,
    priceFrom: priceFrom(Object.values(prices)),
    noReviewsLabel: NO_REVIEWS_HR,
    priceFallbackLabel: PRICE_FALLBACK_HR,
    avatarInitials: avatarInitials(name),
    safeLocationDisplay: city,
  };
}

export function sanitizeTrainerProfile(trainer: Trainer | null): PublicTrainerProfile | null {
  if (!trainer) return null;
  const reviewCount = Number(trainer.review_count || 0);
  const price = Number(trainer.price_per_hour || 0);
  const name = safeText(trainer.name, 'PetPark trener');
  const city = safeText(trainer.city, 'Hrvatska');
  return {
    id: trainer.id,
    type: 'trainer',
    name,
    city,
    profileHref: `/trener/${trainer.id}`,
    safeBio: safeText(trainer.bio, 'Profil trenera na PetParku.'),
    bio: safeText(trainer.bio, 'Profil trenera na PetParku.'),
    serviceTags: trainer.specializations,
    specializations: trainer.specializations,
    certificates: trainer.certificates.map((certificate) => safeText(certificate)).filter(Boolean),
    certified: Boolean(trainer.certified),
    rating: ratingOrNull(trainer.rating, reviewCount),
    reviewCount,
    review_count: reviewCount,
    price_per_hour: price > 0 ? price : null,
    priceFrom: price > 0 ? price : null,
    noReviewsLabel: NO_REVIEWS_HR,
    priceFallbackLabel: PRICE_FALLBACK_HR,
    avatarInitials: avatarInitials(name),
    safeLocationDisplay: city,
  };
}

export function sanitizeTrainingPrograms(programs: TrainingProgram[]): PublicTrainingProgram[] {
  return programs.map((program) => ({
    ...program,
    name: safeText(program.name, 'Program treninga'),
    description: safeText(program.description),
    price: Number(program.price || 0) > 0 ? Number(program.price) : 0,
  }));
}

export function sanitizeSitterProfile(profile: (SitterProfile & { user?: NonNullable<SitterProfile['user']> }) | null, routeId?: string): PublicSitterProfile | null {
  if (!profile) return null;
  const reviewCount = Number(profile.review_count || 0);
  const prices = sanitizePrices(profile.prices);
  const name = safeText(profile.user?.name, 'PetPark sitter');
  const city = safeText(profile.city || profile.user?.city, 'Hrvatska');
  return {
    id: routeId || profile.user_id,
    type: 'sitter',
    name,
    city,
    profileHref: `/sitter/${routeId || profile.user_id}`,
    safeBio: safeText(profile.bio, 'Profil sittera na PetParku.'),
    bio: safeText(profile.bio, 'Profil sittera na PetParku.'),
    services: profile.services,
    serviceTags: profile.services,
    prices,
    verified: Boolean(profile.verified),
    superhost: Boolean(profile.superhost),
    response_time: safeText(profile.response_time, '') || null,
    rating: ratingOrNull(profile.rating_avg, reviewCount),
    rating_avg: ratingOrNull(profile.rating_avg, reviewCount),
    reviewCount,
    review_count: reviewCount,
    priceFrom: priceFrom(Object.values(prices)),
    noReviewsLabel: NO_REVIEWS_HR,
    priceFallbackLabel: PRICE_FALLBACK_HR,
    avatarInitials: avatarInitials(name),
    avatarUrl: profile.user?.avatar_url || null,
    photos: Array.isArray(profile.photos) ? profile.photos : [],
    instant_booking: Boolean(profile.instant_booking),
    safeLocationDisplay: city,
  };
}
