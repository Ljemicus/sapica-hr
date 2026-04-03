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
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations';
import { toast } from 'sonner';

export function ResetPasswordForm() {
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
          ? 'Nova lozinka mora biti različita od stare.'
          : 'Došlo je do greške pri promjeni lozinke. Pokušajte ponovno zatražiti resetiranje.'
        );
        return;
      }

      setDone(true);
    } catch {
      toast.error('Mrežna greška. Provjerite internetsku vezu.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center animate-fade-in-up">
          <CheckCircle className="h-16 w-16 text-teal-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-3">Lozinka promijenjena</h1>
          <p className="text-muted-foreground mb-8">
            Vaša lozinka je uspješno promijenjena. Možete se prijaviti s novom lozinkom.
          </p>
          <Button
            onClick={() => router.push('/prijava')}
            className="bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50"
          >
            Prijavi se
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold">Nova lozinka</h1>
          <p className="text-muted-foreground mt-2">
            Unesite novu lozinku za svoj račun.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in-up delay-100">
          <div className="space-y-2">
            <Label htmlFor="password">Nova lozinka</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Najmanje 6 znakova"
                className="focus:border-orange-300"
                {...register('password')}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Ponovite lozinku</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Ponovite lozinku"
                className="focus:border-orange-300"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Sakrij lozinku' : 'Prikaži lozinku'}
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50 h-11"
            disabled={loading}
          >
            {loading ? 'Spremanje...' : 'Postavi novu lozinku'}
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/prijava"
            className="text-sm text-orange-500 hover:underline font-semibold"
          >
            Natrag na prijavu
          </Link>
        </div>
      </div>
    </div>
  );
}
