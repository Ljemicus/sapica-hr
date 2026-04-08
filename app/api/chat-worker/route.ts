import { createAdminClient } from '@/lib/supabase/admin';
import { appLogger } from '@/lib/logger';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface ChatNotificationJob {
  messageId: string;
  senderId: string;
  receiverId: string;
  content: string | null;
  senderName: string;
}

/**
 * Chat Worker - Background job for processing chat notifications
 * Triggered by: Database webhook on messages insert
 * Actions: Send email notification if user is offline
 */
export async function POST(request: Request) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('authorization');
    const webhookSecret = process.env.CHAT_WORKER_SECRET;
    
    if (webhookSecret && authHeader !== `Bearer ${webhookSecret}`) {
      appLogger.warn('chat-worker.auth', 'Unauthorized chat worker request');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const job: ChatNotificationJob = await request.json();
    
    appLogger.info('chat-worker.start', 'Processing chat notification', {
      messageId: job.messageId,
      senderId: job.senderId,
      receiverId: job.receiverId,
    });

    const admin = createAdminClient();

    // Check if receiver is online (has active session in last 5 minutes)
    const { data: sessions } = await admin
      .from('user_sessions')
      .select('last_active_at')
      .eq('user_id', job.receiverId)
      .gt('last_active_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      .limit(1);

    const isOnline = sessions && sessions.length > 0;

    // Check if receiver has unread messages in this conversation
    const { data: unreadCount } = await admin
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', job.receiverId)
      .eq('sender_id', job.senderId)
      .eq('read', false);

    // Get receiver email preferences
    const { data: receiver } = await admin
      .from('users')
      .select('email, name, notification_settings')
      .eq('id', job.receiverId)
      .single();

    if (!receiver) {
      appLogger.warn('chat-worker.error', 'Receiver not found', { receiverId: job.receiverId });
      return Response.json({ error: 'Receiver not found' }, { status: 404 });
    }

    // Check if email notifications are enabled
    const notificationsEnabled = receiver.notification_settings?.email_messages !== false;

    // Send email if: offline + notifications enabled + has email
    if (!isOnline && notificationsEnabled && receiver.email && resend) {
      const previewText = job.content 
        ? job.content.substring(0, 100) + (job.content.length > 100 ? '...' : '')
        : 'Poslana je nova poruka';

      await resend.emails.send({
        from: 'PetPark <poruke@petpark.hr>',
        to: receiver.email,
        subject: `Nova poruka od ${job.senderName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #5A7D5A;">Nova poruka na PetParku</h2>
            <p><strong>${job.senderName}</strong> ti je poslao/la poruku:</p>
            <blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #5A7D5A; margin: 15px 0;">
              ${previewText}
            </blockquote>
            <p>
              <a href="https://petpark.hr/poruke" style="background: #5A7D5A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Odgovori na poruku
              </a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="color: #666; font-size: 12px;">
              Ako ne želiš primati email obavijesti o porukama, 
              <a href="https://petpark.hr/postavke">promijeni postavke obavijesti</a>.
            </p>
          </div>
        `,
      });

      appLogger.info('chat-worker.email', 'Email notification sent', {
        messageId: job.messageId,
        receiverId: job.receiverId,
        receiverEmail: receiver.email,
      });
    } else {
      appLogger.info('chat-worker.skip', 'Skipping email notification', {
        messageId: job.messageId,
        isOnline,
        notificationsEnabled,
        hasEmail: !!receiver.email,
        hasResend: !!resend,
      });
    }

    // Mark message as processed
    await admin
      .from('messages')
      .update({ notification_sent: true })
      .eq('id', job.messageId);

    return Response.json({ 
      success: true, 
      emailSent: !isOnline && notificationsEnabled && !!receiver.email && !!resend,
    });

  } catch (error) {
    appLogger.error('chat-worker.error', 'Chat worker failed', { 
      error: error instanceof Error ? error.message : String(error),
    });
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
