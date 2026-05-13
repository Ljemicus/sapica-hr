import { describe, expect, it } from 'vitest';
import { isServiceListingsUnavailableError, serviceListingReadsGuard, serviceListingWritesGuard } from '../guards';

describe('service listing guards', () => {
  it('keeps reads disabled by default', () => {
    expect(serviceListingReadsGuard({}).enabled).toBe(false);
    expect(serviceListingReadsGuard({}).reason).toBe('service_listings_reads_disabled');
  });

  it('keeps writes disabled by default', () => {
    expect(serviceListingWritesGuard({}).enabled).toBe(false);
    expect(serviceListingWritesGuard({}).reason).toBe('service_listings_writes_disabled');
  });

  it('enables flags only for explicit truthy values', () => {
    expect(serviceListingReadsGuard({ PETPARK_ENABLE_SERVICE_LISTINGS_READS: 'true' }).enabled).toBe(true);
    expect(serviceListingWritesGuard({ PETPARK_ENABLE_SERVICE_LISTINGS_WRITES: '1' }).enabled).toBe(true);
    expect(serviceListingWritesGuard({ PETPARK_ENABLE_SERVICE_LISTINGS_WRITES: 'false' }).enabled).toBe(false);
  });

  it('detects missing service_listings table errors', () => {
    expect(isServiceListingsUnavailableError({ code: '42P01', message: 'relation does not exist' })).toBe(true);
    expect(isServiceListingsUnavailableError({ code: 'PGRST205', message: 'Could not find service_listings in schema cache' })).toBe(true);
    expect(isServiceListingsUnavailableError({ code: '23505', message: 'duplicate key' })).toBe(false);
  });
});
