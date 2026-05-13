import { describe, expect, it, vi } from 'vitest';
import { moderateServiceListing } from '../admin-moderation';

const listingId = '44444444-4444-4444-8444-444444444444';

describe('admin service listing moderation', () => {
  it('approves by setting listed/approved/listed_at', async () => {
    const updateListing = vi.fn(async (id, patch) => ({ id, slug: 'draft', status: patch.status, moderation_status: patch.moderation_status, listed_at: patch.listed_at }));
    const result = await moderateServiceListing({ id: listingId, action: 'approve' }, { updateListing, now: () => '2026-05-14T00:00:00.000Z' });

    expect(result).toMatchObject({ ok: true, data: { status: 'listed', moderation_status: 'approved', listed_at: '2026-05-14T00:00:00.000Z' } });
    expect(updateListing).toHaveBeenCalledWith(listingId, { status: 'listed', moderation_status: 'approved', listed_at: '2026-05-14T00:00:00.000Z' });
  });

  it('rejects without listing publicly', async () => {
    const updateListing = vi.fn(async (id, patch) => ({ id, slug: 'draft', status: patch.status, moderation_status: patch.moderation_status, listed_at: patch.listed_at }));
    const result = await moderateServiceListing({ id: listingId, action: 'reject' }, { updateListing });

    expect(result).toMatchObject({ ok: true, data: { status: 'draft', moderation_status: 'rejected', listed_at: null } });
  });

  it('pauses and archives without approving', async () => {
    const updateListing = vi.fn(async (id, patch) => ({ id, slug: 'draft', status: patch.status, moderation_status: 'pending', listed_at: patch.listed_at }));

    await expect(moderateServiceListing({ id: listingId, action: 'pause' }, { updateListing })).resolves.toMatchObject({ ok: true, data: { status: 'paused', listed_at: null } });
    await expect(moderateServiceListing({ id: listingId, action: 'archive' }, { updateListing })).resolves.toMatchObject({ ok: true, data: { status: 'archived', listed_at: null } });
  });

  it('rejects invalid input', async () => {
    const updateListing = vi.fn();
    const result = await moderateServiceListing({ id: 'not-a-uuid', action: 'approve' }, { updateListing });

    expect(result).toMatchObject({ ok: false, reason: 'service_listings_validation_failed' });
    expect(updateListing).not.toHaveBeenCalled();
  });
});
