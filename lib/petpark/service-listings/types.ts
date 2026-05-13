export type ServiceListingFeatureFlag = 'reads' | 'writes';

export type ServiceListingGuardReason =
  | 'service_listings_reads_disabled'
  | 'service_listings_writes_disabled'
  | 'service_listings_table_unavailable'
  | 'service_listings_not_implemented';

export type ServiceListingGuardResult =
  | { enabled: true }
  | { enabled: false; reason: ServiceListingGuardReason };

export type ServiceListingMutationResult<T = never> =
  | { ok: true; data: T }
  | { ok: false; reason: ServiceListingGuardReason; message: string };

export type ServiceListingStatus = 'draft' | 'listed' | 'paused' | 'archived';
export type ServiceListingModerationStatus = 'pending' | 'approved' | 'rejected';
export type ServiceListingAvailabilityMode = 'request' | 'calendar' | 'instant';

export type ServiceListingDraftInput = {
  providerId?: string;
  providerServiceId?: string;
  title: string;
  category?: string;
  shortDescription?: string;
  description?: string;
  city?: string;
  district?: string;
  serviceArea?: string;
  availabilityMode?: ServiceListingAvailabilityMode;
  includedFeatures?: string[];
  houseRules?: string[];
  seoTitle?: string;
  seoDescription?: string;
};

export type ServiceListingUpdateInput = Partial<ServiceListingDraftInput> & {
  id: string;
};

export type ServiceListingProviderRow = {
  id: string;
  provider_kind: string | null;
  display_name: string | null;
  bio: string | null;
  city: string | null;
  address: string | null;
  verified_status: string | null;
  public_status: string | null;
  response_time_label: string | null;
  rating_avg: number | null;
  review_count: number | null;
};

export type ServiceListingProviderServiceRow = {
  id: string;
  provider_id: string;
  service_code: string | null;
  base_price: number | null;
  currency: string | null;
  duration_minutes: number | null;
  is_active: boolean | null;
};

export type ServiceListingRow = {
  slug: string;
  title: string | null;
  short_description: string | null;
  description: string | null;
  category: string | null;
  display_category: string | null;
  city: string | null;
  district: string | null;
  service_area: string | null;
  included_features: unknown;
  house_rules: unknown;
  status: ServiceListingStatus | string | null;
  moderation_status: ServiceListingModerationStatus | string | null;
  provider_id: string;
  provider_service_id: string | null;
  provider?: ServiceListingProviderRow | ServiceListingProviderRow[] | null;
  provider_service?: ServiceListingProviderServiceRow | ServiceListingProviderServiceRow[] | null;
};

export type PublicServiceListing = {
  slug: string;
  title: string;
  provider: string;
  location: string;
  rating: number;
  reviews: number;
  description: string;
  price: string;
  badges: string[];
  tone: 'orange' | 'sage' | 'teal' | 'cream';
  category: string;
  providerId: string;
  providerKind: string;
  serviceCode: string;
  detailDescription: string;
  includedFeatures: string[];
  houseRules: string[];
  responseTime: string;
  verified: boolean;
};
