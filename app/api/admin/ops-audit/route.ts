/**
 * GET /api/admin/ops-audit
 *
 * Runs operational health checks and optionally posts findings to Slack.
 * Secured by CRON_SECRET header (for Vercel Cron) or admin session.
 *
 * Query params:
 *   ?slack=true   — also send the report to SLACK_OPS_WEBHOOK
 *   ?alerts=true  — dispatch alerts for critical/warning findings via alerting abstraction
 *
 * Can be wired to Vercel Cron by adding to vercel.json:
 *   { "crons": [{ "path": "/api/admin/ops-audit?slack=true", "schedule": "0 8 * * *" }] }
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getRequestId, createScopedLogger } from '@/lib/request-context';
import { runOpsAudit, formatSlackAudit, sendAuditToSlack, dispatchAuditAlerts } from '@/lib/ops-audit';
import { requireAdminOrCron } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const reqId = getRequestId(request);
  const log = createScopedLogger('admin.ops-audit', reqId);

  // Auth: accept CRON_SECRET header (Vercel Cron) or admin session
  const guard = await requireAdminOrCron(request);
  if (!guard.ok) return guard.response;

  try {
    log.info('Running ops audit');
    const result = await runOpsAudit();
    const report = formatSlackAudit(result);

    let slackSent = false;
    const wantSlack = request.nextUrl.searchParams.get('slack') === 'true';
    if (wantSlack) {
      slackSent = await sendAuditToSlack(report);
      log.info('Slack delivery attempted', { slackSent });
    }

    // Dispatch alerts for critical/warning findings when opted in
    let alertsDispatched = 0;
    const wantAlerts = request.nextUrl.searchParams.get('alerts') === 'true';
    if (wantAlerts) {
      alertsDispatched = await dispatchAuditAlerts(result.findings);
      log.info('Alert dispatch complete', { alertsDispatched });
    }

    log.info('Ops audit complete', {
      findingCount: result.findings.length,
      healthy: result.healthy,
      durationMs: result.durationMs,
      alertsDispatched,
    });

    return NextResponse.json({ result, report, slackSent, alertsDispatched });
  } catch (err) {
    log.error('Ops audit failed', {
      error: err instanceof Error ? err.message : String(err),
    }, 'P2');
    return NextResponse.json(
      { error: 'Failed to run ops audit' },
      { status: 500 },
    );
  }
}
