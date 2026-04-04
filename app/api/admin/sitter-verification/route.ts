import { NextResponse } from 'next/server';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { requireAdmin } from '@/lib/admin-guard';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { logAdminAction } from '@/lib/db/audit-logs';

export async function POST(request: Request) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('admin.sitter-verification', reqId);
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { user } = guard;

  const body = await request.json().catch(() => null);
  const { userId, verified } = (body || {}) as { userId?: string; verified?: boolean };
  if (!userId || typeof verified !== 'boolean') {
    return apiError({ status: 400, code: 'INVALID_REQUEST', message: 'userId and verified (boolean) are required' });
  }

  const supabase = await createClient();

  // Fetch current state for audit metadata
  const { data: existing } = await supabase
    .from('sitter_profiles')
    .select('verified')
    .eq('user_id', userId)
    .single();

  const { error } = await supabase.from('sitter_profiles').update({ verified }).eq('user_id', userId);
  if (error) {
    log.error('Sitter verification update failed', { userId, verified, adminId: user.id });
    return apiError({ status: 500, code: 'UPDATE_FAILED', message: 'Failed to update verification' });
  }

  log.info('Sitter verification updated', {
    userId,
    previousVerified: existing?.verified ?? null,
    newVerified: verified,
    adminId: user.id,
  });

  await logAdminAction({
    actorUserId: user.id,
    targetType: 'sitter_profile',
    targetId: userId,
    action: 'sitter_verification_updated',
    metadata: {
      previous_verified: existing?.verified ?? null,
      new_verified: verified,
    },
  });

  return NextResponse.json({ success: true });
}
