import { describe, expect, it } from 'vitest';
import { archiveServiceListing, createDraftServiceListing, pauseServiceListing, publishServiceListing, updateDraftServiceListing } from '../write-disabled';

describe('disabled service listing writes', () => {
  it('returns disabled without attempting persistence for draft creation', async () => {
    const result = await createDraftServiceListing({ title: 'Čuvanje u domu' });
    expect(result).toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
  });

  it('returns disabled for all mutation stubs by default', async () => {
    await expect(updateDraftServiceListing({ id: 'listing-1', title: 'Novi naslov' })).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(publishServiceListing('listing-1')).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(pauseServiceListing('listing-1')).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(archiveServiceListing('listing-1')).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
  });
});
