const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = 'PetPark <noreply@petpark.hr>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!RESEND_API_KEY) {
    console.log('[Email DEV]', { to, subject });
    return { success: true, dev: true };
  }

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
    console.error('[Email Error]', error);
    return { success: false, error };
  }

  return { success: true, data: await res.json() };
}
