# Password Reset Flow — Implementation Result

## Status: DONE

## Files Changed

| File | Change |
|------|--------|
| `lib/validations.ts` | Added `forgotPasswordSchema` and `resetPasswordSchema` with Croatian error messages |
| `app/prijava/login-form.tsx` | Added "Zaboravili ste lozinku?" link below password field |
| `app/zaboravljena-lozinka/page.tsx` | **New** — Forgot password page (metadata + Suspense wrapper) |
| `app/zaboravljena-lozinka/forgot-password-form.tsx` | **New** — Email input form with success confirmation state |
| `app/api/auth/forgot-password/route.ts` | **New** — API route: validates input, rate-limits (3/min), calls `resetPasswordForEmail`, prevents email enumeration |
| `app/nova-lozinka/page.tsx` | **New** — Reset password page (metadata + Suspense wrapper) |
| `app/nova-lozinka/reset-password-form.tsx` | **New** — New password + confirm form, calls `supabase.auth.updateUser()` with active recovery session |

## What Changed

### Flow
1. User clicks "Zaboravili ste lozinku?" on `/prijava`
2. Lands on `/zaboravljena-lozinka` — enters their email
3. `POST /api/auth/forgot-password` calls `supabase.auth.resetPasswordForEmail()` with redirect to `/api/auth/callback?next=/nova-lozinka`
4. Supabase sends a recovery email with a magic link
5. User clicks link → hits existing `/api/auth/callback` → exchanges code for recovery session → redirects to `/nova-lozinka`
6. On `/nova-lozinka`, user enters new password + confirmation
7. Client calls `supabase.auth.updateUser({ password })` using the active recovery session
8. Success screen with link back to login

### Security
- Rate limited: 3 requests per minute per IP on forgot-password endpoint
- No email enumeration: always returns success regardless of whether email exists
- Safe redirect validation via existing `safeRedirectPath()`
- Password minimum 6 characters, confirmation match required
- Recovery session handled entirely by Supabase (no custom tokens)

### UX
- All UI text in Croatian
- Consistent styling with existing login/registration pages
- Password visibility toggles
- Success confirmation screens with clear next steps
- "Back to login" navigation on all screens

## Required Environment / Dashboard Config

### Supabase Dashboard (required)
1. **Auth → URL Configuration → Redirect URLs**: Add your app's callback URL to the allowed list:
   - `https://petpark.hr/api/auth/callback` (production)
   - `http://localhost:3000/api/auth/callback` (development)
2. **Auth → Email Templates → Reset Password**: Supabase uses its default reset email template. You can customize it in the dashboard under Authentication → Email Templates → "Reset Password". The `{{ .ConfirmationURL }}` variable will point to your callback URL.

### Environment Variables (already in use)
- `NEXT_PUBLIC_SUPABASE_URL` — already configured
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — already configured
- `NEXT_PUBLIC_APP_URL` — used for building the redirect URL (falls back to `https://petpark.hr`)

## What Remains

- **Email template customization** (optional): The default Supabase reset email works, but you may want to customize it in the Supabase dashboard to match PetPark branding and use Croatian text.
- **Build note**: The build has a pre-existing error in `app/onboarding/provider/page.tsx` (missing `./provider-onboarding-form` component) — unrelated to this change.
