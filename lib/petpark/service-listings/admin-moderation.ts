import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import type { ServiceListingMutationResult, ServiceListingModerationStatus, ServiceListingStatus } from './types';

export type ServiceListingAdminAction = 'approve' | 'reject' | 'pause' | 'archive';

type ModerationPatch = {
  status?: ServiceListingStatus;
  moderation_status?: ServiceListingModerationStatus;
  listed_at?: string | null;
};

type ModeratedListingRow = {
  id: string;
  slug: string;
  status: ServiceListingStatus | string | null;
  moderation_status: ServiceListingModerationStatus | string | null;
  listed_at: string | null;
};

type AdminModerationDependencies = {
  updateListing?: (id: string, patch: ModerationPatch) => Promise<ModeratedListingRow>;
  now?: () => string;
};

const moderationSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'pause', 'archive']),
});

function patchForAction(action: ServiceListingAdminAction, now: () => string): ModerationPatch {
  switch (action) {
    case 'approve':
      return { status: 'listed', moderation_status: 'approved', listed_at: now() };
    case 'reject':
      return { status: 'draft', moderation_status: 'rejected', listed_at: null };
    case 'pause':
      return { status: 'paused', listed_at: null };
    case 'archive':
      return { status: 'archived', listed_at: null };
  }
}

async function defaultUpdateListing(id: string, patch: ModerationPatch): Promise<ModeratedListingRow> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('service_listings')
    .update(patch)
    .eq('id', id)
    .select('id, slug, status, moderation_status, listed_at')
    .single();

  if (error) throw error;
  return data as ModeratedListingRow;
}

export async function moderateServiceListing(input: { id: string; action: ServiceListingAdminAction }, dependencies: AdminModerationDependencies = {}): Promise<ServiceListingMutationResult<ModeratedListingRow>> {
  const parsed = moderationSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, reason: 'service_listings_validation_failed', message: 'Neispravna admin moderacijska akcija.' };
  }

  const now = dependencies.now || (() => new Date().toISOString());
  const updateListing = dependencies.updateListing || defaultUpdateListing;
  const patch = patchForAction(parsed.data.action, now);

  try {
    const updated = await updateListing(parsed.data.id, patch);
    return { ok: true, data: updated };
  } catch {
    return { ok: false, reason: 'service_listings_write_failed', message: 'Service listing trenutno nije moguće moderirati.' };
  }
}
