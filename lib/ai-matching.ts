import type { SitterProfile, Pet, ServiceType } from '@/lib/types';
import { appLogger } from '@/lib/logger';

export interface MatchingCriteria {
  pet: Pet;
  serviceType: ServiceType;
  city: string;
  startDate: string;
  endDate: string;
  specialRequirements?: string[];
}

export interface SitterMatch {
  sitter: SitterProfile;
  score: number;
  reasons: string[];
  matchFactors: {
    location: number;
    service: number;
    experience: number;
    rating: number;
    responseTime: number;
    specialNeeds: number;
  };
}

interface MatchWeights {
  location: number;
  service: number;
  experience: number;
  rating: number;
  responseTime: number;
  specialNeeds: number;
}

const DEFAULT_WEIGHTS: MatchWeights = {
  location: 25,      // Same city is crucial
  service: 20,       // Offers requested service
  experience: 15,    // Years of experience
  rating: 20,        // Average rating + review count
  responseTime: 10,  // Quick response preferred
  specialNeeds: 10,  // Experience with special needs pets
};

/**
 * Calculate distance score (0-1) based on location
 * 1.0 = same city, 0.5 = nearby (would need geocoding), 0.0 = far
 */
function calculateLocationScore(sitter: SitterProfile, criteria: MatchingCriteria): number {
  if (!sitter.city) return 0.3; // Unknown location = lower score
  
  const sitterCity = sitter.city.toLowerCase().trim();
  const criteriaCity = criteria.city.toLowerCase().trim();
  
  if (sitterCity === criteriaCity) return 1.0;
  
  // Common city aliases/regions in Croatia
  const regionMap: Record<string, string[]> = {
    'zagreb': ['zagreb', 'novi zagreb', 'samobor', 'velika gorica', 'zaprešić'],
    'split': ['split', 'kaštela', 'trogir', 'solin'],
    'rijeka': ['rijeka', 'kastav', 'čavle', 'viškovo'],
    'osijek': ['osijek', 'višnjevac'],
    'zadar': ['zadar', 'bibinje', 'nin'],
    'dubrovnik': ['dubrovnik', 'župa dubrovačka'],
  };
  
  for (const [region, cities] of Object.entries(regionMap)) {
    if (cities.includes(sitterCity) && cities.includes(criteriaCity)) {
      return 0.7; // Same region
    }
  }
  
  return 0.2; // Different cities
}

/**
 * Calculate service match score
 */
function calculateServiceScore(sitter: SitterProfile, criteria: MatchingCriteria): number {
  if (!sitter.services?.length) return 0;
  
  // Exact service match
  if (sitter.services.includes(criteria.serviceType)) {
    // Bonus if they offer multiple services (more flexible)
    return sitter.services.length >= 3 ? 1.0 : 0.9;
  }
  
  // Partial match for related services
  const relatedServices: Record<ServiceType, ServiceType[]> = {
    'boarding': ['house-sitting', 'daycare'],
    'walking': ['drop-in', 'daycare'],
    'house-sitting': ['boarding', 'drop-in'],
    'drop-in': ['walking', 'house-sitting'],
    'daycare': ['boarding', 'walking'],
  };
  
  const alternatives = relatedServices[criteria.serviceType] || [];
  if (alternatives.some(s => sitter.services.includes(s))) {
    return 0.5; // Offers alternative service
  }
  
  return 0;
}

/**
 * Calculate experience score based on years
 */
function calculateExperienceScore(sitter: SitterProfile): number {
  const years = sitter.experience_years || 0;
  
  if (years >= 5) return 1.0;
  if (years >= 3) return 0.85;
  if (years >= 1) return 0.7;
  if (years > 0) return 0.5;
  return 0.3; // New sitter
}

/**
 * Calculate rating score combining avg rating and review count
 */
function calculateRatingScore(sitter: SitterProfile): number {
  const rating = sitter.rating_avg || 0;
  const reviews = sitter.review_count || 0;
  
  // Rating component (0-5 stars mapped to 0-0.7)
  const ratingComponent = (rating / 5) * 0.7;
  
  // Review count component (more reviews = more reliable)
  let reviewComponent = 0;
  if (reviews >= 20) reviewComponent = 0.3;
  else if (reviews >= 10) reviewComponent = 0.25;
  else if (reviews >= 5) reviewComponent = 0.2;
  else if (reviews > 0) reviewComponent = 0.1;
  
  return Math.min(1, ratingComponent + reviewComponent);
}

/**
 * Calculate response time score
 */
function calculateResponseTimeScore(sitter: SitterProfile): number {
  if (!sitter.response_time) return 0.5; // Unknown = average
  
  const responseHours = parseInt(sitter.response_time);
  if (isNaN(responseHours)) return 0.5;
  
  if (responseHours <= 1) return 1.0;
  if (responseHours <= 3) return 0.85;
  if (responseHours <= 6) return 0.7;
  if (responseHours <= 12) return 0.55;
  if (responseHours <= 24) return 0.4;
  return 0.25;
}

/**
 * Calculate special needs match score
 */
function calculateSpecialNeedsScore(sitter: SitterProfile, criteria: MatchingCriteria): number {
  if (!criteria.specialRequirements?.length) return 0.5; // No special needs = neutral
  
  // Check sitter bio for special needs keywords
  const bio = (sitter.bio || '').toLowerCase();
  const specialNeedsKeywords = [
    'specijalne potrebe', 'special needs', 'lijekovi', 'medicine',
    'stariji', 'senior', 'štenci', 'puppy', 'mačići', 'kitten',
    'injekcije', 'injektiranje', 'dijabetes', 'epilepsija',
    'nježan', 'gentle', 'strpljiv', 'patient', 'iskusan', 'experienced'
  ];
  
  const matches = specialNeedsKeywords.filter(kw => bio.includes(kw));
  const matchRatio = matches.length / specialNeedsKeywords.length;
  
  // Superhost bonus for special needs
  const superhostBonus = sitter.superhost ? 0.2 : 0;
  
  return Math.min(1, 0.3 + matchRatio * 0.7 + superhostBonus);
}

/**
 * Generate human-readable reasons for the match
 */
function generateMatchReasons(sitter: SitterProfile, factors: SitterMatch['matchFactors']): string[] {
  const reasons: string[] = [];
  
  if (factors.location >= 0.9) {
    reasons.push('📍 U vašem gradu');
  } else if (factors.location >= 0.6) {
    reasons.push('📍 U blizini');
  }
  
  if (factors.service >= 0.9) {
    reasons.push('✅ Nudi traženu uslugu');
  } else if (factors.service >= 0.4) {
    reasons.push('✅ Nudi sličnu uslugu');
  }
  
  if (factors.experience >= 0.85) {
    reasons.push(`⭐ ${sitter.experience_years}+ godina iskustva`);
  } else if (factors.experience >= 0.6) {
    reasons.push(`⭐ ${sitter.experience_years} godina iskustva`);
  }
  
  if (factors.rating >= 0.8 && sitter.review_count >= 5) {
    reasons.push(`❤️ ${sitter.rating_avg.toFixed(1)}/5 (${sitter.review_count} recenzija)`);
  } else if (sitter.superhost) {
    reasons.push('🏆 Superhost');
  }
  
  if (factors.responseTime >= 0.85) {
    reasons.push('⚡ Brzo odgovara');
  }
  
  if (factors.specialNeeds >= 0.7) {
    reasons.push('🩺 Iskustvo sa specijalnim potrebama');
  }
  
  return reasons.slice(0, 4); // Max 4 reasons
}

/**
 * Calculate overall match score for a sitter
 */
function calculateSitterMatch(
  sitter: SitterProfile,
  criteria: MatchingCriteria,
  weights: MatchWeights = DEFAULT_WEIGHTS
): SitterMatch | null {
  try {
    // Must offer the service or alternative
    const serviceScore = calculateServiceScore(sitter, criteria);
    if (serviceScore === 0) return null;
    
    const factors = {
      location: calculateLocationScore(sitter, criteria),
      service: serviceScore,
      experience: calculateExperienceScore(sitter),
      rating: calculateRatingScore(sitter),
      responseTime: calculateResponseTimeScore(sitter),
      specialNeeds: calculateSpecialNeedsScore(sitter, criteria),
    };
    
    // Calculate weighted score
    const score = (
      factors.location * weights.location +
      factors.service * weights.service +
      factors.experience * weights.experience +
      factors.rating * weights.rating +
      factors.responseTime * weights.responseTime +
      factors.specialNeeds * weights.specialNeeds
    ) / 100;
    
    return {
      sitter,
      score: Math.round(score * 100) / 100,
      reasons: generateMatchReasons(sitter, factors),
      matchFactors: factors,
    };
  } catch (error) {
    appLogger.error('ai-matching', 'Error calculating match', { error: String(error) });
    return null;
  }
}

/**
 * Find best matching sitters for given criteria
 */
export async function findBestMatches(
  sitters: SitterProfile[],
  criteria: MatchingCriteria,
  options: {
    limit?: number;
    minScore?: number;
    weights?: Partial<MatchWeights>;
  } = {}
): Promise<SitterMatch[]> {
  const { limit = 5, minScore = 0.4, weights = {} } = options;
  
  const mergedWeights = { ...DEFAULT_WEIGHTS, ...weights };
  
  const matches = sitters
    .map(sitter => calculateSitterMatch(sitter, criteria, mergedWeights))
    .filter((match): match is SitterMatch => 
      match !== null && match.score >= minScore
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  appLogger.info('ai-matching', 'Found matches', { 
    criteria: criteria.city,
    service: criteria.serviceType,
    candidates: sitters.length,
    matches: matches.length,
    topScore: matches[0]?.score
  });
  
  return matches;
}

/**
 * Get match explanation for a specific sitter
 */
export function getMatchExplanation(
  sitter: SitterProfile,
  criteria: MatchingCriteria
): { score: number; reasons: string[]; isGoodMatch: boolean } {
  const match = calculateSitterMatch(sitter, criteria);
  
  if (!match) {
    return { score: 0, reasons: ['Ne nudi traženu uslugu'], isGoodMatch: false };
  }
  
  return {
    score: match.score,
    reasons: match.reasons,
    isGoodMatch: match.score >= 0.6,
  };
}

/**
 * Quick match check — useful for badges/highlights
 */
export function isTopMatch(sitter: SitterProfile, criteria: MatchingCriteria): boolean {
  const match = calculateSitterMatch(sitter, criteria);
  return match ? match.score >= 0.75 : false;
}
