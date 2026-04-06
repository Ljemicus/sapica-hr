// AI Matching Algorithm for PetPark
// Matches pets with optimal sitters based on multiple weighted factors

import type { Pet, SitterProfile, User, ServiceType } from '@/lib/types';

export interface MatchingCriteria {
  petId: string;
  serviceType: ServiceType;
  startDate: string;
  endDate: string;
  ownerCity?: string;
  maxDistance?: number; // km
  budgetMax?: number;
  preferredLanguages?: string[];
}

export interface MatchScore {
  sitterId: string;
  sitter: SitterProfile & { user: User };
  totalScore: number;
  breakdown: {
    locationScore: number;      // 25% - distance from owner/pet
    availabilityScore: number;  // 20% - calendar availability
    experienceScore: number;    // 20% - species/size experience
    ratingScore: number;        // 15% - reviews and rating
    priceScore: number;         // 10% - budget fit
    specialNeedsScore: number;  // 10% - special needs compatibility
  };
  reasons: string[]; // Human-readable reasons for match
}

interface MatchingWeights {
  location: number;
  availability: number;
  experience: number;
  rating: number;
  price: number;
  specialNeeds: number;
}

const DEFAULT_WEIGHTS: MatchingWeights = {
  location: 0.25,
  availability: 0.20,
  experience: 0.20,
  rating: 0.15,
  price: 0.10,
  specialNeeds: 0.10,
};

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Score location proximity (0-100)
function scoreLocation(
  sitter: SitterProfile,
  ownerCity?: string,
  ownerLat?: number,
  ownerLng?: number,
  maxDistance: number = 50
): number {
  // If we have coordinates, use distance calculation
  if (ownerLat && ownerLng && sitter.location_lat && sitter.location_lng) {
    const distance = calculateDistance(
      ownerLat,
      ownerLng,
      sitter.location_lat,
      sitter.location_lng
    );
    
    if (distance > maxDistance) return 0;
    
    // Exponential decay: closer is much better
    return Math.round(100 * Math.exp(-distance / 10));
  }
  
  // Fallback to city matching
  if (ownerCity && sitter.city) {
    const sameCity = sitter.city.toLowerCase() === ownerCity.toLowerCase();
    return sameCity ? 80 : 40;
  }
  
  return 50; // Neutral if no location data
}

// Score availability (0-100) - placeholder, actual check in DB
function scoreAvailability(
  _sitter: SitterProfile,
  _startDate: string,
  _endDate: string
): number {
  // This is a placeholder - actual availability should be checked against bookings table
  // For now, assume available and let the DB query filter unavailable sitters
  return 80;
}

// Score experience with pet type and size (0-100)
function scoreExperience(
  sitter: SitterProfile,
  pet: Pet
): number {
  let score = 50; // Base score
  const reasons: string[] = [];
  
  // More years of experience = higher score
  if (sitter.experience_years >= 5) {
    score += 20;
  } else if (sitter.experience_years >= 2) {
    score += 10;
  }
  
  // Check if sitter mentions pet species in bio (simple keyword check)
  const bio = sitter.bio?.toLowerCase() || '';
  const speciesKeywords: Record<string, string[]> = {
    dog: ['pas', 'psi', 'pasa', 'dog', 'dogs', 'puppy', 'štene'],
    cat: ['mačka', 'mačke', 'cat', 'cats', 'kitten', 'mače'],
    other: ['ptica', 'riba', 'glodavac', 'bird', 'fish', 'rodent'],
  };
  
  const keywords = speciesKeywords[pet.species] || [];
  const mentionsSpecies = keywords.some(kw => bio.includes(kw));
  
  if (mentionsSpecies) {
    score += 15;
    reasons.push(`Ima iskustva s ${pet.species === 'dog' ? 'psima' : pet.species === 'cat' ? 'mačkama' : 'egzotičnim ljubimcima'}`);
  }
  
  // Size experience (if weight info available)
  if (pet.weight) {
    const sizeCategory = pet.weight < 10 ? 'small' : pet.weight < 25 ? 'medium' : 'large';
    const sizeKeywords: Record<string, string[]> = {
      small: ['mali', 'maleni', 'small', 'tiny', 'štene'],
      medium: ['srednji', 'medium', 'prosječan'],
      large: ['veliki', 'large', 'big', 'ogroman', 'giant'],
    };
    
    const sizeMentioned = sizeKeywords[sizeCategory].some(kw => bio.includes(kw));
    if (sizeMentioned) {
      score += 10;
      reasons.push(`Navikao/la na ${sizeCategory === 'small' ? 'male' : sizeCategory === 'medium' ? 'srednje' : 'velike'} ljubimce`);
    }
  }
  
  return Math.min(100, score);
}

// Score rating and reviews (0-100)
function scoreRating(sitter: SitterProfile): number {
  // Base score from rating (0-5 scale -> 0-60 points)
  const ratingScore = (sitter.rating_avg / 5) * 60;
  
  // Bonus for number of reviews (max 40 points at 50+ reviews)
  const reviewBonus = Math.min(40, sitter.review_count * 0.8);
  
  // Superhost bonus
  const superhostBonus = sitter.superhost ? 10 : 0;
  
  return Math.min(100, ratingScore + reviewBonus + superhostBonus);
}

// Score price fit (0-100)
function scorePrice(
  sitter: SitterProfile,
  serviceType: ServiceType,
  budgetMax?: number
): number {
  const price = sitter.prices[serviceType];
  
  if (!price || price <= 0) return 0; // Doesn't offer this service
  
  if (!budgetMax) return 80; // No budget constraint
  
  if (price > budgetMax) return Math.max(0, 100 - ((price - budgetMax) / budgetMax) * 100);
  
  // Within budget - higher score for better value
  const valueRatio = price / budgetMax;
  return Math.round(70 + (1 - valueRatio) * 30);
}

// Score special needs compatibility (0-100)
function scoreSpecialNeeds(
  sitter: SitterProfile,
  pet: Pet
): number {
  if (!pet.special_needs) return 100; // No special needs = full score
  
  let score = 50;
  const bio = sitter.bio?.toLowerCase() || '';
  const specialNeeds = pet.special_needs.toLowerCase();
  
  // Keywords that indicate experience with special needs
  const specialNeedsKeywords = [
    'medicina', 'lijek', 'injekcija', 'dijabetes', 'epilepsija',
    'medicine', 'medication', 'injection', 'diabetes', 'epilepsy',
    'special', 'specijalne', 'potrebe', 'needs', 'skrb', 'care'
  ];
  
  const hasExperience = specialNeedsKeywords.some(kw => 
    bio.includes(kw) || specialNeeds.includes(kw)
  );
  
  if (hasExperience) {
    score += 30;
  }
  
  // Verified sitters get bonus for special needs
  if (sitter.verified) {
    score += 10;
  }
  
  // Superhost bonus
  if (sitter.superhost) {
    score += 10;
  }
  
  return Math.min(100, score);
}

// Main matching function
export function calculateMatchScore(
  sitter: SitterProfile & { user: User },
  pet: Pet,
  criteria: MatchingCriteria,
  ownerLat?: number,
  ownerLng?: number,
  weights: MatchingWeights = DEFAULT_WEIGHTS
): MatchScore {
  const breakdown = {
    locationScore: scoreLocation(sitter, criteria.ownerCity, ownerLat, ownerLng, criteria.maxDistance),
    availabilityScore: scoreAvailability(sitter, criteria.startDate, criteria.endDate),
    experienceScore: scoreExperience(sitter, pet),
    ratingScore: scoreRating(sitter),
    priceScore: scorePrice(sitter, criteria.serviceType, criteria.budgetMax),
    specialNeedsScore: scoreSpecialNeeds(sitter, pet),
  };
  
  // Calculate weighted total
  const totalScore = Math.round(
    breakdown.locationScore * weights.location +
    breakdown.availabilityScore * weights.availability +
    breakdown.experienceScore * weights.experience +
    breakdown.ratingScore * weights.rating +
    breakdown.priceScore * weights.price +
    breakdown.specialNeedsScore * weights.specialNeeds
  );
  
  // Generate human-readable reasons
  const reasons: string[] = [];
  
  if (breakdown.locationScore >= 80) {
    reasons.push('U vašoj blizini');
  }
  if (breakdown.ratingScore >= 80) {
    reasons.push(sitter.superhost ? '⭐ Superhost' : '⭐ Visoko ocjenjen');
  }
  if (breakdown.experienceScore >= 70) {
    reasons.push(`${sitter.experience_years}+ godina iskustva`);
  }
  if (breakdown.priceScore >= 80 && criteria.budgetMax) {
    reasons.push('Odličan omjer cijene i kvalitete');
  }
  if (breakdown.specialNeedsScore >= 70 && pet.special_needs) {
    reasons.push('Iskustvo sa specijalnim potrebama');
  }
  if (sitter.verified) {
    reasons.push('✓ Verificiran profil');
  }
  if (sitter.instant_booking) {
    reasons.push('⚡ Instant booking');
  }
  
  return {
    sitterId: sitter.user_id,
    sitter,
    totalScore,
    breakdown,
    reasons: reasons.slice(0, 4), // Top 4 reasons
  };
}

// Rank and filter sitters
export function rankSitters(
  sitters: (SitterProfile & { user: User })[],
  pet: Pet,
  criteria: MatchingCriteria,
  ownerLat?: number,
  ownerLng?: number,
  limit: number = 10
): MatchScore[] {
  const scored = sitters
    .map(sitter => calculateMatchScore(sitter, pet, criteria, ownerLat, ownerLng))
    .filter(match => match.totalScore > 30) // Filter out poor matches
    .sort((a, b) => b.totalScore - a.totalScore);
  
  return scored.slice(0, limit);
}

// Get personalized recommendation text
export function getRecommendationText(match: MatchScore, isTopMatch: boolean = false): string {
  if (isTopMatch) {
    return `Najbolji izbor za vašeg ljubimca — ${match.reasons.join(', ')}`;
  }
  
  if (match.totalScore >= 85) {
    return `Odličan izbor — ${match.reasons.join(', ')}`;
  } else if (match.totalScore >= 70) {
    return `Dobar izbor — ${match.reasons.join(', ')}`;
  } else {
    return `Alternativa — ${match.reasons.join(', ')}`;
  }
}
