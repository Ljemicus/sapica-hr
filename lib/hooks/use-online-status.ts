'use client';

import { useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

const HEARTBEAT_INTERVAL = 60000; // 1 minute
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to track user online status
 * Updates user_sessions table periodically while user is active
 */
export function useOnlineStatus(userId: string | undefined) {
  const supabase = createClient();

  const updateActivity = useCallback(async () => {
    if (!userId) return;

    try {
      await supabase
        .from('user_sessions')
        .upsert(
          { user_id: userId, last_active_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        );
    } catch {
      // Silently fail - not critical
    }
  }, [userId, supabase]);

  useEffect(() => {
    if (!userId) return;

    // Initial activity update
    updateActivity();

    // Set up heartbeat interval
    const interval = setInterval(updateActivity, HEARTBEAT_INTERVAL);

    // Update on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    let lastActivity = Date.now();

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        updateActivity();
      }
      lastActivity = now;
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [userId, updateActivity]);
}
