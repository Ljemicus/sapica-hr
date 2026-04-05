import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/api-errors';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { lostPetContactRelaySchema } from '@/lib/validations';
import { sendEmail } from '@/lib/email';
import { appLogger } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError({ status: 400, code: 'INVALID_JSON', message: 'Invalid JSON body' });
  }

  const parsed = lostPetContactRelaySchema.safeParse(body);
  if (!parsed.success) {
    return apiError({ status: 400, code: 'INVALID_INPUT', message: 'Neispravna dojava.', details: parsed.error.flatten().fieldErrors });
  }

  try {
    const { id } = await context.params;
    const supabase = await createClient();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    if (!rateLimit(`lost-pet-relay:${id}:${ip}`, 3, 10 * 60_000)) {
      return apiError({ status: 429, code: 'RATE_LIMITED', message: 'Previše poruka u kratkom roku. Pokušajte ponovno kasnije.' });
    }

    const { data: pet, error: fetchError } = await supabase
      .from('lost_pets')
      .select('id, name, city, neighborhood, status, hidden, user_id, contact_name, contact_email')
      .eq('id', id)
      .single();

    if (fetchError || !pet) {
      return apiError({ status: 404, code: 'LOST_PET_NOT_FOUND', message: 'Oglas nije pronađen.' });
    }

    if ((pet.hidden as boolean) || (pet.status as string) !== 'lost') {
      return apiError({ status: 400, code: 'LISTING_NOT_ACTIVE', message: 'Oglas više nije aktivan.' });
    }

    const admin = createAdminClient();
    let ownerEmail = typeof pet.contact_email === 'string' ? pet.contact_email.trim() : '';
    let ownerName = typeof pet.contact_name === 'string' && pet.contact_name.trim() ? pet.contact_name.trim() : 'Vlasnik';

    if (pet.user_id) {
      const { data: owner } = await admin
        .from('users')
        .select('email, name')
        .eq('id', pet.user_id)
        .maybeSingle();

      if (owner?.email) ownerEmail = String(owner.email).trim();
      if (owner?.name) ownerName = String(owner.name).trim();
    }

    if (!ownerEmail) {
      return apiError({ status: 409, code: 'OWNER_CONTACT_UNAVAILABLE', message: 'Vlasnik trenutačno ne može primati dojave.' });
    }

    const relay = parsed.data;
    const senderName = relay.name?.trim() || 'Anonimni prolaznik';
    const senderEmail = relay.email?.trim() || '';
    const senderPhone = relay.phone?.trim() || '';
    const locationHint = relay.location_hint?.trim() || '';
    const safeMessage = escapeHtml(relay.message.trim()).replace(/\n/g, '<br />');

    const html = `
      <h2>Nova dojava za izgubljenog ljubimca</h2>
      <p>Pozdrav ${escapeHtml(ownerName)},</p>
      <p>Netko je poslao dojavu za vašeg ljubimca <strong>${escapeHtml(String(pet.name))}</strong> putem PetPark obrasca.</p>
      <table style="border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">Pošiljatelj:</td><td>${escapeHtml(senderName)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">Telefon:</td><td>${senderPhone ? escapeHtml(senderPhone) : '<span style="color:#6b7280">Nije ostavljen</span>'}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">Email:</td><td>${senderEmail ? escapeHtml(senderEmail) : '<span style="color:#6b7280">Nije ostavljen</span>'}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">Brza dojava:</td><td>${relay.quick_lead ? 'Da' : 'Ne'}</td></tr>
        ${locationHint ? `<tr><td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">Lokacija:</td><td>${escapeHtml(locationHint)}</td></tr>` : ''}
        <tr><td style="padding: 4px 12px 4px 0; font-weight: bold; vertical-align: top;">Oglas:</td><td>${escapeHtml(`${pet.neighborhood || pet.city || ''}`)}</td></tr>
      </table>
      <p><strong>Poruka:</strong></p>
      <div style="background: #f9fafb; border-radius: 12px; padding: 14px; border: 1px solid #e5e7eb;">${safeMessage}</div>
      <p style="margin-top: 20px; color: #6b7280; font-size: 12px;">Ova poruka je proslijeđena preko PetPark relay obrasca. Odgovorite direktno osobi koristeći podatke koje je ostavila.</p>
    `;

    const emailResult = await sendEmail({
      to: ownerEmail,
      subject: `Nova dojava za ${String(pet.name)}`,
      html,
      replyTo: senderEmail || undefined,
    });

    if (!emailResult.success) {
      appLogger.error('lost-pet-relay', 'Failed to send relay email', {
        listingId: id,
        ownerEmail,
        error: emailResult.error || 'Unknown email failure',
      });
      return apiError({ status: 502, code: 'RELAY_DELIVERY_FAILED', message: 'Dojava nije poslana. Pokušajte ponovno za minutu.' });
    }

    appLogger.info('lost-pet-relay', 'Relay delivered', {
      listingId: id,
      ownerEmail,
      hasSenderEmail: Boolean(senderEmail),
      hasSenderPhone: Boolean(senderPhone),
      quickLead: Boolean(relay.quick_lead),
    });

    return NextResponse.json({ success: true, delivery: { emailNotificationSent: true } }, { status: 201 });
  } catch (error) {
    appLogger.error('lost-pet-relay', 'Unexpected relay error', {
      error: error instanceof Error ? error.message : String(error),
    });
    return apiError({ status: 500, code: 'RELAY_FAILED', message: 'Dojava nije poslana.' });
  }
}
