/**
 * Production environment variable validation.
 *
 * Checks that required env vars are present and not still set to placeholder
 * values. Returns a structured result suitable for the /api/health endpoint.
 */

type EnvVarRule = {
  name: string;
  /** Only required when NODE_ENV === 'production' */
  prodOnly?: boolean;
  /** Regex that indicates the value is still a placeholder */
  placeholderPattern?: RegExp;
  /** Missing value should degrade to warning instead of error */
  severity?: 'error' | 'warning';
};

const RULES: EnvVarRule[] = [
  // Supabase
  { name: 'NEXT_PUBLIC_SUPABASE_URL' },
  { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY' },
  { name: 'SUPABASE_SERVICE_ROLE_KEY', prodOnly: true },

  // Stripe
  {
    name: 'STRIPE_SECRET_KEY',
    prodOnly: true,
    placeholderPattern: /REPLACE/,
  },
  {
    name: 'STRIPE_WEBHOOK_SECRET',
    prodOnly: true,
    placeholderPattern: /REPLACE/,
  },

  // Alerting (important for ops, but should not mark app itself as unavailable)
  { name: 'SLACK_INCIDENTS_WEBHOOK', prodOnly: true, severity: 'warning' },
  { name: 'SLACK_OPS_WEBHOOK', prodOnly: true, severity: 'warning' },

  // Cron auth
  { name: 'CRON_SECRET', prodOnly: true },
];

export type EnvCheckResult = {
  status: 'ok' | 'warning' | 'error';
  missing: string[];
  placeholder: string[];
  warnings: string[];
};

export function checkEnv(): EnvCheckResult {
  const isProd = process.env.NODE_ENV === 'production';
  const missing: string[] = [];
  const placeholder: string[] = [];
  const warnings: string[] = [];

  for (const rule of RULES) {
    if (rule.prodOnly && !isProd) continue;

    const value = process.env[rule.name];

    if (!value || value.trim() === '') {
      if (rule.severity === 'warning') {
        warnings.push(rule.name);
      } else {
        missing.push(rule.name);
      }
      continue;
    }

    if (rule.placeholderPattern && rule.placeholderPattern.test(value)) {
      placeholder.push(rule.name);
    }
  }

  const status =
    missing.length > 0
      ? 'error'
      : placeholder.length > 0 || warnings.length > 0
        ? 'warning'
        : 'ok';

  return { status, missing, placeholder, warnings };
}
