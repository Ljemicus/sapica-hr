import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdoptionListing } from '@/lib/db/adoption-listings';
import { createAdoptionInquiry } from '@/lib/db/adoption-inquiries';
import { sendEmail } from '@/lib/email';
import { appLogger } from '@/lib/logger';

const inquirySchema = z.object({
  listing_id: z.string().uuid(),
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka'),
  email: z.string().email('Neispravan email'),
  phone: z.string().min(6, 'Neispravan broj telefona'),
  message: z.string().min(10, 'Poruka mora imati najmanje 10 znakova'),
  has_experience: z.boolean().optional(),
  has_yard: z.boolean().optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Neispravan zahtjev' }, { status: 400 });
  }

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validacijska greška', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const listing = await getAdoptionListing(parsed.data.listing_id);
  if (!listing || listing.status !== 'active') {
    return NextResponse.json({ error: 'Oglas nije pronađen ili nije aktivan' }, { status: 404 });
  }

  // Persist the inquiry
  const inquiry = await createAdoptionInquiry({
    listing_id: listing.id,
    publisher_id: listing.publisher_id,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    message: parsed.data.message,
    has_experience: parsed.data.has_experience ?? false,
    has_yard: parsed.data.has_yard ?? false,
  });

  if (!inquiry) {
    appLogger.error('adoption-inquiry', 'Failed to persist inquiry', {
      listing_id: listing.id,
    });
    return NextResponse.json({ error: 'Greška pri spremanju upita' }, { status: 500 });
  }

  appLogger.info('adoption-inquiry', 'Inquiry persisted', {
    inquiry_id: inquiry.id,
    listing_id: listing.id,
    listing_name: listing.name,
    publisher_id: listing.publisher_id,
  });

  // Notify publisher via email (best-effort, don't block response)
  let notificationSent = false;

  if (listing.contact_email) {
    try {
      const emailResult = await sendEmail({
      to: listing.contact_email,
      subject: `Novi upit za udomljavanje: ${listing.name}`,
      html: `
        <h2>Novi upit za udomljavanje</h2>
        <p>Primili ste novi upit za vašeg ljubimca <strong>${listing.name}</strong>.</p>
        <table style="border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Ime:</td><td>${parsed.data.name}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Email:</td><td>${parsed.data.email}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Telefon:</td><td>${parsed.data.phone}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Iskustvo:</td><td>${parsed.data.has_experience ? 'Da' : 'Ne'}</td></tr>
          <tr><td style="padding:4px 12px 4px 0;font-weight:bold">Vrt/dvorište:</td><td>${parsed.data.has_yard ? 'Da' : 'Ne'}</td></tr>
        </table>
        <p><strong>Poruka:</strong></p>
        <p style="background:#f5f5f5;padding:12px;border-radius:8px">${parsed.data.message}</p>
        <p style="color:#888;font-size:12px;margin-top:24px">Ovaj email je poslan putem PetPark platforme.</p>
      `.trim(),
      });
      notificationSent = Boolean(emailResult?.success);
    } catch (err) {
      appLogger.error('adoption-inquiry', 'Failed to send notification email', {
        inquiry_id: inquiry.id,
        error: String(err),
      });
    }
  }

  return NextResponse.json({
    success: true,
    inquiryId: inquiry.id,
    delivery: {
      stored: true,
      emailNotificationRequested: Boolean(listing.contact_email),
      emailNotificationSent: notificationSent,
    },
  }, { status: 201 });
}
