import { disabledServiceListingMessage, serviceListingWritesGuard } from './guards';
import type { ServiceListingDraftInput, ServiceListingMutationResult, ServiceListingUpdateInput } from './types';

function disabledResult(): ServiceListingMutationResult {
  return {
    ok: false,
    reason: 'service_listings_writes_disabled',
    message: disabledServiceListingMessage('service_listings_writes_disabled'),
  };
}

function notImplementedResult(): ServiceListingMutationResult {
  return {
    ok: false,
    reason: 'service_listings_not_implemented',
    message: 'Service Listings spremanje čeka odobrenu migraciju i dodatnu produkcijsku provjeru.',
  };
}

export async function createDraftServiceListing(_input: ServiceListingDraftInput): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return notImplementedResult();
}

export async function updateDraftServiceListing(_input: ServiceListingUpdateInput): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return notImplementedResult();
}

export async function publishServiceListing(_id: string): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return notImplementedResult();
}

export async function pauseServiceListing(_id: string): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return notImplementedResult();
}

export async function archiveServiceListing(_id: string): Promise<ServiceListingMutationResult> {
  const guard = serviceListingWritesGuard();
  if (!guard.enabled) return disabledResult();
  return notImplementedResult();
}
