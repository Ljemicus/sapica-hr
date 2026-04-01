import { NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import {
  getPublisherProfile,
  getAdoptionListing,
  updateAdoptionListingStatus,
  canTransition,
} from '@/lib/db';
import { adoptionPublishRules } from '@/lib/validations';
import type { AdoptionListingStatus } from '@/lib/types';

const VALID_STATUSES: AdoptionListingStatus[] = ['draft', 'active', 'paused', 'adopted', 'expired'];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthUser();
  if (!user) return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });

  const profile = await getPublisherProfile(user.id);
  if (!profile) return apiError({ status: 404, code: 'NO_PROFILE', message: 'Publisher profile not found' });

  const { id } = await params;

  let body: { status?: string };
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const newStatus = body.status as AdoptionListingStatus | undefined;
  if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
    return apiError({ status: 400, code: 'INVALID_STATUS', message: 'Invalid status value' });
  }

  // Fetch current listing to validate transition
  const listing = await getAdoptionListing(id);
  if (!listing || listing.publisher_id !== profile.id) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Listing not found' });
  }

  if (!canTransition(listing.status, newStatus)) {
    return apiError({
      status: 400,
      code: 'INVALID_TRANSITION',
      message: `Cannot transition from "${listing.status}" to "${newStatus}"`,
    });
  }

  // If publishing, validate with stricter rules
  if (newStatus === 'active' && listing.status === 'draft') {
    const publishCheck = adoptionPublishRules.safeParse(listing);
    if (!publishCheck.success) {
      return apiError({
        status: 400,
        code: 'PUBLISH_VALIDATION_FAILED',
        message: 'Listing does not meet publish requirements',
        details: publishCheck.error.flatten(),
      });
    }
  }

  const updated = await updateAdoptionListingStatus(id, profile.id, newStatus);
  if (!updated) return apiError({ status: 500, code: 'STATUS_UPDATE_FAILED', message: 'Failed to update status' });

  return NextResponse.json(updated);
}
