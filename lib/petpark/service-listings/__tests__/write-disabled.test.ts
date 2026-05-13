import { describe, expect, it, vi } from 'vitest';
import { archiveServiceListing, createDraftServiceListing, pauseServiceListing, publishServiceListing, updateDraftServiceListing } from '../write-disabled';

const writesOn = { PETPARK_ENABLE_SERVICE_LISTINGS_WRITES: 'true' };

function draftDeps(overrides: Partial<Parameters<typeof createDraftServiceListing>[1]> = {}) {
  return {
    env: writesOn,
    getCurrentUserId: vi.fn(async () => 'user-1'),
    findOwnedProvider: vi.fn(async () => ({ id: '30000000-0000-0000-0000-000000000001', city: 'Rijeka' })),
    findOwnedProviderService: vi.fn(async () => ({
      id: '31000000-0000-0000-0000-000000000001',
      provider_id: '30000000-0000-0000-0000-000000000001',
      service_code: 'boarding',
      is_active: true,
    })),
    createUniqueSlug: vi.fn(async () => 'cuvanje-u-domu-rijeka'),
    insertDraft: vi.fn(async (row) => ({
      id: 'listing-1',
      slug: row.slug,
      status: row.status,
      moderation_status: row.moderation_status,
    })),
    ...overrides,
  };
}

describe('guarded service listing writes', () => {
  it('returns disabled without attempting persistence for draft creation', async () => {
    const deps = draftDeps();
    const result = await createDraftServiceListing({ title: 'Čuvanje u domu' }, { ...deps, env: {} });

    expect(result).toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    expect(deps.insertDraft).not.toHaveBeenCalled();
  });

  it('returns disabled for all mutation stubs by default', async () => {
    await expect(updateDraftServiceListing({ id: 'listing-1', title: 'Novi naslov' })).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(publishServiceListing('listing-1')).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(pauseServiceListing('listing-1')).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(archiveServiceListing('listing-1')).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
  });

  it('creates only a draft/pending listing when writes are enabled', async () => {
    const deps = draftDeps();
    const result = await createDraftServiceListing({
      title: 'Čuvanje u domu',
      category: 'cuvanje',
      description: 'Sigurno čuvanje u kućnom okruženju.',
      city: 'Rijeka',
    }, deps);

    expect(result).toMatchObject({
      ok: true,
      data: {
        id: 'listing-1',
        slug: 'cuvanje-u-domu-rijeka',
        status: 'draft',
        moderationStatus: 'pending',
      },
    });
    expect(deps.insertDraft).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Čuvanje u domu',
      category: 'boarding',
      display_category: 'Čuvanje',
      status: 'draft',
      moderation_status: 'pending',
      listed_at: null,
    }));
  });

  it('does not allow client payload to approve or list itself', async () => {
    const deps = draftDeps();
    await createDraftServiceListing({
      title: 'Objavi me odmah',
      category: 'trening',
      moderation_status: 'approved',
      status: 'listed',
    } as never, deps);

    expect(deps.insertDraft).toHaveBeenCalledWith(expect.objectContaining({
      status: 'draft',
      moderation_status: 'pending',
      listed_at: null,
    }));
  });

  it('rejects non-owned provider services', async () => {
    const deps = draftDeps({
      findOwnedProviderService: vi.fn(async () => ({
        id: '31000000-0000-0000-0000-000000000999',
        provider_id: 'different-provider',
        service_code: 'boarding',
        is_active: true,
      })),
    });

    const result = await createDraftServiceListing({ title: 'Tuđa usluga', category: 'cuvanje' }, deps);

    expect(result).toMatchObject({ ok: false, reason: 'service_listings_provider_service_required' });
    expect(deps.insertDraft).not.toHaveBeenCalled();
  });

  it('requires an authenticated user when writes are enabled', async () => {
    const deps = draftDeps({ getCurrentUserId: vi.fn(async () => null) });
    const result = await createDraftServiceListing({ title: 'Čuvanje u domu' }, deps);

    expect(result).toMatchObject({ ok: false, reason: 'service_listings_auth_required' });
    expect(deps.insertDraft).not.toHaveBeenCalled();
  });
});
