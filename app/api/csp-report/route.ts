import { NextResponse } from 'next/server';

// CSP Report URI endpoint
// Receives CSP violation reports from browsers

interface CSPReport {
  'document-uri'?: string;
  'referrer'?: string;
  'blocked-uri'?: string;
  'violated-directive'?: string;
  'original-policy'?: string;
  'disposition'?: string;
  'script-sample'?: string;
  'status-code'?: number;
  'line-number'?: number;
  'column-number'?: number;
  'source-file'?: string;
}

interface CSPReportBody {
  'csp-report'?: CSPReport;
}

export async function POST(request: Request) {
  try {
    const body: CSPReportBody = await request.json();
    const report = body['csp-report'];

    if (!report) {
      return NextResponse.json({ error: 'Invalid CSP report' }, { status: 400 });
    }

    // Log CSP violation
    const violation = {
      timestamp: new Date().toISOString(),
      documentUri: report['document-uri'],
      blockedUri: report['blocked-uri'],
      violatedDirective: report['violated-directive'],
      sourceFile: report['source-file'],
      lineNumber: report['line-number'],
      scriptSample: report['script-sample']?.slice(0, 100), // Truncate long samples
    };

    // Log to console (in production, send to Sentry or logging service)
    if (process.env.NODE_ENV === 'production') {
      console.warn('[CSP Violation]', JSON.stringify(violation));
      
      // Send to Sentry if configured
      if (typeof process.env.SENTRY_DSN !== 'undefined') {
        try {
          const { captureMessage } = await import('@sentry/nextjs');
          captureMessage(`CSP Violation: ${violation.violatedDirective}`, {
            level: 'warning',
            extra: violation,
          });
        } catch {
          // Sentry not available
        }
      }
    } else {
      console.log('[CSP Violation - Development]', violation);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing CSP report:', error);
    return NextResponse.json({ error: 'Failed to process report' }, { status: 400 });
  }
}

// Also accept GET for simple health checks
export async function GET() {
  return NextResponse.json({ 
    endpoint: '/api/csp-report',
    description: 'CSP violation reporting endpoint',
    method: 'POST',
    format: 'application/csp-report'
  });
}
