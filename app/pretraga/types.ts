export type ProviderCategory = 'sitter' | 'grooming' | 'dresura';

export interface UnifiedProvider {
  id: string;
  name: string;
  avatarUrl: string | null;
  city: string | null;
  bio: string | null;
  rating: number;
  reviews: number;
  verified: boolean;
  superhost: boolean;
  category: ProviderCategory;
  services: string[];
  lowestPrice?: number;
  responseTime: string | null;
  profileUrl: string;
  locationLat?: number | null;
  locationLng?: number | null;
  certified?: boolean;
  certificates?: string[];
}

export const CATEGORY_LABELS: Record<ProviderCategory, string> = {
  sitter: 'Sitteri',
  grooming: 'Grooming',
  dresura: 'Školovanje pasa',
};

export const CATEGORY_EMOJI: Record<ProviderCategory, string> = {
  sitter: '🐾',
  grooming: '✂️',
  dresura: '🎓',
};

export const CATEGORY_BADGE_STYLES: Record<ProviderCategory, string> = {
  sitter: 'bg-orange-100 text-orange-700 border-orange-200',
  grooming: 'bg-pink-100 text-pink-700 border-pink-200',
  dresura: 'bg-indigo-100 text-indigo-700 border-indigo-200',
};
