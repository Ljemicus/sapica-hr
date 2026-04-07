// ═══════════════════════════════════════════════════════════════════════════════
// PetPark Calendar System — Notification Library Functions
// ═══════════════════════════════════════════════════════════════════════════════

import { createClient } from '@/lib/supabase/client';
import type { Booking, BookingNotification } from '@/types/calendar';

const supabase = createClient();

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL NOTIFICATIONS (via Resend)
// ═══════════════════════════════════════════════════════════════════════════════

interface EmailNotificationPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email notification via API route
 */
async function sendEmail(payload: EmailNotificationPayload): Promise<boolean> {
  try {
    const response = await fetch('/api/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Generate booking confirmation email HTML
 */
function generateBookingConfirmationEmail(booking: Booking): string {
  const date = new Date(booking.start_time).toLocaleDateString('hr-HR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = new Date(booking.start_time).toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Potvrda rezervacije - PetPark</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Rezervacija potvrđena</h1>
        </div>
        <div class="content">
          <p>Poštovani ${booking.client_name},</p>
          <p>Vaša rezervacija je uspješno potvrđena. Evo detalja:</p>
          
          <div class="details">
            <div class="detail-row">
              <span><strong>Usluga:</strong></span>
              <span>${booking.title}</span>
            </div>
            <div class="detail-row">
              <span><strong>Datum:</strong></span>
              <span>${date}</span>
            </div>
            <div class="detail-row">
              <span><strong>Vrijeme:</strong></span>
              <span>${time}</span>
            </div>
            ${booking.pet_name ? `
            <div class="detail-row">
              <span><strong>Ljubimac:</strong></span>
              <span>${booking.pet_name}</span>
            </div>
            ` : ''}
            ${booking.price ? `
            <div class="detail-row">
              <span><strong>Cijena:</strong></span>
              <span>${booking.price} ${booking.currency}</span>
            </div>
            ` : ''}
          </div>
          
          <p>Ako imate bilo kakvih pitanja ili trebate promijeniti rezervaciju, slobodno nas kontaktirajte.</p>
          
          <div class="footer">
            <p>Hvala vam na povjerenju!<br>Tim PetPark</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate booking reminder email HTML
 */
function generateReminderEmail(booking: Booking, hoursBefore: number): string {
  const date = new Date(booking.start_time).toLocaleDateString('hr-HR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = new Date(booking.start_time).toLocaleTimeString('hr-HR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Podsjetnik na rezervaciju - PetPark</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-row:last-child { border-bottom: none; }
        .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Podsjetnik</h1>
        </div>
        <div class="content">
          <p>Poštovani ${booking.client_name},</p>
          
          <div class="reminder-box">
            <strong>Imate rezervaciju za ${hoursBefore === 24 ? 'sutra' : 'danas'}!</strong>
          </div>
          
          <div class="details">
            <div class="detail-row">
              <span><strong>Usluga:</strong></span>
              <span>${booking.title}</span>
            </div>
            <div class="detail-row">
              <span><strong>Datum:</strong></span>
              <span>${date}</span>
            </div>
            <div class="detail-row">
              <span><strong>Vrijeme:</strong></span>
              <span>${time}</span>
            </div>
            ${booking.location_address ? `
            <div class="detail-row">
              <span><strong>Lokacija:</strong></span>
              <span>${booking.location_address}</span>
            </div>
            ` : ''}
          </div>
          
          <p>Radujemo se vašem dolasku!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate booking cancellation email HTML
 */
function generateCancellationEmail(booking: Booking, reason?: string): string {
  const date = new Date(booking.start_time).toLocaleDateString('hr-HR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Otkazana rezervacija - PetPark</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .cancel-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Rezervacija otkazana</h1>
        </div>
        <div class="content">
          <p>Poštovani ${booking.client_name},</p>
          
          <div class="cancel-box">
            <strong>Vaša rezervacija je otkazana.</strong>
          </div>
          
          <p><strong>Usluga:</strong> ${booking.title}</p>
          <p><strong>Datum:</strong> ${date}</p>
          
          ${reason ? `<p><strong>Razlog:</strong> ${reason}</p>` : ''}
          
          <p>Ako imate pitanja ili želite zakazati novi termin, slobodno nas kontaktirajte.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SENDING FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send booking confirmation notification
 */
export async function sendBookingConfirmation(booking: Booking): Promise<boolean> {
  if (!booking.client_email) return false;

  return sendEmail({
    to: booking.client_email,
    subject: '✅ Vaša rezervacija je potvrđena - PetPark',
    html: generateBookingConfirmationEmail(booking),
  });
}

/**
 * Send booking reminder
 */
export async function sendBookingReminder(
  booking: Booking,
  hoursBefore: 24 | 1
): Promise<boolean> {
  if (!booking.client_email) return false;

  // Mark reminder as sent
  await supabase
    .from('bookings')
    .update({
      [hoursBefore === 24 ? 'reminder_sent_24h' : 'reminder_sent_1h']: true,
    })
    .eq('id', booking.id);

  return sendEmail({
    to: booking.client_email,
    subject: `⏰ Podsjetnik: Vaša rezervacija ${hoursBefore === 24 ? 'sutra' : 'za sat vremena'} - PetPark`,
    html: generateReminderEmail(booking, hoursBefore),
  });
}

/**
 * Send booking cancellation notification
 */
export async function sendBookingCancellation(
  booking: Booking,
  reason?: string
): Promise<boolean> {
  if (!booking.client_email) return false;

  return sendEmail({
    to: booking.client_email,
    subject: '❌ Vaša rezervacija je otkazana - PetPark',
    html: generateCancellationEmail(booking, reason),
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Send push notification to user
 */
export async function sendPushNotification(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<boolean> {
  try {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title,
        body,
        data,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

/**
 * Send booking notification to provider
 */
export async function notifyProviderOfNewBooking(booking: Booking): Promise<boolean> {
  const title = 'Nova rezervacija!';
  const body = `${booking.client_name} je rezervirao/la ${booking.title}`;

  // Get provider user ID based on provider type
  const { data: provider } = await supabase
    .from(booking.provider_type === 'sitter' ? 'sitter_profiles' : booking.provider_type === 'groomer' ? 'groomers' : 'trainers')
    .select('user_id')
    .eq('id', booking.provider_id)
    .single();

  if (provider?.user_id) {
    return sendPushNotification(provider.user_id, title, body, {
      type: 'new_booking',
      bookingId: booking.id,
    });
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════════════════════
// REMINDER PROCESSING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Process pending reminders (should be called by cron job)
 */
export async function processPendingReminders(): Promise<void> {
  const now = new Date();

  // Get bookings needing 24h reminder
  const { data: reminders24h } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .eq('reminder_sent_24h', false)
    .gte('start_time', now.toISOString())
    .lte('start_time', new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString())
    .gte('start_time', new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString());

  for (const booking of reminders24h || []) {
    await sendBookingReminder(booking, 24);
  }

  // Get bookings needing 1h reminder
  const { data: reminders1h } = await supabase
    .from('bookings')
    .select('*')
    .eq('status', 'confirmed')
    .eq('reminder_sent_1h', false)
    .gte('start_time', now.toISOString())
    .lte('start_time', new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString())
    .gte('start_time', new Date(now.getTime() + 30 * 60 * 1000).toISOString());

  for (const booking of reminders1h || []) {
    await sendBookingReminder(booking, 1);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// IN-APP NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Get user's notifications
 */
export async function getNotifications(
  userId: string,
  options?: { unreadOnly?: boolean; limit?: number }
): Promise<BookingNotification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (options?.unreadOnly) {
    query = query.eq('read', false);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  return !error;
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  return !error;
}

/**
 * Subscribe to notifications
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notification: BookingNotification) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as BookingNotification);
      }
    )
    .subscribe();
}
