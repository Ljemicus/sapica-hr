/**
 * Alert dispatcher abstraction for PetPark.
 * Routes alerts to configured channels per the Monitoring & Alerting Spec.
 *
 * MVP: Slack webhook. SMS (Twilio) and email digest are placeholder-ready.
 */

import { appLogger, type Severity } from './logger';

export interface Alert {
  severity: Severity;
  service: string;
  description: string;
  value?: string;
  threshold?: string;
  dashboardUrl?: string;
  runbookUrl?: string;
  owner?: string;
}

type AlertChannel = 'slack-incidents' | 'slack-ops' | 'sms-founder';

// ---------------------------------------------------------------------------
// Dedup / rate-limit — suppress bursty identical alerts within a window.
// Key = severity + service + description.  Window resets after DEDUP_WINDOW_MS.
// P0 alerts are never suppressed.
// ---------------------------------------------------------------------------
const DEDUP_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const dedupMap = new Map<string, { count: number; firstSeen: number }>();
let lastCleanup = Date.now();

function dedupKey(alert: Alert): string {
  return `${alert.severity}:${alert.service}:${alert.description}`;
}

/** Evict stale entries from dedupMap to prevent unbounded memory growth. */
function evictStaleEntries(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  let evicted = 0;
  for (const [key, entry] of dedupMap) {
    if (now - entry.firstSeen > DEDUP_WINDOW_MS) {
      dedupMap.delete(key);
      evicted++;
    }
  }
  if (evicted > 0) {
    appLogger.info('alerting.dedup', `Evicted ${evicted} stale dedup entries`, { remaining: dedupMap.size });
  }
}

/** Returns true if the alert should be dispatched, false if suppressed. */
function shouldDispatch(alert: Alert): boolean {
  // Periodic cleanup before checking
  evictStaleEntries();

  // Never suppress P0
  if (alert.severity === 'P0') return true;

  const key = dedupKey(alert);
  const now = Date.now();
  const existing = dedupMap.get(key);

  if (!existing || now - existing.firstSeen > DEDUP_WINDOW_MS) {
    dedupMap.set(key, { count: 1, firstSeen: now });
    return true;
  }

  existing.count++;
  // Log suppression so we don't lose visibility
  appLogger.info('alerting.dedup', `Suppressed duplicate alert (${existing.count} in window)`, {
    key,
    countInWindow: existing.count,
  });
  return false;
}

function channelsForSeverity(severity: Severity): AlertChannel[] {
  switch (severity) {
    case 'P0':
      return ['slack-incidents', 'sms-founder'];
    case 'P1':
      return ['slack-incidents'];
    case 'P2':
    case 'P3':
    case 'P4':
      return ['slack-ops'];
  }
}

function formatSlackMessage(alert: Alert): string {
  const lines = [
    `[${alert.severity}] ${alert.service} — ${alert.description}`,
    `Triggered: ${new Date().toISOString()}`,
  ];
  if (alert.value) lines.push(`Value: ${alert.value}${alert.threshold ? ` (threshold: ${alert.threshold})` : ''}`);
  if (alert.dashboardUrl) lines.push(`Dashboard: ${alert.dashboardUrl}`);
  if (alert.runbookUrl) lines.push(`Runbook: ${alert.runbookUrl}`);
  if (alert.owner) lines.push(`Owner: ${alert.owner}`);
  return lines.join('\n');
}

async function sendSlack(webhookUrl: string, text: string): Promise<boolean> {
  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    return res.ok;
  } catch (err) {
    appLogger.error('alerting', 'Slack webhook failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

async function dispatchToChannel(channel: AlertChannel, alert: Alert): Promise<boolean> {
  const text = formatSlackMessage(alert);

  switch (channel) {
    case 'slack-incidents': {
      const url = process.env.SLACK_INCIDENTS_WEBHOOK;
      if (!url) {
        appLogger.warn('alerting', 'SLACK_INCIDENTS_WEBHOOK not configured, skipping', { alert: alert.description });
        return false;
      }
      return sendSlack(url, text);
    }
    case 'slack-ops': {
      const url = process.env.SLACK_OPS_WEBHOOK;
      if (!url) {
        appLogger.warn('alerting', 'SLACK_OPS_WEBHOOK not configured, skipping', { alert: alert.description });
        return false;
      }
      return sendSlack(url, text);
    }
    case 'sms-founder': {
      // Placeholder for Twilio SMS integration
      appLogger.warn('alerting', 'SMS alerting not yet implemented', { severity: alert.severity, service: alert.service });
      return false;
    }
  }
}

/**
 * Dispatch an alert to all channels appropriate for its severity.
 * Always logs the alert locally regardless of channel delivery success.
 */
export async function dispatchAlert(alert: Alert): Promise<void> {
  // Always log locally — dedup only gates channel delivery
  appLogger.raw({
    timestamp: new Date().toISOString(),
    level: alert.severity === 'P0' ? 'fatal' : alert.severity === 'P1' ? 'error' : 'warn',
    severity: alert.severity,
    scope: 'alert',
    message: `[${alert.severity}] ${alert.service} — ${alert.description}`,
    context: {
      value: alert.value,
      threshold: alert.threshold,
      owner: alert.owner,
    },
  });

  if (!shouldDispatch(alert)) return;

  const channels = channelsForSeverity(alert.severity);
  await Promise.allSettled(channels.map((ch) => dispatchToChannel(ch, alert)));
}
