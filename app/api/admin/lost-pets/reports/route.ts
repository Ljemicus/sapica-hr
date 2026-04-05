import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-guard';
import { apiError } from '@/lib/api-errors';
import { getOpenReports, resolveReport } from '@/lib/db/lost-pet-reports';
import { logAdminAction } from '@/lib/db/audit-logs';
import { z } from 'zod';

/**
 * GET /api/admin/lost-pets/reports
 * List open reports for admin review queue.
 */
export async function GET() {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;

  const reports = await getOpenReports();
  return NextResponse.json({ reports });
}

const resolveSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(['reviewed', 'dismissed']),
});

/**
 * PATCH /api/admin/lost-pets/reports
 * Resolve a report (reviewed or dismissed).
 */
export async function PATCH(request: Request) {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.response;
  const { user } = guard;

  const body = await request.json().catch(() => null);
  const parsed = resolveSchema.safeParse(body);

  if (!parsed.success) {
    return apiError({ status: 400, code: 'VALIDATION_ERROR', message: 'reportId (uuid) and status (reviewed|dismissed) required' });
  }

  const resolved = await resolveReport(parsed.data.reportId, user.id, parsed.data.status);
  if (!resolved) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Report not found or already resolved' });
  }

  await logAdminAction({
    actorUserId: user.id,
    targetType: 'lost_pet_report',
    targetId: parsed.data.reportId,
    action: 'lost_pet_report_resolved',
    metadata: { resolution: parsed.data.status },
  });

  return NextResponse.json({ report: resolved });
}
