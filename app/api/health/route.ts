import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const start = Date.now();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { status: 'error', error: 'missing_env', latency_ms: Date.now() - start },
      { status: 503 }
    );
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const dbStart = Date.now();
    const { error } = await supabase.from('sitter_profiles').select('user_id').limit(1);
    const dbLatency = Date.now() - dbStart;

    if (error) {
      return NextResponse.json(
        { status: 'degraded', db: 'error', db_latency_ms: dbLatency, latency_ms: Date.now() - start },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      db: 'ok',
      db_latency_ms: dbLatency,
      latency_ms: Date.now() - start,
    });
  } catch {
    return NextResponse.json(
      { status: 'error', db: 'unreachable', latency_ms: Date.now() - start },
      { status: 503 }
    );
  }
}
