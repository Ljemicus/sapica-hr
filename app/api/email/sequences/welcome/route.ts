import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiError } from '@/lib/api-errors';
import { scheduleWelcomeSequence, sendBookingConfirmationEmail, sendReviewRequestEmail } from '@/lib/email-sequences';
import type { User } from '@/lib/types';

type EmailRole = 'owner' | 'sitter' | 'groomer' | 'trainer' | 'breeder' | 'rescue';

/**
 * POST /api/email/sequences/welcome
 * Trigger welcome sequence for a new user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      return apiError({ status: 401, code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const body = await request.json();
    const { userId, role }: { userId: string; role: EmailRole } = body;

    if (!userId || !role) {
      return apiError({ 
        status: 400, 
        code: 'INVALID_REQUEST', 
        message: 'Missing userId or role' 
      });
    }

    // Only allow users to trigger their own welcome sequence, or admins
    if (userId !== authUser.id) {
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', authUser.id)
        .single();
      
      if (currentUser?.role !== 'admin') {
        return apiError({ status: 403, code: 'FORBIDDEN', message: 'Insufficient permissions' });
      }
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

    // Schedule welcome sequence
    await scheduleWelcomeSequence(user, role as Parameters<typeof scheduleWelcomeSequence>[1]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Welcome sequence error:', error);
    return apiError({ 
      status: 500, 
      code: 'INTERNAL_ERROR', 
      message: 'Failed to schedule welcome sequence' 
    });
  }
}
