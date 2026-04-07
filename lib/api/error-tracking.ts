/**
 * Error tracking integration (Sentry, etc.)
 */

import { appLogger } from './logger';

export interface ErrorTrackingConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  enabled: boolean;
}

export class ErrorTracker {
  private config: ErrorTrackingConfig;
  
  constructor(config: ErrorTrackingConfig) {
    this.config = config;
  }
  
  captureError(error: Error, context?: any): void {
    if (!this.config.enabled) {
      return;
    }
    
    // In a real implementation, this would send to Sentry/other service
    appLogger.error('Error captured', {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      environment: this.config.environment,
      release: this.config.release,
    });
    
    // Log to console for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', error, context);
    }
  }
  
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: any): void {
    if (!this.config.enabled) {
      return;
    }
    
    appLogger[level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'info'](message, context);
  }
  
  setUser(user: { id: string; email?: string; username?: string }): void {
    if (!this.config.enabled) {
      return;
    }
    
    // In a real implementation, this would set user context in error tracking service
    appLogger.info('User context set for error tracking', { user });
  }
  
  clearUser(): void {
    if (!this.config.enabled) {
      return;
    }
    
    appLogger.info('User context cleared for error tracking');
  }
}

// Default error tracker (disabled by default)
export const errorTracker = new ErrorTracker({
  enabled: process.env.NEXT_PUBLIC_ERROR_TRACKING_ENABLED === 'true',
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,
});

// Error boundary for React components
export function withErrorTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  // In a real implementation, this would wrap with error boundary
  // For now, just return the component
  return Component;
}

// Hook for error tracking in React components
export function useErrorTracking() {
  return {
    captureError: (error: Error, context?: any) => errorTracker.captureError(error, context),
    captureMessage: (message: string, level?: 'info' | 'warning' | 'error', context?: any) =>
      errorTracker.captureMessage(message, level, context),
    setUser: (user: { id: string; email?: string; username?: string }) =>
      errorTracker.setUser(user),
    clearUser: () => errorTracker.clearUser(),
  };
}

// Initialize error tracking
export function initErrorTracking(config?: Partial<ErrorTrackingConfig>): void {
  if (config) {
    Object.assign(errorTracker, config);
  }
  
  if (errorTracker.config.enabled && errorTracker.config.dsn) {
    appLogger.info('Error tracking initialized', {
      environment: errorTracker.config.environment,
      release: errorTracker.config.release,
    });
  }
}