'use server';

import { revalidatePath } from 'next/cache';
import { collectKpis, formatSlackDigest, sendDigestToSlack } from '@/lib/kpi-digest';
import { runOpsAudit, formatSlackAudit, sendAuditToSlack, dispatchAuditAlerts } from '@/lib/ops-audit';

export async function refreshFounderDashboard() {
  revalidatePath('/admin/founder-dashboard');
}

export async function triggerFounderKpiDigest() {
  const kpi = await collectKpis();
  const digest = formatSlackDigest(kpi);
  const slackSent = await sendDigestToSlack(digest);
  revalidatePath('/admin/founder-dashboard');
  return { slackSent, digest };
}

export async function triggerFounderOpsAudit() {
  const result = await runOpsAudit();
  const report = formatSlackAudit(result);
  const slackSent = await sendAuditToSlack(report);
  const alertsDispatched = await dispatchAuditAlerts(result.findings);
  revalidatePath('/admin/founder-dashboard');
  return { healthy: result.healthy, findingCount: result.findings.length, slackSent, alertsDispatched };
}
