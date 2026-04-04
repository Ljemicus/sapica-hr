import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';

export const dynamic = 'force-dynamic';

const APP_VERSION = process.env.npm_package_version ?? '0.1.0';
const startedAt = new Date().toISOString();

export async function GET() {
  const start = Date.now();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    appLogger.error('health', 'Missing Supabase env vars');
    return NextResponse.json(
      {
        status: 'error',
        error: 'missing_env',
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        latency_ms: Date.now() - start,
      },
      { status: 503, headers: cacheHeaders() },
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const dbStart = Date.now();
    const { error } = await supabase.from('sitter_profiles').select('user_id').limit(1);
    const dbLatency = Date.now() - dbStart;

    if (error) {
      appLogger.warn('health', 'DB query returned error', { error: error.message, db_latency_ms: dbLatency }, 'P2');
      return NextResponse.json(
        {
          status: 'degraded',
          version: APP_VERSION,
          timestamp: new Date().toISOString(),
          started_at: startedAt,
          checks: { db: { status: 'error', latency_ms: dbLatency } },
          latency_ms: Date.now() - start,
        },
        { status: 503, headers: cacheHeaders() },
      );
    }

    return NextResponse.json(
      {
        status: 'ok',
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        started_at: startedAt,
        environment: process.env.NODE_ENV ?? 'unknown',
        checks: {
          db: { status: 'ok', latency_ms: dbLatency },
        },
        latency_ms: Date.now() - start,
      },
      { headers: cacheHeaders() },
    );
  } catch (err) {
    appLogger.fatal('health', 'DB unreachable', {
      error: err instanceof Error ? err.message : String(err),
    });
    dispatchAlert({
      severity: 'P0',
      service: 'health',
      description: 'Database unreachable — platform is down',
      value: err instanceof Error ? err.message : String(err),
      owner: 'founder',
    });
    return NextResponse.json(
      {
        status: 'error',
        version: APP_VERSION,
        timestamp: new Date().toISOString(),
        started_at: startedAt,
        checks: { db: { status: 'unreachable' } },
        latency_ms: Date.now() - start,
      },
      { status: 503, headers: cacheHeaders() },
    );
  }
}

/** No caching for health checks — uptime monitors need fresh results. */
function cacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
  };
}
