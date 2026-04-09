'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Mail, User, MapPin, Dog, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/shared/image-upload';
import { createClient } from '@/lib/supabase/client';
import { getAuthCallbackUrl, safeRedirectPath } from '@/lib/auth-redirect';
import { useLanguage } from '@/lib/i18n/context';
import { translateFormError } from '@/lib/i18n/form-errors';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { CITIES } from '@/lib/types';
import { toast } from 'sonner';

function PawLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 512 512" fill="none">
      <path d="M256 390 C 150 310 90 230 130 170 C 170 110 230 130 256 180 C 282 130 342 110 382 170 C 422 230 362 310 256 390Z" fill="#FFB347"/>
      <ellipse cx="256" cy="290" rx="40" ry="35" fill="#14b8a6"/>
      <ellipse cx="225" cy="245" rx="16" ry="20" fill="#14b8a6" transform="rotate(-15 225 245)"/>
      <ellipse cx="256" cy="235" rx="15" ry="18" fill="#14b8a6"/>
      <ellipse cx="287" cy="242" rx="15" ry="18" fill="#14b8a6" transform="rotate(10 287 242)"/>
      <ellipse cx="305" cy="262" rx="14" ry="17" fill="#14b8a6" transform="rotate(25 305 262)"/>
    </svg>
  );
}

export function RegisterForm() {
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as 'owner' | 'sitter' | null;
  const redirect = safeRedirectPath(searchParams.get('redirect'), '');
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole || undefined },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, avatar_url: avatarUrl }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(payload.error || (language === 'en' ? 'Registration failed' : 'Registracija nije uspjela'));
        setLoading(false);
        return;
      }

      if (payload.session) {
        toast.success(language === 'en' ? 'Registration successful!' : 'Registracija uspješna!');
        const target = redirect || (data.role === 'sitter' ? '/dashboard/sitter' : '/dashboard/vlasnik');
        router.push(target);
        router.refresh();
      } else {
        toast.success(language === 'en' ? 'Registration successful! Check your email to confirm your account.' : 'Registracija uspješna! Provjerite email za potvrdu.');
        const loginUrl = `/prijava${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
        router.push(loginUrl);
      }
    } catch {
      toast.error(language === 'en' ? 'Network error. Check your internet connection.' : 'Mrežna greška. Provjerite internetsku vezu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'apple' | 'facebook') => {
    setLoading(true);
    const target = redirect || (selectedRole === 'sitter' ? '/dashboard/sitter' : '/dashboard/vlasnik');
    const role = selectedRole === 'sitter' ? 'sitter' : 'owner';
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: getAuthCallbackUrl(target, role),
      },
    });

    if (error) {
      toast.error(language === 'en' ? `Could not continue with ${provider === 'google' ? 'Google' : provider === 'apple' ? 'Apple' : 'Facebook'}` : `Greška pri registraciji putem ${provider === 'google' ? 'Googlea' : provider === 'apple' ? 'Applea' : 'Facebooka'}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex">
      <div className="hidden lg:flex flex-1 organizations-hero-gradient items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.08]" />
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-white rounded-full opacity-10" />
        <div className="absolute top-10 -right-10 w-40 h-40 bg-white rounded-full opacity-10" />
        <div className="relative text-center text-white p-12 max-w-md">
          <PawLogo className="h-64 w-64 mx-auto mb-10 opacity-90" />
          <h2 className="text-3xl font-bold mb-4 font-[var(--font-heading)]">{language === 'en' ? <>Join <span className="text-white/90" translate="no">Pet</span><span className="text-white/70" translate="no">Park</span>!</> : <>Pridružite se <span className="text-white/90" translate="no">Pet</span><span className="text-white/70" translate="no">Parku</span>!</>}</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            {selectedRole === 'sitter'
              ? (language === 'en' ? 'Earn by doing what you love — offer services in your city and become part of our community.' : 'Zarađujte radeći ono što volite — pružajte usluge u svom gradu i postanite dio naše zajednice.')
              : (language === 'en' ? 'Find everything your pet needs in one place — boarding, grooming, training, and more.' : 'Pronađite sve za vašeg ljubimca na jednom mjestu — čuvanje, njega, školovanje i više.')}
          </p>
          <div className="mt-10 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold">{language === 'en' ? 'Free' : 'Besplatno'}</p>
              <p className="text-sm text-white/70">{language === 'en' ? 'Registration' : 'Registracija'}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">2 min</p>
              <p className="text-sm text-white/70">{language === 'en' ? 'Setup' : 'Postavljanje'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-warm-orange to-warm-peach shadow-lg shadow-warm-orange/20 mb-4 lg:hidden">
              <PawLogo className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-[var(--font-heading)]">{language === 'en' ? 'Register' : 'Registracija'}</h1>
            <p className="text-muted-foreground mt-2">{language === 'en' ? 'Create your ' : 'Kreirajte svoj '}<span className="text-warm-orange" translate="no">Pet</span><span className="text-warm-teal" translate="no">Park</span>{language === 'en' ? ' account' : ' račun'}</p>
          </div>

          <div className="space-y-2 mb-6 animate-fade-in-up delay-100">
            <Label className="text-sm font-medium">{language === 'en' ? 'I am...' : 'Ja sam...'}</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'owner')}
                className={`p-5 rounded-xl border-2 text-center transition-all ${
                  selectedRole === 'owner'
                    ? 'border-warm-orange bg-warm-orange/5 shadow-sm'
                    : 'border-border hover:border-warm-orange/30'
                }`}
              >
                <Dog className={`h-8 w-8 mx-auto mb-2 ${selectedRole === 'owner' ? 'text-warm-orange' : 'text-muted-foreground'}`} />
                <p className="font-semibold text-sm">{language === 'en' ? 'Pet owner' : 'Vlasnik ljubimca'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{language === 'en' ? 'Care, grooming, training, adoption and more' : 'Čuvanje, njega, školovanje, udomljavanje i više'}</p>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'sitter')}
                className={`p-5 rounded-xl border-2 text-center transition-all ${
                  selectedRole === 'sitter'
                    ? 'border-warm-teal bg-warm-teal/5 shadow-sm'
                    : 'border-border hover:border-warm-teal/30'
                }`}
              >
                <Heart className={`h-8 w-8 mx-auto mb-2 ${selectedRole === 'sitter' ? 'text-warm-teal' : 'text-muted-foreground'}`} />
                <p className="font-semibold text-sm">{language === 'en' ? 'Service provider' : 'Pružatelj usluga'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{language === 'en' ? 'Sitting first, with more provider tools after onboarding' : 'Sitter odmah, a ostale vrste profila kroz onboarding nakon prijave'}</p>
              </button>
            </div>
            {errors.role && <p className="text-sm text-red-500">{translateFormError(errors.role.message, language)}</p>}
          </div>

          <div className="space-y-3 mb-6 animate-fade-in-up delay-150">
            <button
              type="button"
              onClick={() => handleOAuthSignup('apple')}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              {language === 'en' ? 'Continue with Apple' : 'Nastavi s Apple'}
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignup('google')}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl border-2 border-gray-200 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {language === 'en' ? 'Continue with Google' : 'Nastavi s Google'}
            </button>
            <button
              type="button"
              onClick={() => handleOAuthSignup('facebook')}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-[#1877F2] text-white font-medium hover:bg-[#1669d8] transition-colors"
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {language === 'en' ? 'Continue with Facebook' : 'Nastavi s Facebook'}
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-muted-foreground">{language === 'en' ? 'or with email' : 'ili s email-om'}</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in-up delay-200">
            <div className="flex justify-center mb-4">
              <div className="scale-90 sm:scale-100">
                <ImageUpload
                  variant="avatar"
                  bucket="avatars"
                  entityId="registration"
                  fallbackText={watch('name')?.charAt(0)?.toUpperCase() || '?'}
                  onUploadComplete={(urls) => setAvatarUrl(urls[0] || null)}
                />
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mb-4">{language === 'en' ? 'Add a profile photo (optional)' : 'Dodajte profilnu sliku (opcionalno)'}</p>

            <div className="space-y-2">
              <Label htmlFor="name">{language === 'en' ? 'What is your name?' : 'Kako se zovete?'}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="name" placeholder={language === 'en' ? 'Full name' : 'Ime i prezime'} className="pl-10 focus:border-orange-300" {...register('name')} />
              </div>
              {errors.name && <p className="text-sm text-red-500">{translateFormError(errors.name.message, language)}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" placeholder={language === 'en' ? 'you@email.com' : 'vas@email.com'} className="pl-10 focus:border-orange-300" {...register('email')} />
              </div>
              {errors.email && <p className="text-sm text-red-500">{translateFormError(errors.email.message, language)}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{language === 'en' ? 'Which city are you in?' : 'U kojem ste gradu?'}</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="city"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-10 py-2 text-sm focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
                  {...register('city')}
                >
                  <option value="">{language === 'en' ? 'Choose a city' : 'Odaberite grad'}</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              {errors.city && <p className="text-sm text-red-500">{translateFormError(errors.city.message, language)}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{language === 'en' ? 'Choose a password' : 'Odaberite lozinku'}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={language === 'en' ? 'At least 6 characters' : 'Najmanje 6 znakova'}
                  className="focus:border-orange-300"
                  {...register('password')}
                />
                <button
                  type="button"
                  aria-label={showPassword ? (language === 'en' ? 'Hide password' : 'Sakrij lozinku') : (language === 'en' ? 'Show password' : 'Prikaži lozinku')}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{translateFormError(errors.password.message, language)}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{language === 'en' ? 'Confirm password' : 'Ponovite lozinku'}</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder={language === 'en' ? 'Repeat your password' : 'Ponovite lozinku'}
                className="focus:border-orange-300"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{translateFormError(errors.confirmPassword.message, language)}</p>}
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50 h-11" disabled={loading}>
              {loading ? (language === 'en' ? 'Creating account...' : 'Otvaram račun...') : (language === 'en' ? 'Create account' : 'Otvori račun')}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-6 space-y-2">
            <p>
              {language === 'en' ? 'Already have an account?' : 'Već imate račun?'}{' '}
              <Link href={`/prijava${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-orange-500 hover:underline font-semibold">
                {language === 'en' ? 'Sign in' : 'Prijavite se'}
              </Link>
            </p>
            {redirect && (
              <p className="text-xs text-muted-foreground">
                {language === 'en' ? 'After creating your account, we’ll take you back to where you left off.' : 'Nakon otvaranja računa vratit ćemo vas tamo gdje ste stali.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
