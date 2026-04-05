import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { getAuthUser } from '@/lib/auth';
import { getLostPet } from '@/lib/db/lost-pets';
import { sendEmail } from '@/lib/email';
import { appLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';
import { lostPetContactRelaySchema } from '@/lib/validations';

const CONTACT_RELAY_LIMIT = 3;
const CONTACT_RELAY_WINDOW_MS = 15 * 60_000;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getClientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('cf-connecting-ip')?.trim()
    || 'unknown';
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const user = await getAuthUser();

    if (!user) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('lost_pets')
      .select('contact_name, contact_phone, contact_email, hidden, user_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    const isOwner = user.id === data.user_id;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return apiError({ status: 403, code: 'FORBIDDEN', message: 'Kontakt nije javno dostupan.' });
    }

    return NextResponse.json({
      contact_name: data.contact_name || '',
      contact_phone: data.contact_phone || '',
      contact_email: data.contact_email || '',
    });
  } catch {
    return apiError({ status: 500, code: 'CONTACT_FETCH_FAILED', message: 'Kontakt nije dostupan.' });
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const ip = getClientIp(request);
  const user = await getAuthUser();
  const rateLimitKey = `lost-pet-contact-relay:${id}:${user?.id ?? 'anon'}:${ip}`;

  if (!rateLimit(rateLimitKey, CONTACT_RELAY_LIMIT, CONTACT_RELAY_WINDOW_MS)) {
    return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše poruka za ovaj oglas. Pokušajte ponovno uskoro.' });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = lostPetContactRelaySchema.safeParse(body);
  if (!parsed.success) {
    return apiError({
      status: 400,
      code: 'INVALID_INPUT',
      message: 'Neispravna poruka za vlasnika.',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  if (parsed.data.website && parsed.data.website.trim().length > 0) {
    return NextResponse.json({ success: true, delivered: false, honeypot: true }, { status: 202 });
  }

  const pet = await getLostPet(id);
  if (!pet || pet.hidden) {
    return apiError({ status: 404, code: 'NOT_FOUND', message: 'Oglas nije pronađen.' });
  }

  if (pet.status === 'found') {
    return apiError({ status: 409, code: 'LISTING_FOUND', message: 'Ovaj ljubimac je već označen kao pronađen.' });
  }

  if (pet.status === 'expired') {
    return apiError({ status: 410, code: 'LISTING_EXPIRED', message: 'Ovaj oglas je istekao.' });
  }

  if (!pet.contact_email) {
    appLogger.warn('lost-pet-contact-relay', 'Missing owner contact email for listing', {
      listingId: pet.id,
      ownerId: pet.user_id,
    });
    return apiError({ status: 409, code: 'CONTACT_UNAVAILABLE', message: 'Vlasnik trenutno ne prima poruke za ovaj oglas.' });
  }

  if (user?.id && pet.user_id && user.id === pet.user_id) {
    return apiError({ status: 400, code: 'SELF_CONTACT_NOT_ALLOWED', message: 'Ne možete poslati poruku sami sebi.' });
  }

  if (user?.email && user.email.toLowerCase() !== parsed.data.email.toLowerCase()) {
    return apiError({ status: 403, code: 'EMAIL_MISMATCH', message: 'Email se mora podudarati s prijavljenim računom.' });
  }

  const senderName = escapeHtml(parsed.data.name);
  const senderEmail = escapeHtml(parsed.data.email);
  const senderPhone = escapeHtml(parsed.data.phone?.trim() || 'Nije ostavljen');
  const senderMessage = escapeHtml(parsed.data.message).replace(/\n/g, '<br />');
  const locationHint = parsed.data.location_hint?.trim();
  const escapedLocationHint = locationHint ? escapeHtml(locationHint) : null;
  const listingUrl = `https://petpark.hr/izgubljeni/${pet.id}`;

  const emailResult = await sendEmail({
    to: pet.contact_email,
    subject: `Nova dojava za izgubljenog ljubimca: ${pet.name}`,
    html: `
      <h2>Nova poruka za oglas izgubljenog ljubimca</h2>
      <p>Netko vam je poslao dojavu putem PetParka za <strong>${escapeHtml(pet.name)}</strong>.</p>
      <table style="border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Ime:</td><td>${senderName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Email:</td><td>${senderEmail}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Telefon:</td><td>${senderPhone}</td></tr>
        ${escapedLocationHint ? `<tr><td style="padding:4px 12px 4px 0;font-weight:bold">Lokacija / trag:</td><td>${escapedLocationHint}</td></tr>` : ''}
      </table>
      <p><strong>Poruka:</strong></p>
      <p style="background:#f5f5f5;padding:12px;border-radius:8px">${senderMessage}</p>
      <p style="margin-top:20px">
        <a href="${listingUrl}" style="color:#0f766e;font-weight:600">Otvori oglas na PetParku</a>
      </p>
      <p style="color:#888;font-size:12px;margin-top:24px">Odgovorite direktno pošiljatelju koristeći navedene podatke. PetPark ne prikazuje vaš kontakt javno po defaultu.</p>
    `.trim(),
  });

  if (!emailResult?.success) {
    appLogger.error('lost-pet-contact-relay', 'Failed to send lost-pet relay email', {
      listingId: pet.id,
      ownerId: pet.user_id,
      to: pet.contact_email,
      senderEmail: parsed.data.email,
      ip,
    });
    return apiError({ status: 502, code: 'DELIVERY_FAILED', message: 'Poruku trenutno nismo uspjeli isporučiti. Pokušajte ponovno uskoro.' });
  }

  appLogger.info('lost-pet-contact-relay', 'Lost-pet relay email sent', {
    listingId: pet.id,
    ownerId: pet.user_id,
    senderEmail: parsed.data.email,
    senderUserId: user?.id ?? null,
    ip,
  });

  return NextResponse.json({
    success: true,
    delivered: true,
    message: 'Poruka je proslijeđena vlasniku. Ako je oglas još aktivan, javit će vam se čim stigne.',
  }, { status: 202 });
}
