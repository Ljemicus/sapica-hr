'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/i18n/context';
import { translateFormError } from '@/lib/i18n/form-errors';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations';
import { toast } from 'sonner';

export function ResetPasswordForm() {
  const { language } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error(error.message === 'New password should be different from the old password.'
          ? (language === 'en' ? 'Your new password must be different from the old one.' : 'Nova lozinka mora biti različita od stare.')
          : (language === 'en' ? 'Something went wrong while changing your password. Please request a new reset link.' : 'Došlo je do greške pri promjeni lozinke. Pokušajte ponovno zatražiti resetiranje.')
        );
        return;
      }

      setDone(true);
    } catch {
      toast.error(language === 'en' ? 'Network error. Check your internet connection.' : 'Mrežna greška. Provjerite internetsku vezu.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <CheckCircle className="h-16 w-16 text-teal-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-3">{language === 'en' ? 'Password updated' : 'Lozinka promijenjena'}</h1>
          <p className="text-muted-foreground mb-8">
            {language === 'en' ? 'Your password has been changed successfully. You can now sign in with your new password.' : 'Vaša lozinka je uspješno promijenjena. Možete se prijaviti s novom lozinkom.'}
          </p>
          <Button
            onClick={() => router.push('/prijava')}
            className="bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50"
          >
            {language === 'en' ? 'Go to login' : 'Prijavi se'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold">{language === 'en' ? 'Set a new password' : 'Nova lozinka'}</h1>
          <p className="text-muted-foreground mt-2">
            {language === 'en' ? 'Enter a new password for your account.' : 'Unesite novu lozinku za svoj račun.'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in-up delay-100">
          <div className="space-y-2">
            <Label htmlFor="password">{language === 'en' ? 'New password' : 'Nova lozinka'}</Label>
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
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder={language === 'en' ? 'Repeat your password' : 'Ponovite lozinku'}
                className="focus:border-orange-300"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                aria-label={showConfirm ? (language === 'en' ? 'Hide password' : 'Sakrij lozinku') : (language === 'en' ? 'Show password' : 'Prikaži lozinku')}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500">{translateFormError(errors.confirmPassword.message, language)}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50 h-11"
            disabled={loading}
          >
            {loading ? (language === 'en' ? 'Saving...' : 'Spremanje...') : (language === 'en' ? 'Set new password' : 'Postavi novu lozinku')}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/prijava"
            className="text-sm text-orange-500 hover:underline font-semibold"
          >
            {language === 'en' ? 'Back to login' : 'Natrag na prijavu'}
          </Link>
        </div>
      </div>
    </div>
  );
}
