import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Funnel analytics endpoint
// Stores funnel events for analysis

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { step, userId, metadata, timestamp } = body;

    if (!step) {
      return NextResponse.json({ error: 'Step is required' }, { status: 400 });
    }

    // Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      // Silently fail if no database
      return NextResponse.json({ received: true, stored: false });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Store funnel event
    const { error } = await supabase.from('funnel_events').insert({
      step,
      user_id: userId,
      metadata,
      created_at: timestamp || new Date().toISOString(),
      session_id: metadata?.sessionId,
      user_agent: request.headers.get('user-agent'),
      referrer: request.headers.get('referer'),
    });

    if (error) {
      console.error('Error storing funnel event:', error);
      // Don't fail the request, just log
    }

    return NextResponse.json({ received: true, stored: !error });
  } catch (error) {
    console.error('Error processing funnel event:', error);
    return NextResponse.json({ received: true, stored: false });
  }
}
