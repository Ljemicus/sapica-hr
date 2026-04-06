// SMS Provider configuration and helpers
// Supports Twilio (global) and Infobip (Croatia/EU)

export interface SMSConfig {
  provider: 'twilio' | 'infobip';
  accountSid?: string; // Twilio
  authToken?: string; // Twilio
  fromNumber?: string; // Twilio
  apiKey?: string; // Infobip
  baseUrl?: string; // Infobip
  sender?: string; // Infobip
}

export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

function getConfig(): SMSConfig {
  return {
    provider: (process.env.SMS_PROVIDER as 'twilio' | 'infobip') || 'twilio',
    // Twilio
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_PHONE_NUMBER,
    // Infobip
    apiKey: process.env.INFOBIP_API_KEY,
    baseUrl: process.env.INFOBIP_BASE_URL,
    sender: process.env.INFOBIP_SENDER || 'PetPark',
  };
}

export async function sendSMS(message: SMSMessage): Promise<SMSResult> {
  const config = getConfig();
  
  if (config.provider === 'twilio') {
    return sendTwilioSMS(message, config);
  } else {
    return sendInfobipSMS(message, config);
  }
}

async function sendTwilioSMS(
  message: SMSMessage,
  config: SMSConfig
): Promise<SMSResult> {
  try {
    if (!config.accountSid || !config.authToken || !config.fromNumber) {
      return {
        success: false,
        error: 'Twilio configuration missing',
      };
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const auth = Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64');

    const body = new URLSearchParams({
      To: message.to,
      From: message.from || config.fromNumber,
      Body: message.body,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (response.ok) {
      return {
        success: true,
        messageId: data.sid,
      };
    } else {
      return {
        success: false,
        error: data.message || 'Twilio API error',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function sendInfobipSMS(
  message: SMSMessage,
  config: SMSConfig
): Promise<SMSResult> {
  try {
    if (!config.apiKey || !config.baseUrl) {
      return {
        success: false,
        error: 'Infobip configuration missing',
      };
    }

    const url = `${config.baseUrl}/sms/2/text/advanced`;

    const payload = {
      messages: [
        {
          from: message.from || config.sender || 'PetPark',
          destinations: [{ to: formatPhoneNumber(message.to) }],
          text: message.body,
        },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `App ${config.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (response.ok && data.messages?.[0]?.status?.groupId === 1) {
      return {
        success: true,
        messageId: data.messages[0].messageId,
      };
    } else {
      return {
        success: false,
        error: data.messages?.[0]?.status?.description || 'Infobip API error',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Format phone number for Croatia/EU
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with Croatian country code
  if (cleaned.startsWith('0')) {
    cleaned = '385' + cleaned.substring(1);
  }
  
  // If doesn't have country code, assume Croatia
  if (!cleaned.startsWith('385') && cleaned.length === 9) {
    cleaned = '385' + cleaned;
  }
  
  return cleaned;
}

// SMS Templates
export const smsTemplates = {
  bookingConfirmed: (data: { sitterName: string; petName: string; date: string; time: string }) =>
    `PetPark: ${data.sitterName} je potvrdio/la čuvanje za ${data.petName}. Datum: ${data.date} u ${data.time}. Detalji u appu.`,
  
  bookingRequest: (data: { ownerName: string; petName: string; date: string; time: string }) =>
    `PetPark: Nova rezervacija od ${data.ownerName} za ${data.petName}. Datum: ${data.date} u ${data.time}. Odgovorite u appu.`,
  
  bookingReminder: (data: { type: 'owner' | 'sitter'; name: string; petName: string; date: string; time: string }) =>
    data.type === 'owner'
      ? `PetPark: Podsjetnik - sutra čuvanje ${data.petName} kod ${data.name}. ${data.date} u ${data.time}.`
      : `PetPark: Podsjetnik - sutra čuvanje ${data.petName} za ${data.name}. ${data.date} u ${data.time}.`,
  
  bookingCancelled: (data: { name: string; petName: string; date: string }) =>
    `PetPark: Rezervacija za ${data.petName} (${data.date}) je otkazana od ${data.name}.`,
  
  messageReceived: (data: { fromName: string; preview: string }) =>
    `PetPark: Nova poruka od ${data.fromName}: "${data.preview.substring(0, 50)}${data.preview.length > 50 ? '...' : ''}"`,
  
  emergencyVet: (data: { clinicName: string; phone: string; address: string }) =>
    `PetPark Hitna Pomoć: ${data.clinicName}. Tel: ${data.phone}. Adresa: ${data.address}`,
};
