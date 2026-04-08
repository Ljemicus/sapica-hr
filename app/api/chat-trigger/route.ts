import { createAdminClient } from '@/lib/supabase/admin';
import { appLogger } from '@/lib/logger';

/**
 * Trigger chat worker via database webhook
 * Called by: Supabase Edge Function or database trigger
 */
export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      appLogger.warn('chat-trigger.auth', 'Unauthorized trigger request');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse Supabase webhook payload
    const payload = await request.json();
    const record = payload.record;

    if (!record || record.notification_sent) {
      return Response.json({ skipped: true, reason: 'Already processed or no record' });
    }

    // Queue job for chat worker
    const job = {
      messageId: record.id,
      senderId: record.sender_id,
      receiverId: record.receiver_id,
      content: record.content,
      senderName: record.sender_name || 'Korisnik',
    };

    // Call chat worker
    const workerUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr'}/api/chat-worker`;
    const workerSecret = process.env.CHAT_WORKER_SECRET;

    const response = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(workerSecret && { 'Authorization': `Bearer ${workerSecret}` }),
      },
      body: JSON.stringify(job),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Chat worker failed: ${error}`);
    }

    const result = await response.json();

    appLogger.info('chat-trigger.success', 'Chat worker triggered', {
      messageId: record.id,
      emailSent: result.emailSent,
    });

    return Response.json({ success: true, ...result });

  } catch (error) {
    appLogger.error('chat-trigger.error', 'Trigger failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
