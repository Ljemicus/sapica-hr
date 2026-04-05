import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { apiError } from '@/lib/api-errors';
import { getLostPet, updateLostPetHidden, updateLostPetStatus, deleteLostPet, extendLostPetExpiry } from '@/lib/db';
import { logAdminAction } from '@/lib/db/audit-logs';

type AdminAction = 'hide' | 'unhide' | 'delete' | 'expire' | 'extend';

/**
 * POST /api/admin/lost-pets
 * Admin moderation actions: hide, unhide, delete.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { user } = guard;

  const body = await request.json().catch(() => null);
  const { petId, action, days } = (body || {}) as { petId?: string; action?: AdminAction; days?: number };

  if (!petId || !action || !['hide', 'unhide', 'delete', 'expire', 'extend'].includes(action)) {
    return apiError({ status: 400, code: 'INVALID_REQUEST', message: 'petId and valid action (hide|unhide|delete|expire|extend) required' });
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

  if (action === 'expire') {
    if (pet.status !== 'lost') {
      return apiError({ status: 400, code: 'NOT_LOST', message: 'Only active lost listings can be expired' });
    }
    const updated = await updateLostPetStatus(petId, 'expired');
    if (!updated) {
      return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to expire listing' });
    }
    await logAdminAction({
      actorUserId: user.id,
      targetType: 'lost_pet',
      targetId: petId,
      action: 'lost_pet_expired',
      metadata: { pet_name: pet.name, pet_city: pet.city },
    });
    return NextResponse.json({ pet: updated });
  }

  if (action === 'extend') {
    const extendDays = days && days > 0 && days <= 90 ? days : 30;
    const updated = await extendLostPetExpiry(petId, extendDays);
    if (!updated) {
      return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to extend listing' });
    }
    await logAdminAction({
      actorUserId: user.id,
      targetType: 'lost_pet',
      targetId: petId,
      action: 'lost_pet_extended',
      metadata: { pet_name: pet.name, days: extendDays },
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
