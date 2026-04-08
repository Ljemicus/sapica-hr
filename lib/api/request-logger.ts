/**
 * Request logging middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { appLogger } from './logger';

export interface RequestLog {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: string;
  ip?: string;
  userAgent?: string;
  userId?: string;
  requestId?: string;
  error?: string;
}

export class RequestLogger {
  private static readonly LOG_LEVELS = {
    '2xx': 'info',
    '3xx': 'info',
    '4xx': 'warn',
    '5xx': 'error',
  } as const;
  
  /**
   * Middleware function for logging requests
   */
  static middleware(request: NextRequest, response: NextResponse): void {
    const startTime = Date.now();
    
    // Extract request information
    const method = request.method;
    const url = request.nextUrl.pathname;
    const status = response.status;
    const userAgent = request.headers.get('user-agent') || undefined;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
    
    // Generate request ID if not present
    const requestId = request.headers.get('x-request-id') || this.generateRequestId();
    
    // Add request ID to response headers
    response.headers.set('x-request-id', requestId);
    
    // Calculate duration
    const duration = Date.now() - startTime;
    
    // Determine log level based on status code
    const statusCategory = Math.floor(status / 100);
    const logLevel = this.LOG_LEVELS[`${statusCategory}xx` as keyof typeof this.LOG_LEVELS] || 'info';
    
    // Create log entry
    const logEntry: RequestLog = {
      method,
      url,
      status,
      duration,
      timestamp: new Date().toISOString(),
      ip,
      userAgent,
      requestId,
    };
    
    // Extract user ID from request if available
    const userId = this.extractUserId(request);
    if (userId) {
      logEntry.userId = userId;
    }
    
    // Log based on level
    switch (logLevel) {
      case 'info':
        appLogger.info('Request completed', logEntry);
        break;
      case 'warn':
        appLogger.warn('Request completed with client error', logEntry);
        break;
      case 'error':
        appLogger.error('Request completed with server error', logEntry);
        break;
    }
    
    // Log slow requests
    if (duration > 1000) { // More than 1 second
      appLogger.warn('Slow request detected', {
        ...logEntry,
        threshold: 1000,
      });
    }
    
    // Log 5xx errors with additional context
    if (status >= 500) {
      appLogger.error('Server error occurred', {
        ...logEntry,
        error: response.statusText,
      });
    }
  }
  
  /**
   * Generate a unique request ID
   */
  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Extract user ID from request (e.g., from JWT, session, etc.)
   */
  private static extractUserId(request: NextRequest): string | undefined {
    // Check for JWT in Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      // In a real implementation, you would decode the JWT
      // and extract the user ID from it
      // For now, return undefined
      return undefined;
    }
    
    // Check for user ID in cookies
    const sessionCookie = request.cookies.get('session');
    if (sessionCookie) {
      // In a real implementation, you would decode the session
      // and extract the user ID from it
      // For now, return undefined
      return undefined;
    }
    
    return undefined;
  }
  
  /**
   * Log API request (for use in API routes)
   */
  static logApiRequest(
    req: Request,
    res: Response,
    startTime: number,
    userId?: string
  ): void {
    const duration = Date.now() - startTime;
    const url = new URL(req.url);
    
    const logEntry: RequestLog = {
      method: req.method,
      url: url.pathname,
      status: res.status,
      duration,
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
      userId,
      requestId: req.headers.get('x-request-id') || this.generateRequestId(),
    };
    
    // Determine log level
    const statusCategory = Math.floor(res.status / 100);
    const logLevel = this.LOG_LEVELS[`${statusCategory}xx` as keyof typeof this.LOG_LEVELS] || 'info';
    
    // Log based on level
    switch (logLevel) {
      case 'info':
        appLogger.info('API request completed', logEntry);
        break;
      case 'warn':
        appLogger.warn('API request completed with client error', logEntry);
        break;
      case 'error':
        appLogger.error('API request completed with server error', logEntry);
        break;
    }
  }
  
  /**
   * Create middleware wrapper for Next.js API routes
   */
  static createMiddleware() {
    return function requestLoggerMiddleware(
      req: Request,
      res: Response & { end: (...args: unknown[]) => unknown },
      next?: () => void
    ) {
      const startTime = Date.now();
      
      // Store original end method
      const originalEnd = res.end;
      
      // Override end method to log after response is sent
      res.end = function(...args: unknown[]) {
        // Call original end method
        const result = originalEnd.apply(this, args);
        
        // Log the request
        RequestLogger.logApiRequest(req, res as Response, startTime);
        
        return result;
      };
      
      if (next) {
        next();
      }
    };
  }
  
  /**
   * Get request statistics
   */
  static getStats(): {
    totalRequests: number;
    averageDuration: number;
    errorRate: number;
    statusCodes: Record<number, number>;
  } {
    // In a real implementation, this would query a database
    // or monitoring service for request statistics
    // For now, return mock data
    return {
      totalRequests: 0,
      averageDuration: 0,
      errorRate: 0,
      statusCodes: {},
    };
  }
  
  /**
   * Export logs for analysis
   */
  static exportLogs(
    startDate: Date,
    endDate: Date,
    filters?: {
      status?: number;
      method?: string;
      userId?: string;
    }
  ): RequestLog[] {
    // In a real implementation, this would query a database
    // or log storage service
    // For now, return empty array
    return [];
  }
}

// Default request logger instance
export const requestLogger = RequestLogger;

// Helper function for API routes
export function withRequestLogging<T>(
  handler: (req: Request, ...args: any[]) => Promise<T>
): (req: Request, ...args: any[]) => Promise<T> {
  return async function loggedHandler(req: Request, ...args: any[]) {
    const startTime = Date.now();
    
    try {
      const result = await handler(req, ...args);
      
      // Create a mock response for logging
      const mockRes = new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      
      RequestLogger.logApiRequest(req, mockRes, startTime);
      
      return result;
    } catch (error) {
      // Create error response for logging
      const errorRes = new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      
      RequestLogger.logApiRequest(req, errorRes, startTime);
      
      throw error;
    }
  };
}