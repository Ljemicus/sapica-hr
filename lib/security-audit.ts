import { appLogger } from '@/lib/logger';

export type SecurityEventType = 
  | 'failed_login'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'csrf_violation'
  | 'unauthorized_access'
  | 'permission_denied'
  | 'data_exfiltration_attempt'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'brute_force_detected'
  | 'account_locked'
  | 'password_reset_requested'
  | 'password_changed'
  | 'mfa_enabled'
  | 'mfa_disabled'
  | 'session_hijacking_attempt'
  | 'impossible_travel'
  | 'device_change'
  | 'api_key_compromised';

export interface SecurityAuditLog {
  eventType: SecurityEventType;
  userId?: string;
  ipAddress: string | null;
  userAgent: string | null;
  timestamp: string;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
}

interface SecurityLogContext {
  request?: Request;
  userId?: string;
  ip?: string | null;
  userAgent?: string | null;
  details?: Record<string, unknown>;
}

/**
 * Calculate risk score for security events
 */
function calculateRiskScore(
  eventType: SecurityEventType,
  details: Record<string, unknown>
): number {
  const baseScores: Record<SecurityEventType, number> = {
    failed_login: 30,
    suspicious_activity: 50,
    rate_limit_exceeded: 40,
    csrf_violation: 60,
    unauthorized_access: 70,
    permission_denied: 40,
    data_exfiltration_attempt: 90,
    sql_injection_attempt: 95,
    xss_attempt: 85,
    brute_force_detected: 80,
    account_locked: 60,
    password_reset_requested: 20,
    password_changed: 10,
    mfa_enabled: 5,
    mfa_disabled: 30,
    session_hijacking_attempt: 95,
    impossible_travel: 75,
    device_change: 25,
    api_key_compromised: 100,
  };

  let score = baseScores[eventType] || 50;

  // Adjust based on details
  if (details.repeated === true) score += 20;
  if (details.automated === true) score += 15;
  if (details.knownThreat === true) score += 25;
  if (details.dataAccessed) score += 10;

  return Math.min(100, score);
}

/**
 * Determine severity based on risk score
 */
function getSeverity(riskScore: number): SecurityAuditLog['severity'] {
  if (riskScore >= 80) return 'critical';
  if (riskScore >= 60) return 'high';
  if (riskScore >= 40) return 'medium';
  return 'low';
}

/**
 * Log a security event
 */
export async function logSecurityEvent(
  eventType: SecurityEventType,
  details: Record<string, unknown> = {},
  context: SecurityLogContext = {}
): Promise<void> {
  const riskScore = calculateRiskScore(eventType, details);
  const severity = getSeverity(riskScore);

  const logEntry: SecurityAuditLog = {
    eventType,
    userId: context.userId,
    ipAddress: context.ip || null,
    userAgent: context.userAgent || null,
    timestamp: new Date().toISOString(),
    details,
    severity,
    riskScore,
  };

  // Log to application logger
  const logMethod = severity === 'critical' || severity === 'high' 
    ? 'error' 
    : severity === 'medium' 
    ? 'warn' 
    : 'info';

  appLogger[logMethod]('security', `Security event: ${eventType}`, {
    ...logEntry,
    details: JSON.stringify(details),
  });

  // For high/critical events, also trigger alerting
  if (severity === 'high' || severity === 'critical') {
    await triggerSecurityAlert(logEntry);
  }

  // Store in database for audit trail
  await storeSecurityLog(logEntry);
}

/**
 * Trigger security alerts for high-risk events
 */
async function triggerSecurityAlert(logEntry: SecurityAuditLog): Promise<void> {
  // Send to Slack if configured
  if (process.env.SLACK_INCIDENTS_WEBHOOK) {
    try {
      const payload = {
        text: `🚨 Security Alert: ${logEntry.eventType}`,
        attachments: [{
          color: logEntry.severity === 'critical' ? 'danger' : 'warning',
          fields: [
            { title: 'Severity', value: logEntry.severity, short: true },
            { title: 'Risk Score', value: logEntry.riskScore.toString(), short: true },
            { title: 'User ID', value: logEntry.userId || 'N/A', short: true },
            { title: 'IP Address', value: logEntry.ipAddress || 'N/A', short: true },
            { title: 'Timestamp', value: logEntry.timestamp, short: false },
            { title: 'Details', value: JSON.stringify(logEntry.details, null, 2), short: false },
          ],
        }],
      };

      await fetch(process.env.SLACK_INCIDENTS_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      appLogger.error('security', 'Failed to send Slack security alert', {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

/**
 * Store security log in database
 */
async function storeSecurityLog(logEntry: SecurityAuditLog): Promise<void> {
  try {
    // Import dynamically to avoid circular dependencies
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    const { error } = await supabase.from('security_audit_logs').insert({
      event_type: logEntry.eventType,
      user_id: logEntry.userId,
      ip_address: logEntry.ipAddress,
      user_agent: logEntry.userAgent,
      details: logEntry.details,
      severity: logEntry.severity,
      risk_score: logEntry.riskScore,
      created_at: logEntry.timestamp,
    });

    if (error) {
      appLogger.error('security', 'Failed to store security log', {
        error: error.message,
        logEntry,
      });
    }
  } catch (error) {
    appLogger.error('security', 'Exception storing security log', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
  }
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(
  email: string,
  reason: string,
  context: SecurityLogContext
): Promise<void> {
  await logSecurityEvent(
    'failed_login',
    { email, reason, attempts: context.details?.attempts },
    context
  );
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
  activity: string,
  details: Record<string, unknown>,
  context: SecurityLogContext
): Promise<void> {
  await logSecurityEvent(
    'suspicious_activity',
    { activity, ...details },
    context
  );
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
  endpoint: string,
  limit: number,
  context: SecurityLogContext
): Promise<void> {
  await logSecurityEvent(
    'rate_limit_exceeded',
    { endpoint, limit },
    context
  );
}

/**
 * Log unauthorized access attempt
 */
export async function logUnauthorizedAccess(
  resource: string,
  action: string,
  context: SecurityLogContext
): Promise<void> {
  await logSecurityEvent(
    'unauthorized_access',
    { resource, action },
    context
  );
}

/**
 * Log brute force detection
 */
export async function logBruteForceDetected(
  target: string,
  attemptCount: number,
  context: SecurityLogContext
): Promise<void> {
  await logSecurityEvent(
    'brute_force_detected',
    { target, attemptCount, automated: attemptCount > 10 },
    context
  );
}

// Export default for convenience
export default {
  log: logSecurityEvent,
  logFailedLogin,
  logSuspiciousActivity,
  logRateLimitExceeded,
  logUnauthorizedAccess,
  logBruteForceDetected,
};
