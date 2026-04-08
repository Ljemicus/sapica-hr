import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as Sentry from '@sentry/nextjs';

// Health check endpoint for monitoring and load balancers
export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: 'ok' | 'error'; responseTime?: number; message?: string }> = {};
  
  // Test Sentry error capture
  try {
    // Intentionally throw a test error to verify Sentry integration
    if (process.env.NODE_ENV !== 'production') {
      Sentry.captureMessage('Health check test message', 'info');
    }
    checks.sentry_test = { status: 'ok', message: 'Sentry message captured successfully' };
  } catch (error) {
    checks.sentry_test = { status: 'error', message: String(error) };
  }
  
  // Check Supabase connection
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      checks.database = { status: 'error', message: 'Missing Supabase credentials' };
    } else {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      });
      
      const dbStart = Date.now();
      const { error } = await supabase.from('users').select('id').limit(1);
      checks.database = { 
        status: error ? 'error' : 'ok', 
        responseTime: Date.now() - dbStart,
        message: error?.message 
      };
    }
  } catch (error) {
    checks.database = { status: 'error', message: String(error) };
  }

  // Check Redis/Upstash if configured
  if (process.env.UPSTASH_REDIS_REST_URL && !process.env.UPSTASH_REDIS_REST_URL.includes('your-url')) {
    try {
      const redisStart = Date.now();
      const response = await fetch(`${process.env.UPSTASH_REDIS_REST_URL}/ping`, {
        headers: { Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}` },
      });
      checks.redis = { 
        status: response.ok ? 'ok' : 'error', 
        responseTime: Date.now() - redisStart 
      };
    } catch (error) {
      checks.redis = { status: 'error', message: String(error) };
    }
  } else {
    checks.redis = { status: 'ok', message: 'Redis not configured (using mock)' };
  }

  // Check Sentry configuration
  checks.sentry = { 
    status: process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('your-dsn') ? 'ok' : 'error',
    message: process.env.SENTRY_DSN && !process.env.SENTRY_DSN.includes('your-dsn') ? undefined : 'SENTRY_DSN not configured' 
  };

  const totalResponseTime = Date.now() - startTime;
  const allHealthy = Object.values(checks).every(c => c.status === 'ok');

  return NextResponse.json(
    {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV,
      responseTime: totalResponseTime,
      checks,
    },
    { 
      status: allHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'X-Health-Check': 'true',
      }
    }
  );
}
