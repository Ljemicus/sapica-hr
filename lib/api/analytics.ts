/**
 * Analytics integration
 */

import { appLogger } from './logger';

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
}

export class Analytics {
  public config: AnalyticsConfig;
  private queue: AnalyticsEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  
  constructor(config: AnalyticsConfig) {
    this.config = config;
    
    if (config.enabled) {
      // Start periodic flush
      this.flushInterval = setInterval(() => this.flush(), 30000); // Every 30 seconds
    }
  }
  
  track(event: AnalyticsEvent): void {
    if (!this.config.enabled) {
      return;
    }
    
    const fullEvent: AnalyticsEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    
    this.queue.push(fullEvent);
    
    // Log for development
    if (process.env.NODE_ENV === 'development') {
      appLogger.debug('Analytics event tracked', fullEvent);
    }
    
    // Auto-flush if queue gets too large
    if (this.queue.length >= 100) {
      this.flush();
    }
  }
  
  identify(userId: string, traits?: Record<string, any>): void {
    if (!this.config.enabled) {
      return;
    }
    
    this.track({
      name: 'identify',
      userId,
      properties: traits,
    });
  }
  
  page(name: string, properties?: Record<string, any>): void {
    if (!this.config.enabled) {
      return;
    }
    
    this.track({
      name: 'page_view',
      properties: {
        page_name: name,
        ...properties,
      },
    });
  }
  
  async flush(): Promise<void> {
    if (this.queue.length === 0 || !this.config.enabled) {
      return;
    }
    
    const events = [...this.queue];
    this.queue = [];
    
    try {
      if (this.config.endpoint && this.config.apiKey) {
        // Send to analytics service
        await fetch(this.config.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
          body: JSON.stringify({ events }),
        });
      }
      
      appLogger.debug(`Flushed ${events.length} analytics events`);
    } catch (error) {
      appLogger.error('Failed to flush analytics events', { error });
      // Re-add events to queue for retry
      this.queue.unshift(...events);
    }
  }
  
  dispose(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Final flush
    this.flush().catch(error => {
      appLogger.error('Error during final analytics flush', { error });
    });
  }
}

// Default analytics instance
export const analytics = new Analytics({
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
  endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
});

// Hook for React components
export function useAnalytics() {
  return {
    track: (event: AnalyticsEvent) => analytics.track(event),
    identify: (userId: string, traits?: Record<string, any>) => analytics.identify(userId, traits),
    page: (name: string, properties?: Record<string, any>) => analytics.page(name, properties),
  };
}

// Common events
export const EVENTS = {
  // User events
  SIGNUP: 'user_signup',
  LOGIN: 'user_login',
  LOGOUT: 'user_logout',
  PROFILE_UPDATE: 'user_profile_update',
  
  // Pet events
  PET_ADDED: 'pet_added',
  PET_UPDATED: 'pet_updated',
  PET_REMOVED: 'pet_remed',
  
  // Sitter events
  SITTER_PROFILE_CREATED: 'sitter_profile_created',
  SITTER_PROFILE_UPDATED: 'sitter_profile_updated',
  SITTER_SEARCH: 'sitter_search',
  
  // Booking events
  BOOKING_CREATED: 'booking_created',
  BOOKING_ACCEPTED: 'booking_accepted',
  BOOKING_REJECTED: 'booking_rejected',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_CANCELLED: 'booking_cancelled',
  
  // Payment events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_SUCCESSFUL: 'payment_successful',
  PAYMENT_FAILED: 'payment_failed',
  
  // Review events
  REVIEW_SUBMITTED: 'review_submitted',
  REVIEW_UPDATED: 'review_updated',
  
  // Message events
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
  
  // Error events
  ERROR_OCCURRED: 'error_occurred',
  
  // Performance events
  PAGE_LOAD: 'page_load',
  API_CALL: 'api_call',
};

// Initialize analytics
export function initAnalytics(config?: Partial<AnalyticsConfig>): void {
  if (config) {
    Object.assign(analytics.config, config);
  }
  
  if (analytics.config.enabled) {
    appLogger.info('Analytics initialized', {
      endpoint: analytics.config.endpoint ? 'configured' : 'not configured',
    });
  }
}

// Auto-flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    analytics.flush().catch(error => {
      console.error('Failed to flush analytics on page unload:', error);
    });
  });
}