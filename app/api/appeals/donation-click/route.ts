import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
import { appealDonationClickEmail } from '@/lib/email-templates';
import { appLogger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/appeals/donation-click
 * 
 * Tracks a donation click and sends email notification to the organization.
 * Rate limited to prevent spam.
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting: max 3 clicks per IP per 10 minutes for the same appeal
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const body = await request.json();
    const { appealId, appealSlug } = body;

    if (!appealId || !appealSlug) {
      return NextResponse.json(
        { error: 'Missing required fields: appealId, appealSlug' },
        { status: 400 }
      );
    }

    const rateLimitKey = `donation-click:${ip}:${appealId}`;
    if (!rateLimit(rateLimitKey, 3, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Previše pokušaja. Pokušajte kasnije.' },
        { status: 429 }
      );
    }

    // Get current user (if logged in)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch appeal with organization details
    const { data: appeal, error: appealError } = await supabase
      .from('rescue_appeals')
      .select(`
        *,
        organization:rescue_organizations(*)
      `)
      .eq('id', appealId)
      .eq('slug', appealSlug)
      .maybeSingle();

    if (appealError || !appeal) {
      appLogger.warn('appeals', 'Donation click for non-existent appeal', { appealId, appealSlug });
      return NextResponse.json(
        { error: 'Apelacija nije pronađena' },
        { status: 404 }
      );
    }

    const organization = appeal.organization;
    if (!organization?.email) {
      appLogger.warn('appeals', 'Donation click for appeal without organization email', { appealId, orgId: organization?.id });
      return NextResponse.json(
        { error: 'Organizacija nema email adresu' },
        { status: 400 }
      );
    }

    // Get donor info if logged in
    let donorInfo = null;
    if (user) {
      const { data: userData } = await supabase
        .from('users')
        .select('name, email, phone')
        .eq('id', user.id)
        .single();
      
      if (userData) {
        donorInfo = {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          isRegistered: true,
        };
      }
    }

    // Log the click
    const { error: logError } = await supabase
      .from('appeal_donation_clicks')
      .insert({
        appeal_id: appealId,
        organization_id: organization.id,
        donor_user_id: user?.id || null,
        donor_email: donorInfo?.email || null,
        ip_address: ip.length > 45 ? ip.slice(0, 45) : ip, // IPv6 max length
        user_agent: request.headers.get('user-agent')?.slice(0, 500) || null,
      });

    if (logError) {
      appLogger.error('appeals', 'Failed to log donation click', { error: logError.message });
      // Continue anyway - don't block the user
    }

    // Send email to organization
    const emailHtml = appealDonationClickEmail({
      organizationName: organization.display_name,
      appealTitle: appeal.title,
      appealUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://petpark.hr'}/apelacije/${appealSlug}`,
      donorName: donorInfo?.name || null,
      donorEmail: donorInfo?.email || null,
      donorPhone: donorInfo?.phone || null,
      isAnonymous: !donorInfo,
      clickedAt: new Date().toISOString(),
    });

    const emailResult = await sendEmail({
      to: organization.email,
      subject: `Novi interes za donaciju - ${appeal.title}`,
      html: emailHtml,
      replyTo: donorInfo?.email || undefined,
    });

    if (!emailResult.success) {
      appLogger.error('appeals', 'Failed to send donation click email', { 
        to: organization.email, 
        appealId,
        error: emailResult.error 
      });
      // Don't fail the request - the click was logged
    }

    return NextResponse.json({
      success: true,
      message: 'Donation click tracked and organization notified',
      donorRecognized: !!donorInfo,
    });

  } catch (error) {
    appLogger.error('appeals', 'Unexpected error in donation click handler', { 
      error: error instanceof Error ? error.message : String(error) 
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
