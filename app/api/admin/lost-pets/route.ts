import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { apiError } from '@/lib/api-errors';
import { getLostPet, updateLostPetHidden, deleteLostPet } from '@/lib/db';
import { logAdminAction } from '@/lib/db/audit-logs';

type AdminAction = 'hide' | 'unhide' | 'delete';

/**
 * POST /api/admin/lost-pets
 * Admin moderation actions: hide, unhide, delete.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { user } = guard;

  const body = await request.json().catch(() => null);
  const { petId, action } = (body || {}) as { petId?: string; action?: AdminAction };

  if (!petId || !action || !['hide', 'unhide', 'delete'].includes(action)) {
    return apiError({ status: 400, code: 'INVALID_REQUEST', message: 'petId and valid action (hide|unhide|delete) required' });
  }

  const pet = await getLostPet(petId);
  if (!pet) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Listing not found' });
  }

  if (action === 'hide') {
    if (pet.hidden) {
      return apiError({ status: 400, code: 'ALREADY_HIDDEN', message: 'Listing is already hidden' });
    }
    const updated = await updateLostPetHidden(petId, true);
    if (!updated) {
      return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to hide listing' });
    }
    await logAdminAction({
      actorUserId: user.id,
      targetType: 'lost_pet',
      targetId: petId,
      action: 'lost_pet_hidden',
    });
    return NextResponse.json({ pet: updated });
  }

  if (action === 'unhide') {
    if (!pet.hidden) {
      return apiError({ status: 400, code: 'NOT_HIDDEN', message: 'Listing is not hidden' });
    }
    const updated = await updateLostPetHidden(petId, false);
    if (!updated) {
      return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to unhide listing' });
    }
    await logAdminAction({
      actorUserId: user.id,
      targetType: 'lost_pet',
      targetId: petId,
      action: 'lost_pet_unhidden',
    });
    return NextResponse.json({ pet: updated });
  }

  // action === 'delete'
  const deleted = await deleteLostPet(petId);
  if (!deleted) {
    return apiError({ status: 500, code: 'DELETE_FAILED', message: 'Failed to delete listing' });
  }
  await logAdminAction({
    actorUserId: user.id,
    targetType: 'lost_pet',
    targetId: petId,
    action: 'lost_pet_deleted',
    metadata: { pet_name: pet.name, pet_city: pet.city },
  });
  return NextResponse.json({ deleted: true });
}
