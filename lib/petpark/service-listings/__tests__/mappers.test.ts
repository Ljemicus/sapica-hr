import { describe, expect, it } from 'vitest';
import { mapServiceListingRow } from '../mappers';
import type { ServiceListingRow } from '../types';

const baseRow: ServiceListingRow = {
  slug: 'cuvanje-rijeka',
  title: 'Čuvanje u Rijeci',
  short_description: 'Sigurno čuvanje.',
  description: 'Sigurno čuvanje u domu pružatelja.',
  category: 'boarding',
  display_category: 'Čuvanje',
  city: 'Rijeka',
  district: 'Krnjevo',
  service_area: null,
  included_features: ['Šetnje', 'Foto updatei'],
  house_rules: ['Cijepljenje obavezno'],
  status: 'listed',
  moderation_status: 'approved',
  provider_id: 'provider-1',
  provider_service_id: 'service-1',
  provider: {
    id: 'provider-1',
    provider_kind: 'sitter',
    display_name: 'Lana',
    bio: 'Pouzdana briga.',
    city: 'Rijeka',
    address: null,
    verified_status: 'verified',
    public_status: 'listed',
    response_time_label: 'Odgovara brzo',
    rating_avg: 4.9,
    review_count: 12,
  },
  provider_service: {
    id: 'service-1',
    provider_id: 'provider-1',
    service_code: 'boarding',
    base_price: 24,
    currency: 'EUR',
    duration_minutes: null,
    is_active: true,
  },
};

describe('service listing mappers', () => {
  it('maps approved listed rows into public listings', () => {
    const mapped = mapServiceListingRow(baseRow);
    expect(mapped).toMatchObject({
      slug: 'cuvanje-rijeka',
      title: 'Čuvanje u Rijeci',
      provider: 'Lana',
      location: 'Rijeka, Krnjevo',
      price: '24 € / dan',
      serviceCode: 'boarding',
      verified: true,
    });
  });

  it('filters unapproved rows', () => {
    expect(mapServiceListingRow({ ...baseRow, moderation_status: 'pending' })).toBeNull();
  });

  it('filters unlisted providers', () => {
    expect(mapServiceListingRow({ ...baseRow, provider: { ...(baseRow.provider as NonNullable<ServiceListingRow['provider']>), public_status: 'draft' } })).toBeNull();
  });
});
