import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { appLogger } from '@/lib/logger';

export interface SessionConfig {
  timeoutHours: number;
  refreshIntervalMinutes: number;
}

// Default configuration
export const defaultSessionConfig: SessionConfig = {
  timeoutHours: parseInt(process.env.SESSION_TIMEOUT_HOURS || '24', 10),
  refreshIntervalMinutes: parseInt(process.env.SESSION_REFRESH_INTERVAL_MINUTES || '30', 10),
};

// Extended session type with created_at
interface SessionWithMetadata {
  user: { id: string };
  created_at: string;
}

/**
 * Calculate session age in hours
 */
export function getSessionAgeHours(createdAt: string | Date): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  return diffMs / (1000 * 60 * 60);
}

/**
 * Check if session has expired based on configured timeout
 */
export function isSessionExpired(
  createdAt: string | Date,
  config: Partial<SessionConfig> = {}
): boolean {
  const mergedConfig = { ...defaultSessionConfig, ...config };
  const ageHours = getSessionAgeHours(createdAt);
  return ageHours >= mergedConfig.timeoutHours;
}

/**
 * Middleware to check session timeout
 * Returns 401 if session has expired
 */
export async function sessionTimeoutMiddleware(
  request: NextRequest,
  config: Partial<SessionConfig> = {}
): Promise<NextResponse | null> {
  const mergedConfig = { ...defaultSessionConfig, ...config };
  
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return null; // No session to check
    }

    // Cast to extended type to access created_at
    const sessionWithMeta = session as unknown as SessionWithMetadata;
    
    // Check if session has expired
    if (isSessionExpired(sessionWithMeta.created_at, mergedConfig)) {
      // Sign out the user
      await supabase.auth.signOut();
      
      appLogger.info('auth', 'Session expired - auto logout', {
        userId: sessionWithMeta.user.id,
        sessionAge: getSessionAgeHours(sessionWithMeta.created_at),
      });

      // Return 401 response
      return NextResponse.json(
        { 
          error: 'Session expired',
          message: 'Vaša sesija je istekla. Molimo prijavite se ponovno.',
          code: 'SESSION_EXPIRED'
        },
        { status: 401 }
      );
    }

    return null; // Session is valid
  } catch (error) {
    appLogger.error('auth', 'Error checking session timeout', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return null;
  }
}

/**
 * Server action to check session validity
 * Returns true if session is still valid
 */
export async function checkSessionValidity(
  config: Partial<SessionConfig> = {}
): Promise<{ valid: boolean; expiresAt?: Date; message?: string }> {
  const mergedConfig = { ...defaultSessionConfig, ...config };
  
  try {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { valid: false, message: 'Nema aktivne sesije' };
    }

    // Cast to extended type to access created_at
    const sessionWithMeta = session as unknown as SessionWithMetadata;
    const ageHours = getSessionAgeHours(sessionWithMeta.created_at);
    
    if (ageHours >= mergedConfig.timeoutHours) {
      await supabase.auth.signOut();
      return { 
        valid: false, 
        message: 'Vaša sesija je istekla. Molimo prijavite se ponovno.' 
      };
    }

    // Calculate when session will expire
    const createdAt = new Date(sessionWithMeta.created_at);
    const expiresAt = new Date(createdAt.getTime() + mergedConfig.timeoutHours * 60 * 60 * 1000);

    return {
      valid: true,
      expiresAt,
    };
  } catch (error) {
    appLogger.error('auth', 'Error checking session validity', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { valid: false, message: 'Greška pri provjeri sesije' };
  }
}

/**
 * Get remaining session time in hours
 */
export function getRemainingSessionTime(
  createdAt: string | Date,
  config: Partial<SessionConfig> = {}
): number {
  const mergedConfig = { ...defaultSessionConfig, ...config };
  const ageHours = getSessionAgeHours(createdAt);
  const remaining = mergedConfig.timeoutHours - ageHours;
  return Math.max(0, remaining);
}
