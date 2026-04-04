/**
 * GET /api/admin/kpi-digest
 *
 * Collects daily KPI metrics and optionally posts them to Slack.
 * Secured by CRON_SECRET header (for Vercel Cron) or admin session.
 *
 * Query params:
 *   ?slack=true  — also send the digest to SLACK_OPS_WEBHOOK
 *
 * Can be wired to Vercel Cron by adding to vercel.json:
 *   { "crons": [{ "path": "/api/admin/kpi-digest?slack=true", "schedule": "0 7 * * *" }] }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { collectKpis, formatSlackDigest, sendDigestToSlack } from '@/lib/kpi-digest';
import { requireAdminOrCron } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('admin.kpi-digest', reqId);

  // Auth: accept CRON_SECRET header (Vercel Cron) or admin session
  const guard = await requireAdminOrCron(request);
  if (!guard.ok) return guard.response;

  try {
    log.info('Collecting KPI snapshot');
    const kpi = await collectKpis();
    const digest = formatSlackDigest(kpi);

    let slackSent = false;
    const wantSlack = request.nextUrl.searchParams.get('slack') === 'true';
    if (wantSlack) {
      slackSent = await sendDigestToSlack(digest);
      log.info('Slack delivery attempted', { slackSent });
    }

    return NextResponse.json({ kpi, digest, slackSent });
  } catch (err) {
    log.error('KPI digest failed', {
      error: err instanceof Error ? err.message : String(err),
    }, 'P2');
    return NextResponse.json(
      { error: 'Failed to generate KPI digest' },
      { status: 500 },
    );
  }
}
