# Domain & SSL Setup - petpark.hr

## Overview
This document outlines the steps to configure the custom domain `petpark.hr` for the PetPark application hosted on Vercel.

## Prerequisites
- Domain registered at your domain registrar (e.g., Namecheap, GoDaddy, etc.)
- Vercel account with PetPark project deployed
- Access to domain registrar's DNS management panel

## Step 1: Vercel Custom Domain Configuration

### 1.1 Add Domain in Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select the PetPark project
3. Navigate to **Settings → Domains**
4. Click **"Add Domain"**
5. Enter `petpark.hr` and click **"Add"**

### 1.2 Domain Verification
Vercel will provide DNS records to verify domain ownership. You'll need to add these to your domain registrar:

**Recommended DNS Records:**
```
Type    Name            Value
-----   ------------    ------------------------------------
A       @               76.76.21.21
CNAME   www             cname.vercel-dns.com
```

## Step 2: DNS Configuration at Registrar

### 2.1 For Most Registrars (Namecheap, GoDaddy, etc.)
1. Log in to your domain registrar account
2. Navigate to **Domain Management → DNS Settings**
3. Add/Update the following records:

**A Record (Root Domain):**
```
Type: A
Host: @ (or leave blank for root)
Value: 76.76.21.21
TTL: Automatic (or 3600)
```

**CNAME Record (www subdomain):**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
TTL: Automatic (or 3600)
```

### 2.2 Optional: Redirect non-www to www
If you want `petpark.hr` to redirect to `www.petpark.hr`:
- Add URL Redirect record at registrar:
  ```
  Type: URL Redirect
  Host: @
  Value: https://www.petpark.hr
  Redirect Type: 301 (Permanent)
  ```

## Step 3: SSL Certificate (Automatic)

Vercel provides automatic SSL certificates via Let's Encrypt:

### 3.1 Automatic SSL Provisioning
- Once DNS records propagate (can take up to 24-48 hours)
- Vercel automatically requests and installs SSL certificate
- Certificate auto-renews every 90 days

### 3.2 Verify SSL Status
1. After DNS propagation, check: `https://petpark.hr`
2. SSL should be active automatically
3. Verify certificate in browser (padlock icon)

## Step 4: Testing & Validation

### 4.1 DNS Propagation Check
Use tools to verify DNS propagation:
```bash
# Check A record
dig petpark.hr A +short

# Check CNAME record  
dig www.petpark.hr CNAME +short

# Expected output:
# 76.76.21.21
# cname.vercel-dns.com
```

### 4.2 SSL Certificate Check
```bash
# Check SSL certificate
openssl s_client -connect petpark.hr:443 -servername petpark.hr 2>/dev/null | openssl x509 -noout -dates

# Or use online tools:
# - https://www.ssllabs.com/ssltest/
# - https://decoder.link/sslchecker/petpark.hr
```

### 4.3 HTTP/HTTPS Redirects
Verify proper redirects:
- `http://petpark.hr` → `https://petpark.hr` (301 redirect)
- `http://www.petpark.hr` → `https://www.petpark.hr` (301 redirect)

## Step 5: Vercel Project Configuration

### 5.1 Update `vercel.json`
Ensure `vercel.json` includes proper redirects:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "has": [
        {
          "type": "host",
          "value": "petpark.hr"
        }
      ],
      "destination": "https://www.petpark.hr/:path*",
      "permanent": true
    }
  ]
}
```

### 5.2 Environment Variables
Ensure production environment variables are set in Vercel:
- `NEXT_PUBLIC_SITE_URL=https://www.petpark.hr`
- `NEXT_PUBLIC_BASE_URL=https://www.petpark.hr`

## Step 6: Monitoring & Maintenance

### 6.1 SSL Certificate Monitoring
- Vercel automatically renews certificates
- Monitor certificate expiry in Vercel Dashboard → Domains
- Set up alerts for certificate issues

### 6.2 DNS Health Checks
Regularly verify DNS records:
```bash
# Monthly DNS check script
#!/bin/bash
DOMAIN="petpark.hr"
EXPECTED_IP="76.76.21.21"

CURRENT_IP=$(dig +short $DOMAIN)
if [ "$CURRENT_IP" != "$EXPECTED_IP" ]; then
  echo "ALERT: DNS mismatch for $DOMAIN"
  echo "Expected: $EXPECTED_IP"
  echo "Got: $CURRENT_IP"
  # Send alert via Slack/webhook
fi
```

## Troubleshooting

### Issue: DNS Not Propagating
**Solution:**
- Wait 24-48 hours for full propagation
- Clear local DNS cache: `sudo dscacheutil -flushcache` (macOS)
- Use different DNS servers (Google: 8.8.8.8, Cloudflare: 1.1.1.1)

### Issue: SSL Certificate Not Issued
**Solution:**
- Verify DNS records are correct
- Check Vercel Domains page for errors
- Contact Vercel support if issue persists > 48 hours

### Issue: Mixed Content Warnings
**Solution:**
- Ensure all assets (images, scripts) use HTTPS URLs
- Update `next.config.ts` with proper asset prefixes
- Use relative URLs for internal assets

## References
- [Vercel Custom Domains Documentation](https://vercel.com/docs/projects/domains)
- [Vercel SSL Documentation](https://vercel.com/docs/security/ssl)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)

---

*Last Updated: 2026-04-07*  
*Next Review: After domain configuration*