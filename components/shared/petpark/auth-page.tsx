'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LockKeyhole, Mail, PawPrint, ShieldCheck, UsersRound } from 'lucide-react';
import { toast } from 'sonner';
import {
  Badge,
  Button,
  Card,
  Input,
  LeafDecoration,
  PawDecoration,
  PetParkLogo,
} from '@/components/shared/petpark/design-foundation';
import { getAuthCallbackUrl, safeRedirectPath } from '@/lib/auth-redirect';
import { useLanguage } from '@/lib/i18n/context';
import { translateFormError } from '@/lib/i18n/form-errors';
import { createClient } from '@/lib/supabase/client';
import { loginSchema, type LoginInput } from '@/lib/validations';

const trustItems = [
  { icon: ShieldCheck, label: 'Provjereni pružatelji usluga' },
  { icon: UsersRound, label: 'Zajednica koja pomaže' },
  { icon: PawPrint, label: 'Sve na jednom mjestu' },
  { icon: LockKeyhole, label: 'Vaši podaci su sigurni' },
];

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AuthTabs() {
  return (
    <div className="grid grid-cols-2 rounded-[var(--pp-radius-card-20)] bg-[color:var(--pp-color-cream-surface)] p-2" role="tablist" aria-label="Prijava i registracija">
      <button
        type="button"
        role="tab"
        aria-selected="true"
        className="rounded-[var(--pp-radius-control)] bg-[color:var(--pp-color-card-surface)] px-4 py-3 text-sm font-black text-[color:var(--pp-color-forest-text)] shadow-[var(--pp-shadow-small-card)]"
      >
        Prijava
      </button>
      <Link
        href="/registracija"
        role="tab"
        aria-selected="false"
        className="rounded-[var(--pp-radius-control)] px-4 py-3 text-center text-sm font-black text-[color:var(--pp-color-muted-text)] transition hover:bg-[color:var(--pp-color-card-surface)]/70 hover:text-[color:var(--pp-color-forest-text)]"
      >
        Registracija
      </Link>
    </div>
  );
}

export function AuthPage() {
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = safeRedirectPath(searchParams.get('redirect'));
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(payload.error || (language === 'en' ? 'Login failed' : 'Prijava nije uspjela'));
        return;
      }

      toast.success(language === 'en' ? 'Logged in successfully!' : 'Uspješna prijava!');
      router.push(redirect !== '/' ? redirect : (payload.defaultRedirect || '/dashboard/vlasnik'));
      router.refresh();
    } catch {
      toast.error(language === 'en' ? 'Network error. Check your internet connection.' : 'Mrežna greška. Provjerite internetsku vezu.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: getAuthCallbackUrl(redirect) },
    });

    if (error) {
      toast.error(provider === 'google' ? 'Greška pri prijavi putem Googlea' : 'Greška pri prijavi putem Facebooka');
      setLoading(false);
    }
  };

  return (
    <main data-petpark-route="prijava" className="min-h-screen overflow-hidden bg-[color:var(--pp-color-cream-background)] text-[color:var(--pp-color-forest-text)]">
      <section className="relative mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <LeafDecoration className="-left-28 top-36 size-[260px] opacity-50" />
        <LeafDecoration className="right-[-90px] top-[520px] size-[220px] opacity-45" />
        <PawDecoration className="left-[42%] top-20 hidden opacity-60 xl:flex" />

        <div className="mx-auto max-w-[var(--pp-content-width)]">
          <header className="flex items-center justify-between gap-4">
            <Link href="/" aria-label="PetPark početna" className="shrink-0 rounded-[var(--pp-radius-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--pp-color-teal-accent)]">
              <PetParkLogo priority />
            </Link>
            <Link href="/usluge" className="hidden text-sm font-black text-[color:var(--pp-color-muted-text)] transition hover:text-[color:var(--pp-color-forest-text)] sm:inline-flex">
              Pregledaj usluge
            </Link>
          </header>

          <div className="grid min-h-[760px] items-center gap-8 py-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:py-12">
            <Card radius="28" className="relative z-10 p-5 sm:p-8 lg:p-10">
              <Badge variant="teal">PetPark račun</Badge>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-[color:var(--pp-color-forest-text)] sm:text-5xl">Prijava</h1>
              <p className="mt-3 text-base font-semibold leading-7 text-[color:var(--pp-color-muted-text)]">
                Prijavite se za slanje upita, spremanje favorita i upravljanje rezervacijama.
              </p>

              <div className="mt-7">
                <AuthTabs />
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" aria-label="Prijava u PetPark">
                <label className="flex flex-col gap-3">
                  <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">E-mail adresa</span>
                  <span className="relative block">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                    <Input id="email" type="email" placeholder="ime@email.com" className="pl-12" {...register('email')} />
                  </span>
                  {errors.email ? <span className="text-sm font-bold text-[color:var(--pp-color-error)]">{translateFormError(errors.email.message, language)}</span> : null}
                </label>

                <label className="flex flex-col gap-3">
                  <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">Lozinka</span>
                  <span className="relative block">
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Vaša lozinka" className="pl-12 pr-12" {...register('password')} />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--pp-color-muted-text)] transition hover:text-[color:var(--pp-color-forest-text)]"
                    >
                      {showPassword ? <EyeOff className="size-5" aria-hidden /> : <Eye className="size-5" aria-hidden />}
                    </button>
                  </span>
                  {errors.password ? <span className="text-sm font-bold text-[color:var(--pp-color-error)]">{translateFormError(errors.password.message, language)}</span> : null}
                </label>

                <div className="flex flex-col gap-3 text-sm font-bold text-[color:var(--pp-color-muted-text)] sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" className="size-4 rounded border-[color:var(--pp-color-warm-border)] accent-[color:var(--pp-color-orange-primary)]" />
                    Zapamti me
                  </label>
                  <Link href="/zaboravljena-lozinka" className="text-[color:var(--pp-color-orange-primary)] hover:underline">
                    Zaboravili ste lozinku?
                  </Link>
                </div>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Prijava...' : 'Prijavi se'}
                </Button>
              </form>

              <div className="my-7 flex items-center gap-4 text-sm font-bold text-[color:var(--pp-color-muted-text)]">
                <span className="h-px flex-1 bg-[color:var(--pp-color-warm-border)]" />
                ili nastavi putem
                <span className="h-px flex-1 bg-[color:var(--pp-color-warm-border)]" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button type="button" variant="secondary" className="w-full" onClick={() => handleOAuthLogin('google')} disabled={loading}>
                  <GoogleIcon />
                  Nastavi s Googleom
                </Button>
                <Button type="button" variant="teal" className="w-full" onClick={() => handleOAuthLogin('facebook')} disabled={loading}>
                  <span className="flex size-5 items-center justify-center rounded-full bg-white text-sm font-black text-[#1877F2]" aria-hidden>f</span>
                  Nastavi s Facebookom
                </Button>
              </div>

              <p className="mt-7 text-center text-sm font-bold text-[color:var(--pp-color-muted-text)]">
                Nemate račun?{' '}
                <Link href={`/registracija${redirect && redirect !== '/' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-[color:var(--pp-color-orange-primary)] hover:underline">
                  Registrirajte se
                </Link>
              </p>
            </Card>

            <div className="relative hidden lg:block">
              <Card tone="sage" radius="28" className="relative min-h-[680px] overflow-hidden p-10 xl:p-12">
                <LeafDecoration className="right-8 top-8 size-44 opacity-55" />
                <PawDecoration className="bottom-10 right-10 size-20 opacity-80" />
                <div className="relative z-10 flex min-h-[580px] flex-col justify-between">
                  <div>
                    <Badge variant="orange">Dobrodošli natrag</Badge>
                    <h2 className="mt-6 max-w-[560px] text-6xl font-black leading-[0.98] tracking-[-0.06em] text-[color:var(--pp-color-forest-text)]">
                      Dobrodošli u PetPark zajednicu!
                    </h2>
                    <p className="mt-6 max-w-[560px] text-lg font-semibold leading-8 text-[color:var(--pp-color-muted-text)]">
                      Jedno sigurno mjesto za vlasnike, pružatelje i sve koji žele bolju svakodnevicu za ljubimce — od čuvanja i šetnji do savjeta zajednice.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {trustItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Card key={item.label} radius="20" shadow="small" className="bg-[color:var(--pp-color-card-surface)] p-4">
                          <Icon className="size-6 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                          <p className="mt-3 text-sm font-black leading-5 text-[color:var(--pp-color-forest-text)]">{item.label}</p>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <footer className="grid gap-3 pb-8 sm:grid-cols-2 lg:grid-cols-4">
            {trustItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-3 rounded-[var(--pp-radius-card-20)] border border-[color:var(--pp-color-warm-border)] bg-[color:var(--pp-color-card-surface)] p-4 shadow-[var(--pp-shadow-small-card)]">
                  <Icon className="size-5 shrink-0 text-[color:var(--pp-color-teal-accent)]" aria-hidden />
                  <span className="text-sm font-black text-[color:var(--pp-color-forest-text)]">{item.label}</span>
                </div>
              );
            })}
          </footer>
        </div>
      </section>
    </main>
  );
}
