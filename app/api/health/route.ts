import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { createAdminClient } from '@/lib/supabase/admin';
import { getStripe } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type CheckName = 'db' | 'auth' | 'stripe' | 'redis';
type CheckResult = {
  ok: boolean;
  responseTimeMs: number;
  message?: string;
};

type HealthChecks = Record<CheckName, CheckResult>;

function configured(value: string | undefined): value is string {
  return Boolean(value && !value.includes('placeholder') && !value.includes('your-') && !value.includes('REPLACE'));
}

async function timedCheck(fn: () => Promise<void>): Promise<CheckResult> {
  const started = Date.now();
  try {
    await fn();
    return { ok: true, responseTimeMs: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      responseTimeMs: Date.now() - started,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

async function checkRedis(): Promise<void> {
  if (!configured(process.env.UPSTASH_REDIS_REST_URL) || !configured(process.env.UPSTASH_REDIS_REST_TOKEN)) {
    throw new Error('Upstash Redis is not configured');
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  const pong = await redis.ping();
  if (pong !== 'PONG') {
    throw new Error(`Unexpected Redis ping response: ${String(pong)}`);
  }
}

export async function GET() {
  const started = Date.now();
  const admin = createAdminClient();

  const checks: HealthChecks = {
    db: await timedCheck(async () => {
      const { error } = await admin.from('profiles').select('id').limit(1);
      if (error) throw new Error(error.message);
    }),
    auth: await timedCheck(async () => {
      const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (error) throw new Error(error.message);
    }),
    stripe: await timedCheck(async () => {
      await getStripe().balance.retrieve();
    }),
    redis: await timedCheck(checkRedis),
  };

  const ok = Object.values(checks).every((check) => check.ok);

  return NextResponse.json(
    {
      ok,
      status: ok ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV,
      responseTimeMs: Date.now() - started,
      checks,
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Health-Check': 'true',
      },
    },
  );
}
