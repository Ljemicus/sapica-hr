import { appLogger } from '@/lib/logger';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'PetPark <noreply@petpark.hr>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    const message = 'RESEND_API_KEY is not configured';

    if (process.env.NODE_ENV === 'production') {
      appLogger.error('email', message, { to, subject });
      return { success: false, error: message };
    }

    appLogger.info('email', 'Dev mode — email not sent', { to, subject });
    return { success: true, dev: true, warning: message };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
    });

    if (!res.ok) {
      const error = await res.text();
      appLogger.error('email', 'Resend API error', { error });
      return { success: false, error };
    }

    return { success: true, data: await res.json() };
  } catch (err) {
    appLogger.error('email', 'Failed to send email', { error: String(err) });
    return { success: false, error: 'Failed to send email' };
  }
}
