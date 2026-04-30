// ── Public Profile Sanitizers ──
// Convert internal DB types to sanitized public view models.

import type {
  Groomer,
  Trainer,
  TrainingProgram,
  SitterProfile,
  User,
} from './types';
import type {
  PublicGroomerProfile,
  PublicTrainerProfile,
  PublicSitterProfile,
  PublicProviderReview,
  PublicTrainingProgram,
} from './types/public-provider';

function sanitizeName(name: string): string {
  if (!name || name === 'test' || name.startsWith('test_')) return 'PetPark partner';
  return name;
}

function sanitizeDescription(bio?: string | null): string | null {
  if (!bio || bio === 'test' || bio.startsWith('test_')) return null;
  return bio;
}

function priceFrom(prices: Record<string, number>): number | null {
  const valid = Object.values(prices).filter((p) => typeof p === 'number' && p > 0);
  if (valid.length === 0) return null;
  return Math.min(...valid);
}

// ── Groomer ──

export function toPublicGroomer(groomer: Groomer): PublicGroomerProfile {
  return {
    id: groomer.id,
    name: sanitizeName(groomer.name),
    city: groomer.city || 'Hrvatska',
    description: sanitizeDescription(groomer.bio),
    specializations: groomer.services || [],
    certificates: [],
    certified: groomer.verified,
    rating: groomer.rating || 0,
    reviewCount: groomer.review_count || 0,
    priceFrom: priceFrom(groomer.prices),
    services: groomer.services || [],
    availability: [], // filled separately
    profileImage: null,
    verified: groomer.verified,
    category: 'groomer',
    specialization: groomer.specialization || 'oba',
    prices: groomer.prices || {},
    workingHours: groomer.working_hours,
  };
}

export function toPublicGroomerReviews(
  reviews: Array<{
    id: string;
    author_name: string;
    author_initial: string;
    rating: number;
    comment: string;
    created_at: string;
  }>
): PublicProviderReview[] {
  return reviews.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    authorInitial: r.author_initial,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));
}

// ── Trainer ──

export function toPublicTrainer(trainer: Trainer, programs: TrainingProgram[]): PublicTrainerProfile {
  return {
    id: trainer.id,
    name: sanitizeName(trainer.name),
    city: trainer.city || 'Hrvatska',
    description: sanitizeDescription(trainer.bio),
    specializations: trainer.specializations || [],
    certificates: trainer.certificates || [],
    certified: trainer.certified,
    rating: trainer.rating || 0,
    reviewCount: trainer.review_count || 0,
    priceFrom: trainer.price_per_hour > 0 ? trainer.price_per_hour : null,
    services: trainer.specializations || [],
    availability: [], // filled separately
    profileImage: null,
    verified: trainer.certified,
    category: 'trainer',
    pricePerHour: trainer.price_per_hour || 0,
    programs: programs.map(toPublicProgram),
  };
}

function toPublicProgram(program: TrainingProgram): PublicTrainingProgram {
  return {
    id: program.id,
    name: program.name,
    type: program.type,
    durationWeeks: program.duration_weeks,
    sessions: program.sessions,
    price: program.price,
    description: program.description,
  };
}

export function toPublicTrainerReviews(
  reviews: Array<{
    id: string;
    author_name: string;
    author_initial: string;
    rating: number;
    comment: string;
    created_at: string;
  }>
): PublicProviderReview[] {
  return reviews.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    authorInitial: r.author_initial,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));
}

// ── Sitter ──

export function toPublicSitter(
  profile: SitterProfile & { user: User }
): PublicSitterProfile {
  return {
    id: profile.user_id,
    name: sanitizeName(profile.user?.name || 'Sitter'),
    city: profile.city || 'Hrvatska',
    description: sanitizeDescription(profile.bio),
    specializations: profile.services || [],
    certificates: [],
    certified: profile.verified,
    rating: profile.rating_avg || 0,
    reviewCount: profile.review_count || 0,
    priceFrom: priceFrom(profile.prices),
    services: profile.services || [],
    availability: [], // filled separately
    profileImage: profile.user?.avatar_url || null,
    verified: profile.verified,
    category: 'sitter',
    experienceYears: profile.experience_years || 0,
    superhost: profile.superhost,
    responseTime: profile.response_time,
    photos: profile.photos || [],
    instantBooking: profile.instant_booking || false,
    prices: profile.prices || {},
  };
}
