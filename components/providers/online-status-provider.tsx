'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useOnlineStatus } from '@/lib/hooks/use-online-status';

interface OnlineStatusContextType {
  // Context is just for organization, actual logic is in the hook
}

const OnlineStatusContext = createContext<OnlineStatusContextType | null>(null);

export function useOnlineStatusContext() {
  const context = useContext(OnlineStatusContext);
  if (!context) {
    throw new Error('useOnlineStatusContext must be used within OnlineStatusProvider');
  }
  return context;
}

interface OnlineStatusProviderProps {
  children: ReactNode;
  userId?: string;
}

export function OnlineStatusProvider({ children, userId }: OnlineStatusProviderProps) {
  useOnlineStatus(userId);

  return (
    <OnlineStatusContext.Provider value={{}}>
      {children}
    </OnlineStatusContext.Provider>
  );
}
