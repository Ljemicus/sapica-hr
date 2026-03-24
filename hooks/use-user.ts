'use client';

import { useEffect, useState, useCallback } from 'react';
import { getMockUserIdClient } from '@/lib/mock-auth-client';
import { mockUsers } from '@/lib/mock-data';
import type { User } from '@/lib/types';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUser = useCallback(() => {
    const userId = getMockUserIdClient();
    if (userId) {
      const found = mockUsers.find(u => u.id === userId) || null;
      setUser(found);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkUser();

    // Listen for custom event (fired on login/logout)
    const handler = () => checkUser();
    window.addEventListener('mock-auth-change', handler);
    return () => window.removeEventListener('mock-auth-change', handler);
  }, [checkUser]);

  return { user, loading };
}
