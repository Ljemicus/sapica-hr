import { init } from '@sentry/nextjs';

init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: process.env.NODE_ENV === 'development',
  
  // Enable session replay for debugging user issues (sample rate in production)
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Filter out sensitive data
  beforeSend(event) {
    // Remove potentially sensitive query parameters
    if (event.request?.url) {
      try {
        const url = new URL(event.request.url);
        const sensitiveParams = ['token', 'password', 'secret', 'api_key', 'apikey'];
        sensitiveParams.forEach(param => {
          if (url.searchParams.has(param)) {
            url.searchParams.set(param, '[FILTERED]');
          }
        });
        event.request.url = url.toString();
      } catch {
        // Ignore URL parsing errors
      }
    }
    
    // Remove user email from events in non-production environments
    if (process.env.NODE_ENV !== 'production' && event.user?.email) {
      event.user.email = '[FILTERED]';
    }
    
    return event;
  },
  
  // Ignore common browser extension errors
  ignoreErrors: [
    // Chrome/Firefox extensions
    /^Non-Error promise rejection captured with value: undefined$/,
    /^Non-Error promise rejection captured with value: null$/,
    // Common browser errors
    /top.GLOBALS/,
    /originalCreateNotification/,
    /canvas.contentDocument/,
    /MyApp_RemoveAllHighlights/,
    /atomicFindClose/,
    // Facebook SDK
    /fb_xd_fragment/,
    // NS errors
    /NS_ERROR_/,
    // Network errors
    /Network Error/i,
    /Failed to fetch/i,
  ],
  
  // Deny URLs from browser extensions
  denyUrls: [
    // Chrome extensions
    /^chrome-extension:\/\//i,
    /^chrome:\/\//i,
    // Firefox extensions
    /^moz-extension:\/\//i,
    // Edge extensions
    /^ms-browser-extension:\/\//i,
  ],
});
