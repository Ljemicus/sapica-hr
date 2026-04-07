# Security Checklist - PetPark Production

## Overview
This checklist ensures all security measures are properly configured before production launch.

## 1. Security Headers (✅ Configured in next.config.ts)

### Current Configuration:
- ✅ `X-Frame-Options: DENY` - Prevents clickjacking
- ✅ `X-Content-Type-Options: nosniff` - Prevents MIME type sniffing
- ✅ `Referrer-Policy: strict-origin-when-cross-origin` - Controls referrer information
- ✅ `X-DNS-Prefetch-Control: on` - Enables DNS prefetching
- ✅ `Permissions-Policy: camera=(), microphone=(), geolocation=()` - Restricts sensitive APIs
- ✅ `Strict-Transport-Security: max-age=31536000; includeSubDomains` - Enforces HTTPS
- ✅ `Content-Security-Policy` - Comprehensive CSP configured

### Verification:
```bash
# Test headers on localhost
curl -I http://localhost:3000 | grep -i "x-"

# Test headers on production
curl -I https://petpark.hr | grep -i "x-"
```

## 2. Content Security Policy (CSP)

### Current CSP (from next.config.ts):
```javascript
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://plausible.io",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://plausible.io https://api.resend.com https://api.stripe.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "form-action 'self' https://checkout.stripe.com",
  "upgrade-insecure-requests",
].join('; ');
```

### CSP Validation:
- [ ] Test CSP with Google Analytics (when added)
- [ ] Test CSP with Cloudinary (if used for images)
- [ ] Test CSP with any third-party embeds

### CSP Testing Tools:
- https://csp-evaluator.withgoogle.com/
- Browser DevTools → Console (look for CSP violations)

## 3. CORS Configuration

### Supabase CORS:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add production domains:
   - `https://www.petpark.hr`
   - `https://petpark.hr`
3. Remove development URLs if present

### API CORS:
- ✅ Next.js API routes inherit CSP settings
- ✅ External APIs (Stripe, Resend) configured with proper origins

### Verification:
```javascript
// Test CORS from browser console
fetch('https://hmtlcgjcxhjecsbmmxol.supabase.co/auth/v1/user', {
  headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
})
.then(res => console.log('CORS headers:', res.headers.get('access-control-allow-origin')))
.catch(err => console.error('CORS error:', err));
```

## 4. Rate Limiting

### Current Implementation:
Check if rate limiting is implemented for:
- [ ] Authentication endpoints (`/api/auth/*`)
- [ ] API endpoints (`/api/*`)
- [ ] Contact forms
- [ ] Password reset

### Recommended Rate Limits:
- Authentication: 5 requests/minute per IP
- API: 60 requests/minute per IP  
- Public endpoints: 100 requests/minute per IP

### Implementation Options:
1. Vercel Edge Middleware with Upstash Redis
2. Next.js API routes with `lru-cache`
3. External service like Cloudflare

## 5. Database Security

### Supabase Security:
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Service role key stored securely (not in client code)
- [ ] Anonymous key has minimal permissions
- [ ] Regular security audit of RLS policies

### RLS Policy Check:
```sql
-- Check RLS status on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

## 6. Authentication & Session Security

### Current Setup:
- ✅ Supabase Auth with secure cookies
- ✅ Password hashing (bcrypt via Supabase)
- ✅ Session timeout configuration

### Verification:
- [ ] Session timeout set appropriately (e.g., 7 days for "remember me", 1 hour otherwise)
- [ ] Secure cookie flags: `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Password policy enforcement (min length, complexity)

## 7. Payment Security (Stripe)

### Configuration Check:
- [ ] Using Stripe Elements (not custom card forms)
- [ ] PCI compliance maintained
- [ ] Webhook signature verification implemented
- [ ] No sensitive data logged

### Stripe Security Checklist:
```javascript
// Verify webhook signature in all webhook handlers
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  // Handle event
});
```

## 8. Environment Variables Security

### Current Status (from env-validation):
- ✅ Most variables set
- ⚠️ Missing: `SUPABASE_SERVICE_ROLE_KEY` (critical)
- ⚠️ Missing: Sentry DSN (recommended)

### Security Rules:
- [ ] No secrets in client-side code
- [ ] Secrets stored in Vercel Environment Variables
- [ ] `.env.local` in `.gitignore`
- [ ] Different keys for development/production

## 9. Dependency Security

### Regular Checks:
```bash
# Check for vulnerable dependencies
npm audit

# Check for outdated packages  
npm outdated

# Use dependabot or similar for automatic updates
```

### Critical Dependencies to Audit:
- `next` - Framework
- `@supabase/supabase-js` - Database
- `stripe` - Payments
- `react` / `react-dom` - UI library

## 10. Monitoring & Alerting

### Error Tracking:
- [ ] Sentry configured (optional but recommended)
- [ ] Error boundaries in React components
- [ ] Unhandled promise rejection tracking

### Security Monitoring:
- [ ] Failed login attempts logged
- [ ] Suspicious activity detection
- [ ] Regular security log review

## 11. GDPR & Privacy Compliance

### Current Implementation:
- ✅ Cookie consent banner (when GA added)
- ✅ Privacy policy page
- ✅ Data minimization principles
- ✅ Right to erasure procedures

### Verification:
- [ ] Cookie consent works without blocking essential functionality
- [ ] Analytics only track with consent
- [ ] No unnecessary personal data collection
- [ ] Data retention policies documented

## 12. Infrastructure Security

### Vercel Security:
- [ ] Automatic HTTPS enabled
- [ ] DDoS protection active
- [ ] IP filtering if needed
- [ ] Environment variables encrypted

### Domain Security:
- [ ] DNSSEC enabled (if supported by registrar)
- [ ] Domain lock enabled
- [ ] WHOIS privacy enabled

## 13. Regular Security Tasks

### Weekly:
- [ ] Review security logs
- [ ] Check dependency vulnerabilities
- [ ] Monitor failed login attempts

### Monthly:
- [ ] Security header audit
- [ ] CSP policy review
- [ ] Access control review
- [ ] Backup restoration test

### Quarterly:
- [ ] Full security audit
- [ ] Penetration testing consideration
- [ ] Security training review

## 14. Incident Response Plan

### Preparation:
- [ ] Contact list for security incidents
- [ ] Communication plan (Slack channel, email)
- [ ] Rollback procedures documented

### Response Steps:
1. **Identify** - Detect and confirm incident
2. **Contain** - Isolate affected systems
3. **Eradicate** - Remove threat
4. **Recover** - Restore services
5. **Learn** - Post-incident analysis

## Testing & Validation

### Automated Tests:
```bash
# Run security-focused tests
npm test -- --testPathPattern="security"

# Check headers
npm run check-headers
```

### Manual Testing:
1. Try to bypass authentication
2. Test SQL injection on forms
3. Check XSS vulnerabilities
4. Verify file upload restrictions
5. Test rate limiting

## Resources

### Tools:
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [Security Headers](https://securityheaders.com/)
- [Snyk](https://snyk.io/) for dependency scanning
- [OWASP ZAP](https://www.zaproxy.org/) for penetration testing

### Documentation:
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/security)
- [Supabase Security](https://supabase.com/docs/guides/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

---

*Last Updated: 2026-04-07*  
*Next Review: Before production launch*