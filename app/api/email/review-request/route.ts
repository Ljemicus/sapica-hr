import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/api-errors';
import { sendReviewRequestEmail } from '@/lib/email-sequences';
import type { User } from '@/lib/types';

/**
 * POST /api/email/review-request
 * Send review request email after completed booking
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
      providerName, 
      serviceName,
      bookingId 
    }: {
      userId: string;
      petName: string;
      providerName: string;
      serviceName: string;
      bookingId: string;
    } = body;

    if (!userId || !petName || !bookingId) {
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

    const result = await sendReviewRequestEmail(user, {
      petName,
      providerName: providerName || 'Vaš čuvar',
      serviceName: serviceName || 'Usluga',
      bookingId,
    });

    if (!result.success) {
      return apiError({ 
        status: 500, 
        code: 'EMAIL_SEND_FAILED', 
        message: result.error || 'Failed to send review request email' 
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review request email error:', error);
    return apiError({ 
      status: 500, 
      code: 'INTERNAL_ERROR', 
      message: 'Failed to send review request' 
    });
  }
}
