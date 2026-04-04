/**
 * Shared indexability helpers for PetPark.
 *
 * Purpose: prevent thin, seed, incomplete, or low-trust profiles/listings
 * from being indexed by search engines.
 *
 * Usage:
 *   const indexable = shouldIndexGroomer(groomer);
 *   // in generateMetadata:
 *   robots: indexable ? undefined : { index: false, follow: false }
 *
 * Rules:
 *   - `robots: undefined`  → Next.js uses default (index, follow) → Google indexes
 *   - `robots: { index: false, follow: false }` → noindex, nofollow
 */

import type { Groomer, Trainer, AdoptionListing, LostPet, SitterProfile, User } from '@/lib/types';

// ── Thresholds ──────────────────────────────────────────────────────────────

/** Min description length to be considered non-thin. */
const MIN_BIO_LENGTH = 20;

/** Min description length for adoption listings. */
const MIN_DESCRIPTION_LENGTH = 40;

// ── Groomer ─────────────────────────────────────────────────────────────────

/**
 * Returns true when the groomer profile has enough content to merit indexing.
 *
 * Thin groomer = missing name/city, or no bio, or bio too short.
 * Also blocks unverified profiles with zero reviews (seed/demo risk).
 */
export function shouldIndexGroomer(groomer: Groomer): boolean {
  if (!groomer.name?.trim()) return false;
  if (!groomer.city?.trim()) return false;

  const hasSubstantialBio = (groomer.bio?.trim().length ?? 0) >= MIN_BIO_LENGTH;
  const hasReviews = groomer.review_count > 0;
  const isVerified = groomer.verified === true;
  const hasDirectoryContact = Boolean(groomer.phone?.trim() || groomer.email?.trim() || groomer.address?.trim());

  // Account-based providers should have trust signals; directory entries can index if they have real bio + contact data.
  return hasSubstantialBio && (isVerified || hasReviews || hasDirectoryContact);
}

// ── Trainer ─────────────────────────────────────────────────────────────────

/**
 * Returns true when the trainer profile has enough content to merit indexing.
 *
 * Thin trainer = missing name/city, or no bio, or bio too short.
 * Also blocks uncertified profiles with zero reviews.
 */
export function shouldIndexTrainer(trainer: Trainer): boolean {
  if (!trainer.name?.trim()) return false;
  if (!trainer.city?.trim()) return false;

  const hasSubstantialBio = (trainer.bio?.trim().length ?? 0) >= MIN_BIO_LENGTH;
  const hasReviews = trainer.review_count > 0;
  const isCertified = trainer.certified === true;
  const hasDirectoryContact = Boolean(trainer.phone?.trim() || trainer.email?.trim() || trainer.address?.trim());

  return hasSubstantialBio && (isCertified || hasReviews || hasDirectoryContact);
}

// ── Adoption listing ────────────────────────────────────────────────────────

/**
 * Returns true when an adoption listing should be indexed.
 *
 * Rules:
 * - Must be `active` status (draft/paused/adopted/expired → noindex)
 * - Must have a name and city
 * - Must have a description long enough to be useful
 * - Must have at least one image (placeholder-only listings are thin)
 */
export function shouldIndexAdoption(listing: AdoptionListing): boolean {
  if (listing.status !== 'active') return false;
  if (!listing.name?.trim()) return false;
  if (!listing.city?.trim()) return false;
  if (!listing.description?.trim() || listing.description.trim().length < MIN_DESCRIPTION_LENGTH) return false;

  // Must have at least one image URL that isn't a placeholder
  const hasRealImage = listing.images?.some(
    (img) => img.url && !img.url.includes('placeholder')
  );
  if (!hasRealImage) return false;

  return true;
}

/**
 * Card-level adoption filter for use in the sitemap where full listing data
 * (including `description`) is not available.
 *
 * Applies lightweight rules: active status, name, city, real image.
 */
export function shouldIndexAdoptionCard(
  card: Pick<AdoptionListing, 'status' | 'name' | 'city' | 'images'>
): boolean {
  if (card.status !== 'active') return false;
  if (!card.name?.trim()) return false;
  if (!card.city?.trim()) return false;

  const hasRealImage = card.images?.some(
    (img) => img.url && !img.url.includes('placeholder')
  );
  return Boolean(hasRealImage);
}

// ── Lost pet ────────────────────────────────────────────────────────────────

/**
 * Returns true when a lost-pet report should be indexed.
 *
 * Rules:
 * - Status "found" → noindex (case resolved, no longer actionable)
 * - Must have name, city, description
 * - Must have a real image (not placeholder)
 * - Description must be meaningful
 */
export function shouldIndexLostPet(pet: LostPet): boolean {
  // Hidden by admin — must not be indexed
  if (pet.hidden) return false;
  // Resolved cases — no longer actionable, don't waste crawl budget
  if (pet.status === 'found') return false;

  if (!pet.name?.trim()) return false;
  if (!pet.city?.trim()) return false;
  if (!pet.description?.trim() || pet.description.trim().length < MIN_BIO_LENGTH) return false;

  const hasRealImage =
    pet.image_url &&
    !pet.image_url.includes('placeholder') &&
    !pet.image_url.startsWith('/images/placeholder');

  if (!hasRealImage) return false;

  return true;
}

// ── Sitter ──────────────────────────────────────────────────────────────────

/**
 * Returns true when a sitter profile has enough content to merit indexing.
 *
 * Thin sitter = no bio, no city, unverified with zero reviews.
 * Note: sitters are currently disabled (getSitters() returns []); this guard
 * is forward-compatible for when sitters are re-enabled.
 */
export function shouldIndexSitter(profile: SitterProfile & { user: User }): boolean {
  if (!profile.user.name?.trim()) return false;
  if (!profile.user.city?.trim()) return false;

  const hasSubstantialBio = (profile.bio?.trim().length ?? 0) >= MIN_BIO_LENGTH;
  const hasReviews = profile.review_count > 0;
  const isVerified = profile.verified === true;

  return hasSubstantialBio && (isVerified || hasReviews);
}

// ── Robots meta helper ──────────────────────────────────────────────────────

/**
 * Returns the `robots` value for Next.js `Metadata` based on a boolean flag.
 *
 * Usage:
 *   robots: robotsMeta(shouldIndexGroomer(groomer))
 */
export function robotsMeta(
  indexable: boolean
): { index: boolean; follow: boolean } | undefined {
  if (indexable) return undefined; // let Next.js default (index, follow)
  return { index: false, follow: false };
}
