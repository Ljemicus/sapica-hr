import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sendSMS, smsTemplates } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify admin or system role
    const { data: { user } } = await supabase.auth.getUser();
    
    // Allow system/internal calls without auth for cron jobs
    const body = await request.json();
    const { to, template, data, body: customBody, internalKey } = body;
    
    // Check internal key for system calls
    const isSystemCall = internalKey === process.env.SMS_INTERNAL_KEY;
    
    if (!user && !isSystemCall) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (!to) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }
    
    // Build message body from template or use custom
    let messageBody = customBody;
    if (template && data) {
      const templateFn = smsTemplates[template as keyof typeof smsTemplates];
      if (templateFn) {
        messageBody = templateFn(data);
      }
    }
    
    if (!messageBody) {
      return NextResponse.json(
        { error: 'Message body is required' },
        { status: 400 }
      );
    }
    
    // Check user's SMS preferences
    const { data: userPrefs } = await supabase
      .from('user_notifications')
      .select('sms_enabled, phone_verified')
      .eq('user_id', body.userId)
      .single();
    
    if (userPrefs && !userPrefs.sms_enabled) {
      return NextResponse.json(
        { success: false, reason: 'SMS disabled by user' },
        { status: 200 }
      );
    }
    
    // Send SMS
    const result = await sendSMS({
      to,
      body: messageBody,
    });
    
    // Log to database
    await supabase.from('sms_logs').insert({
      user_id: body.userId || user?.id,
      phone: to,
      body: messageBody,
      template: template || 'custom',
      status: result.success ? 'sent' : 'failed',
      provider_message_id: result.messageId,
      error: result.error,
    });
    
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
