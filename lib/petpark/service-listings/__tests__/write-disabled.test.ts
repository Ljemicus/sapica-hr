import { describe, expect, it, vi } from 'vitest';
import { archiveServiceListing, createDraftServiceListing, pauseServiceListing, publishServiceListing, updateDraftServiceListing } from '../write-disabled';

const writesOn = { PETPARK_ENABLE_SERVICE_LISTINGS_WRITES: 'true' };
const listingId = '33333333-3333-4333-8333-333333333333';

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

function ownerDeps(overrides: Partial<Parameters<typeof updateDraftServiceListing>[1]> = {}) {
  return {
    env: writesOn,
    getCurrentUserId: vi.fn(async () => 'user-1'),
    findOwnedListing: vi.fn(async () => ({
      id: listingId,
      slug: 'owned-draft',
      provider_id: '30000000-0000-0000-0000-000000000001',
      status: 'draft',
      moderation_status: 'pending',
    })),
    updateListing: vi.fn(async (id, patch) => ({
      id,
      slug: 'owned-draft',
      provider_id: '30000000-0000-0000-0000-000000000001',
      status: String(patch.status || 'draft'),
      moderation_status: String(patch.moderation_status || 'pending'),
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

  it('returns disabled for all mutations by default', async () => {
    await expect(updateDraftServiceListing({ id: listingId, title: 'Novi naslov' })).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(publishServiceListing(listingId)).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(pauseServiceListing(listingId)).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
    await expect(archiveServiceListing(listingId)).resolves.toMatchObject({ ok: false, reason: 'service_listings_writes_disabled' });
  });

  it('creates only a draft/pending listing when writes are enabled', async () => {
    const deps = draftDeps();
    const result = await createDraftServiceListing({ title: 'Čuvanje u domu', category: 'cuvanje', description: 'Sigurno čuvanje u kućnom okruženju.', city: 'Rijeka' }, deps);

    expect(result).toMatchObject({ ok: true, data: { id: 'listing-1', slug: 'cuvanje-u-domu-rijeka', status: 'draft', moderationStatus: 'pending' } });
    expect(deps.insertDraft).toHaveBeenCalledWith(expect.objectContaining({ title: 'Čuvanje u domu', category: 'boarding', display_category: 'Čuvanje', status: 'draft', moderation_status: 'pending', listed_at: null }));
  });

  it('does not allow client payload to approve or list itself', async () => {
    const deps = draftDeps();
    await createDraftServiceListing({ title: 'Objavi me odmah', category: 'trening', moderation_status: 'approved', status: 'listed' } as never, deps);

    expect(deps.insertDraft).toHaveBeenCalledWith(expect.objectContaining({ status: 'draft', moderation_status: 'pending', listed_at: null }));
  });

  it('rejects non-owned provider services', async () => {
    const deps = draftDeps({ findOwnedProviderService: vi.fn(async () => ({ id: '31000000-0000-0000-0000-000000000999', provider_id: 'different-provider', service_code: 'boarding', is_active: true })) });
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

  it('updates only safe owner draft fields and resets moderation to pending', async () => {
    const deps = ownerDeps();
    const result = await updateDraftServiceListing({ id: listingId, title: 'Ažurirani nacrt', category: 'grooming', status: 'listed', moderation_status: 'approved' } as never, deps);

    expect(result).toMatchObject({ ok: true, data: { status: 'draft', moderationStatus: 'pending' } });
    expect(deps.updateListing).toHaveBeenCalledWith(listingId, expect.objectContaining({ title: 'Ažurirani nacrt', category: 'grooming', display_category: 'Grooming', moderation_status: 'pending', listed_at: null }));
    expect(deps.updateListing).not.toHaveBeenCalledWith(listingId, expect.objectContaining({ status: 'listed' }));
    expect(deps.updateListing).not.toHaveBeenCalledWith(listingId, expect.objectContaining({ moderation_status: 'approved' }));
  });

  it('blocks non-owner draft update', async () => {
    const deps = ownerDeps({ findOwnedListing: vi.fn(async () => null) });
    const result = await updateDraftServiceListing({ id: listingId, title: 'Tuđi nacrt' }, deps);

    expect(result).toMatchObject({ ok: false, reason: 'service_listings_provider_required' });
    expect(deps.updateListing).not.toHaveBeenCalled();
  });

  it('archives own draft without approving or listing it', async () => {
    const deps = ownerDeps();
    const result = await archiveServiceListing(listingId, deps);

    expect(result).toMatchObject({ ok: true, data: { status: 'archived', moderationStatus: 'pending' } });
    expect(deps.updateListing).toHaveBeenCalledWith(listingId, { status: 'archived', listed_at: null });
  });

  it('pauses own draft without approving or listing it', async () => {
    const deps = ownerDeps();
    const result = await pauseServiceListing(listingId, deps);

    expect(result).toMatchObject({ ok: true, data: { status: 'paused', moderationStatus: 'pending' } });
    expect(deps.updateListing).toHaveBeenCalledWith(listingId, { status: 'paused', listed_at: null });
  });
});
