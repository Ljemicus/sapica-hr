/**
 * Operational audit / health scan for PetPark.
 *
 * Checks high-value operational conditions and returns structured findings.
 * Designed to complement the KPI digest — called from an admin API route
 * triggered by Vercel Cron or manually.
 */

import { createClient } from '@supabase/supabase-js';
import { appLogger } from './logger';
import { dispatchAlert, type Alert } from './alerting';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FindingSeverity = 'critical' | 'warning' | 'info';

export interface AuditFinding {
  check: string;
  severity: FindingSeverity;
  message: string;
  count: number;
  /** Oldest item age in hours (where applicable). */
  oldestHours?: number;
  /** Sample IDs for investigation (max 5). */
  sampleIds?: string[];
}

export interface AuditResult {
  runAt: string;
  durationMs: number;
  findings: AuditFinding[];
  healthy: boolean;
}

// ---------------------------------------------------------------------------
// Thresholds (hours)
// ---------------------------------------------------------------------------

const PENDING_APP_STALE_HOURS = 48;
const DRAFT_APP_STALE_HOURS = 168; // 7 days
const VERIFICATION_STUCK_HOURS = 48;
const BOOKING_PENDING_STALE_HOURS = 72;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Missing Supabase env vars for ops audit');
  return createClient(url, key);
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function ageInHours(isoDate: string): number {
  return Math.round((Date.now() - new Date(isoDate).getTime()) / (1000 * 60 * 60));
}

function sampleIds(rows: { id: string }[] | null, max = 5): string[] {
  return (rows ?? []).slice(0, max).map((r) => r.id);
}

// ---------------------------------------------------------------------------
// Individual checks
// ---------------------------------------------------------------------------

type CheckFn = (db: ReturnType<typeof createServiceClient>) => Promise<AuditFinding | null>;

/** Provider applications stuck in pending_verification too long. */
const checkStalePendingApplications: CheckFn = async (db) => {
  const cutoff = hoursAgo(PENDING_APP_STALE_HOURS);
  const { data, count } = await db
    .from('provider_applications')
    .select('id, created_at', { count: 'exact' })
    .eq('status', 'pending_verification')
    .lt('updated_at', cutoff)
    .order('updated_at', { ascending: true })
    .limit(5);

  if (!count) return null;

  const oldest = data?.[0]?.created_at;
  return {
    check: 'stale_pending_applications',
    severity: count >= 5 ? 'critical' : 'warning',
    message: `${count} provider application(s) pending verification for over ${PENDING_APP_STALE_HOURS}h`,
    count,
    oldestHours: oldest ? ageInHours(oldest) : undefined,
    sampleIds: sampleIds(data),
  };
};

/** Draft applications abandoned for over 7 days. */
const checkStaleDraftApplications: CheckFn = async (db) => {
  const cutoff = hoursAgo(DRAFT_APP_STALE_HOURS);
  const { data, count } = await db
    .from('provider_applications')
    .select('id, created_at', { count: 'exact' })
    .eq('status', 'draft')
    .lt('updated_at', cutoff)
    .order('updated_at', { ascending: true })
    .limit(5);

  if (!count) return null;

  return {
    check: 'stale_draft_applications',
    severity: 'info',
    message: `${count} draft application(s) inactive for over ${DRAFT_APP_STALE_HOURS / 24} days`,
    count,
    oldestHours: data?.[0]?.created_at ? ageInHours(data[0].created_at) : undefined,
    sampleIds: sampleIds(data),
  };
};

/** Verification records stuck in pending status. */
const checkStuckVerifications: CheckFn = async (db) => {
  const cutoff = hoursAgo(VERIFICATION_STUCK_HOURS);
  const { data, count } = await db
    .from('provider_verifications')
    .select('id, submitted_at', { count: 'exact' })
    .eq('status', 'pending')
    .lt('submitted_at', cutoff)
    .order('submitted_at', { ascending: true })
    .limit(5);

  if (!count) return null;

  return {
    check: 'stuck_verifications',
    severity: count >= 3 ? 'critical' : 'warning',
    message: `${count} verification(s) pending review for over ${VERIFICATION_STUCK_HOURS}h`,
    count,
    oldestHours: data?.[0]?.submitted_at ? ageInHours(data[0].submitted_at) : undefined,
    sampleIds: sampleIds(data),
  };
};

/** Bookings stuck in pending status too long (no sitter response). */
const checkStaleBookings: CheckFn = async (db) => {
  const cutoff = hoursAgo(BOOKING_PENDING_STALE_HOURS);
  const { data, count } = await db
    .from('bookings')
    .select('id, created_at', { count: 'exact' })
    .eq('status', 'pending')
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(5);

  if (!count) return null;

  return {
    check: 'stale_pending_bookings',
    severity: count >= 10 ? 'critical' : 'warning',
    message: `${count} booking(s) pending sitter response for over ${BOOKING_PENDING_STALE_HOURS}h`,
    count,
    oldestHours: data?.[0]?.created_at ? ageInHours(data[0].created_at) : undefined,
    sampleIds: sampleIds(data),
  };
};

/** Unresolved provider suspensions. */
const checkUnresolvedSuspensions: CheckFn = async (db) => {
  const { data, count } = await db
    .from('provider_suspensions')
    .select('id, created_at', { count: 'exact' })
    .is('resolved_at', null)
    .order('created_at', { ascending: true })
    .limit(5);

  if (!count) return null;

  return {
    check: 'unresolved_suspensions',
    severity: 'warning',
    message: `${count} active provider suspension(s) without resolution`,
    count,
    oldestHours: data?.[0]?.created_at ? ageInHours(data[0].created_at) : undefined,
    sampleIds: sampleIds(data),
  };
};

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

const ALL_CHECKS: CheckFn[] = [
  checkStalePendingApplications,
  checkStaleDraftApplications,
  checkStuckVerifications,
  checkStaleBookings,
  checkUnresolvedSuspensions,
];

export async function runOpsAudit(): Promise<AuditResult> {
  const start = Date.now();
  const db = createServiceClient();

  const results = await Promise.allSettled(ALL_CHECKS.map((fn) => fn(db)));

  const findings: AuditFinding[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      findings.push(result.value);
    } else if (result.status === 'rejected') {
      appLogger.error('ops-audit', 'Check failed', {
        error: result.reason instanceof Error ? result.reason.message : String(result.reason),
      });
    }
  }

  // Sort: critical → warning → info
  const severityOrder: Record<FindingSeverity, number> = { critical: 0, warning: 1, info: 2 };
  findings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    runAt: new Date().toISOString(),
    durationMs: Date.now() - start,
    findings,
    healthy: !findings.some((f) => f.severity === 'critical'),
  };
}

// ---------------------------------------------------------------------------
// Slack formatting
// ---------------------------------------------------------------------------

const SEVERITY_ICON: Record<FindingSeverity, string> = {
  critical: ':red_circle:',
  warning: ':large_yellow_circle:',
  info: ':white_circle:',
};

export function formatSlackAudit(result: AuditResult): string {
  const header = result.healthy
    ? '*PetPark Ops Audit — All Clear*'
    : '*PetPark Ops Audit — Issues Found*';

  const lines = [header, `_${result.runAt.slice(0, 16)} · ${result.durationMs}ms_`, ''];

  if (result.findings.length === 0) {
    lines.push('No issues detected.');
  } else {
    for (const f of result.findings) {
      lines.push(
        `${SEVERITY_ICON[f.severity]} *${f.check}*: ${f.message}` +
          (f.oldestHours ? ` (oldest: ${f.oldestHours}h)` : ''),
      );
    }
  }

  return lines.join('\n');
}

export async function sendAuditToSlack(text: string): Promise<boolean> {
  const webhookUrl = process.env.SLACK_OPS_WEBHOOK;
  if (!webhookUrl) {
    appLogger.warn('ops-audit', 'SLACK_OPS_WEBHOOK not configured, skipping Slack delivery');
    return false;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch (err) {
    appLogger.error('ops-audit', 'Slack delivery failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

// ---------------------------------------------------------------------------
// Alert dispatch for critical/warning findings
// ---------------------------------------------------------------------------

const FINDING_SEVERITY_TO_ALERT: Record<FindingSeverity, Alert['severity'] | null> = {
  critical: 'P1',
  warning: 'P2',
  info: null, // info findings don't trigger alerts
};

/**
 * Dispatch alerts for critical and warning findings via the alerting
 * abstraction. Info-level findings are skipped. Returns the number of
 * alerts dispatched.
 */
export async function dispatchAuditAlerts(findings: AuditFinding[]): Promise<number> {
  const alertable = findings.filter((f) => FINDING_SEVERITY_TO_ALERT[f.severity] !== null);
  if (alertable.length === 0) return 0;

  let dispatched = 0;
  for (const finding of alertable) {
    const severity = FINDING_SEVERITY_TO_ALERT[finding.severity]!;
    const alert: Alert = {
      severity,
      service: 'ops-audit',
      description: `[${finding.check}] ${finding.message}`,
      value: `count=${finding.count}${finding.oldestHours ? `, oldest=${finding.oldestHours}h` : ''}`,
    };

    await dispatchAlert(alert);
    dispatched++;
  }

  appLogger.info('ops-audit', `Dispatched ${dispatched} alert(s) from audit findings`);
  return dispatched;
}
