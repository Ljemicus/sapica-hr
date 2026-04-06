export type VetReviewStatus = 'active' | 'flagged' | 'removed';
export type VetServiceType = 'hitna_pomoc' | 'cijepljenje' | 'operacija' | 'pregled' | 'ponasanje' | 'ostalo';

export const VET_SERVICE_LABELS: Record<VetServiceType, string> = {
  hitna_pomoc: 'Hitna pomoć',
  cijepljenje: 'Cijepljenje',
  operacija: 'Operacija',
  pregled: 'Pregled',
  ponasanje: 'Ponašanje',
  ostalo: 'Ostalo',
};

export interface VetReview {
  id: string;
  vet_id: string;
  user_id: string;
  booking_id: string | null;
  rating: number;
  comment: string | null;
  service_type: VetServiceType;
  price_paid: number | null;
  visit_date: string | null;
  is_verified: boolean;
  helpful_count: number;
  flag_count: number;
  status: VetReviewStatus;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

export interface VetReviewStats {
  vet_id: string;
  avg_rating: number;
  review_count: number;
  rating_distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface VetWithReviews {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  emergency_mode: string | null;
  emergency_phone: string;
  rating_avg: number;
  review_count: number;
  claimed_by: string | null;
}
