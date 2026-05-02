'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/lib/i18n/context';
import { translateFormError } from '@/lib/i18n/form-errors';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations';
import { toast } from 'sonner';

export function ForgotPasswordForm() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toast.error(payload.error?.message || (language === 'en' ? 'Something went wrong.' : 'Došlo je do greške.'));
        return;
      }

      setSent(true);
    } catch {
      toast.error(language === 'en' ? 'Network error. Check your internet connection.' : 'Mrežna greška. Provjerite internetsku vezu.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-warm-teal/10 mb-6">
            <CheckCircle className="h-10 w-10 text-warm-teal" />
          </div>
          <h1 className="text-2xl font-bold mb-3">{language === 'en' ? 'Check your email' : 'Provjerite email'}</h1>
          <p className="text-muted-foreground mb-8">
            {language === 'en'
              ? 'If an account exists for that email address, we sent a password reset link. Please check your spam folder too.'
              : 'Ako račun s tom email adresom postoji, poslali smo vam poveznicu za resetiranje lozinke. Provjerite i spam mapu.'}
          </p>
          <Link
            href="/prijava"
            className="inline-flex items-center gap-2 text-warm-orange hover:underline font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'en' ? 'Back to login' : 'Natrag na prijavu'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold font-[var(--font-heading)]">{language === 'en' ? 'Forgot password' : 'Zaboravljena lozinka'}</h1>
          <p className="text-muted-foreground mt-2">
            {language === 'en' ? 'Enter your email address and we’ll send you a password reset link.' : 'Unesite email adresu i poslat ćemo vam poveznicu za resetiranje lozinke.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in-up delay-100">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder={language === 'en' ? 'you@email.com' : 'vas@email.com'}
                className="pl-10"
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-sm text-red-500">{translateFormError(errors.email.message, language)}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-warm-orange hover:bg-warm-orange/90 h-11"
            disabled={loading}
          >
            {loading ? (language === 'en' ? 'Sending...' : 'Slanje...') : (language === 'en' ? 'Send reset link' : 'Pošalji poveznicu')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/prijava"
            className="inline-flex items-center gap-2 text-sm text-warm-orange hover:underline font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            {language === 'en' ? 'Back to login' : 'Natrag na prijavu'}
          </Link>
        </div>
      </div>
    </div>
  );
}
