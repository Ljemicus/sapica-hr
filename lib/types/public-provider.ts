// ── Public Provider Profile (sanitized for public pages) ──
// Strips all contact info, internal IDs, and test data.

export type PublicProviderProfile = {
  id: string;
  name: string;
  city: string;
  description: string | null;
  specializations: string[];
  certificates: string[];
  certified: boolean;
  rating: number;
  reviewCount: number;
  priceFrom: number | null;
  services: string[];
  availability: string[]; // ISO date strings
  profileImage: string | null;
  verified: boolean;
  category: 'groomer' | 'trainer' | 'sitter';
};

export type PublicProviderReview = {
  id: string;
  authorName: string;
  authorInitial: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type PublicGroomerProfile = PublicProviderProfile & {
  category: 'groomer';
  specialization: 'psi' | 'macke' | 'oba';
  prices: Record<string, number>;
  workingHours?: Record<string, { start: string; end: string }>;
};

export type PublicTrainerProfile = PublicProviderProfile & {
  category: 'trainer';
  pricePerHour: number;
  programs: PublicTrainingProgram[];
};

export type PublicTrainingProgram = {
  id: string;
  name: string;
  type: string;
  durationWeeks: number;
  sessions: number;
  price: number;
  description: string;
};

export type PublicSitterProfile = PublicProviderProfile & {
  category: 'sitter';
  experienceYears: number;
  superhost: boolean;
  responseTime: string | null;
  photos: string[];
  instantBooking: boolean;
  prices: Record<string, number>;
};
