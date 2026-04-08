# PetPark Environment Variables

## Required Variables

### Supabase (Database & Auth)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for client | Yes | `eyJhbG...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only) | Yes | `eyJhbG...` |

### Stripe (Payments)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes | `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key (server only) | Yes | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook endpoint secret | Yes | `whsec_...` |

### Sentry (Error Tracking)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `SENTRY_DSN` | Sentry project DSN | Recommended | `https://...@sentry.io/...` |
| `SENTRY_ORG` | Sentry organization slug | For source maps | `petpark` |
| `SENTRY_PROJECT` | Sentry project slug | For source maps | `petpark-web` |
| `SENTRY_AUTH_TOKEN` | Auth token for source maps | CI only | `sntrys_...` |

### Upstash Redis (Rate Limiting)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `UPSTASH_REDIS_REST_URL` | Redis REST URL | Recommended | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST token | Recommended | `AZ...` |

### Email (Resend)
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `RESEND_API_KEY` | Resend API key | For emails | `re_...` |
| `EMAIL_FROM` | Default sender address | For emails | `noreply@petpark.hr` |

### Application
| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Production URL | Yes | `https://petpark.hr` |
| `NEXT_PUBLIC_APP_NAME` | App name | No | `PetPark` |
| `NODE_ENV` | Environment | Auto | `production` |

## Optional Variables

### Feature Flags
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_ENABLE_ALL_FEATURES` | Enable all features (dev) | `false` |

### Analytics
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible analytics domain | - |
| `NEXT_PUBLIC_ANALYTICS_ENDPOINT` | Custom analytics endpoint | - |

### Cloudinary (Image Uploads)
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name | For uploads |
| `CLOUDINARY_API_KEY` | API key | For uploads |
| `CLOUDINARY_API_SECRET` | API secret | For uploads |

### SMS Notifications (Optional)
| Variable | Description |
|----------|-------------|
| `SMS_PROVIDER_API_KEY` | SMS provider key |
| `SMS_FROM_NUMBER` | Sender number |

## Local Development

Create `.env.local` file:

```bash
# Supabase (from Supabase dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe (test keys from Stripe dashboard)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Sentry (optional for local)
SENTRY_DSN=

# Upstash (optional - rate limiting won't work without it)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Production Environment

Set in Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Mark sensitive variables as "Secret"
4. Deploy to apply changes

## Security Notes

- **Never commit `.env.local`** - it's in `.gitignore`
- **Server-only variables** (no `NEXT_PUBLIC_` prefix) are never exposed to client
- **Rotate keys regularly** - especially Stripe and Supabase service keys
- **Use different keys** for staging and production
- **Monitor key usage** in respective dashboards

## Validation

Run validation script:
```bash
npm run validate:env
```

This checks all required variables are set and valid.
