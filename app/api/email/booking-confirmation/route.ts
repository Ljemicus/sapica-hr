import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/api-errors';
import { sendBookingConfirmationEmail } from '@/lib/email-sequences';
import type { User } from '@/lib/types';

/**
 * POST /api/email/booking-confirmation
 * Send booking confirmation email
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const body = await request.json();
    const { 
      userId, 
      petName, 
      serviceName, 
      providerName, 
      dates, 
      totalPrice 
    }: {
      userId: string;
      petName: string;
      serviceName: string;
      providerName: string;
      dates: string;
      totalPrice: string;
    } = body;

    if (!userId || !petName || !serviceName || !dates) {
      return apiError({ 
        status: 400, 
        code: 'INVALID_REQUEST', 
        message: 'Missing required fields' 
      });
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, created_at')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return apiError({ status: 404, code: 'USER_NOT_FOUND', message: 'User not found' });
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role as User['role'],
      avatar_url: null,
      phone: null,
      city: null,
      created_at: userData.created_at,
    };

    const result = await sendBookingConfirmationEmail(user, {
      petName,
      serviceName,
      providerName: providerName || 'Vaš čuvar',
      dates,
      totalPrice: totalPrice || '0 HRK',
    });

    if (!result.success) {
      return apiError({ 
        status: 500, 
        code: 'EMAIL_SEND_FAILED', 
        message: result.error || 'Failed to send confirmation email' 
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Booking confirmation email error:', error);
    return apiError({ 
      status: 500, 
      code: 'INTERNAL_ERROR', 
      message: 'Failed to send booking confirmation' 
    });
  }
}
