import { appLogger } from '@/lib/logger';
import { dispatchAlert } from '@/lib/alerting';

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

interface SendSMSOptions {
  to: string;
  message: string;
}

/**
 * Send SMS via Twilio
 * Returns success even in dev mode without credentials
 */
export async function sendSMS({ to, message }: SendSMSOptions) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    const missing = [];
    if (!TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
    if (!TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
    if (!TWILIO_PHONE_NUMBER) missing.push('TWILIO_PHONE_NUMBER');
    
    const errorMsg = `Twilio not configured: ${missing.join(', ')}`;

    if (process.env.NODE_ENV === 'production') {
      appLogger.error('sms', errorMsg, { to });
      return { success: false, error: errorMsg };
    }

    appLogger.info('sms', 'Dev mode — SMS not sent', { to, message: message.slice(0, 50) });
    return { success: true, dev: true, warning: errorMsg };
  }

  // Format phone number (ensure + prefix)
  const formattedTo = to.startsWith('+') ? to : `+385${to.replace(/^0/, '')}`;

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: formattedTo,
          From: TWILIO_PHONE_NUMBER,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      appLogger.error('sms', 'Twilio API error', { error, to: formattedTo });
      dispatchAlert({
        severity: 'P2',
        service: 'sms',
        description: `Twilio API returned ${response.status}`,
        value: `to=${formattedTo}, status=${response.status}`,
        owner: 'platform',
      });
      return { success: false, error };
    }

    const data = await response.json();
    appLogger.info('sms', 'SMS sent successfully', { to: formattedTo, sid: data.sid });
    return { success: true, data };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    appLogger.error('sms', 'Failed to send SMS', { error: errorMsg, to: formattedTo });
    dispatchAlert({
      severity: 'P2',
      service: 'sms',
      description: 'SMS send threw exception',
      value: `to=${formattedTo}`,
      owner: 'platform',
    });
    return { success: false, error: errorMsg };
  }
}

/**
 * Send emergency vet alert SMS
 */
export async function sendEmergencyVetSMS(to: string, petName: string, location: string) {
  const message = `🚨 HITNO - PetPark\n\n"${petName}" treba hitnu veterinarsku pomoć!\n\nNajbliža dostupna stanica:\n${location}\n\nPozovite odmah ili provjerite app za više info.`;
  
  return sendSMS({ to, message });
}

/**
 * Send booking reminder SMS
 */
export async function sendBookingReminderSMS(to: string, sitterName: string, date: string, time?: string) {
  const timeStr = time ? ` u ${time}` : '';
  const message = `📅 Podsjetnik - PetPark\n\nRezervacija kod ${sitterName}\n${date}${timeStr}\n\nPogledajte detalje u appu.`;
  
  return sendSMS({ to, message });
}

/**
 * Send verification code SMS
 */
export async function sendVerificationSMS(to: string, code: string) {
  const message = `PetPark kod za verifikaciju: ${code}\n\nKod vrijedi 10 minuta.`;
  
  return sendSMS({ to, message });
}
