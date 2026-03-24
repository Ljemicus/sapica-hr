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
import { createClient } from '@/lib/supabase/client';
import { registerSchema, type RegisterInput } from '@/lib/validations';
import { CITIES } from '@/lib/types';
import { toast } from 'sonner';

function PawLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="currentColor">
      <ellipse cx="14" cy="17.5" rx="4" ry="4.8" />
      <ellipse cx="8.5" cy="10.5" rx="2.3" ry="3.2" />
      <ellipse cx="19.5" cy="10.5" rx="2.3" ry="3.2" />
      <ellipse cx="5.5" cy="16" rx="2" ry="2.8" />
      <ellipse cx="22.5" cy="16" rx="2" ry="2.8" />
    </svg>
  );
}

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') as 'owner' | 'sitter' | null;
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole || undefined },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { name: data.name, role: data.role, city: data.city } },
    });
    if (authError) { toast.error(authError.message); setLoading(false); return; }
    if (authData.user) {
      const { error: profileError } = await supabase.from('users').insert({ id: authData.user.id, email: data.email, name: data.name, role: data.role, city: data.city });
      if (profileError) { toast.error('Greška pri kreiranju profila'); setLoading(false); return; }
      if (data.role === 'sitter') {
        await supabase.from('sitter_profiles').insert({ user_id: authData.user.id, city: data.city });
      }
    }
    toast.success('Registracija uspješna! Provjerite email za potvrdu.');
    router.push('/prijava');
  };

  return (
    <div className="min-h-[80vh] flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-500 to-amber-400 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.08]" />
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-white rounded-full opacity-10" />
        <div className="absolute top-10 -right-10 w-40 h-40 bg-white rounded-full opacity-10" />
        <div className="relative text-center text-white p-12 max-w-md">
          <PawLogo className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Pridružite se Šapici!</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            {selectedRole === 'sitter'
              ? 'Zarađujte radeći ono što volite — čuvajte ljubimce u svom gradu i postanite dio naše zajednice.'
              : 'Pronađite pouzdane čuvare za vašeg ljubimca i putujte bez brige.'}
          </p>
          <div className="mt-10 flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-2xl font-bold">Besplatno</p>
              <p className="text-sm text-white/70">Registracija</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">2 min</p>
              <p className="text-sm text-white/70">Postavljanje</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8 animate-fade-in-up">
            <PawLogo className="h-12 w-12 text-orange-500 mx-auto mb-4 lg:hidden" />
            <h1 className="text-3xl font-bold">Registracija</h1>
            <p className="text-muted-foreground mt-2">Kreirajte svoj Šapica račun</p>
          </div>

          {/* Role Selection */}
          <div className="space-y-2 mb-6 animate-fade-in-up delay-100">
            <Label className="text-sm font-medium">Ja sam...</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue('role', 'owner')}
                className={`p-5 rounded-xl border-2 text-center transition-all ${
                  selectedRole === 'owner'
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <Dog className={`h-8 w-8 mx-auto mb-2 ${selectedRole === 'owner' ? 'text-orange-500' : 'text-gray-400'}`} />
                <p className="font-semibold text-sm">Vlasnik ljubimca</p>
                <p className="text-xs text-muted-foreground mt-0.5">Tražim čuvara</p>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'sitter')}
                className={`p-5 rounded-xl border-2 text-center transition-all ${
                  selectedRole === 'sitter'
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <Heart className={`h-8 w-8 mx-auto mb-2 ${selectedRole === 'sitter' ? 'text-orange-500' : 'text-gray-400'}`} />
                <p className="font-semibold text-sm">Sitter</p>
                <p className="text-xs text-muted-foreground mt-0.5">Želim čuvati</p>
              </button>
            </div>
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in-up delay-200">
            <div className="space-y-2">
              <Label htmlFor="name">Ime i prezime</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="name" placeholder="Vaše ime" className="pl-10 focus:border-orange-300" {...register('name')} />
              </div>
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" placeholder="vas@email.com" className="pl-10 focus:border-orange-300" {...register('email')} />
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Grad</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  id="city"
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-10 py-2 text-sm focus:border-orange-300 focus:ring-1 focus:ring-orange-200"
                  {...register('city')}
                >
                  <option value="">Odaberite grad</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
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
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Ponovite lozinku"
                className="focus:border-orange-300"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 btn-hover shadow-md shadow-orange-200/50 h-11" disabled={loading}>
              {loading ? 'Registracija...' : 'Registriraj se'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Već imate račun?{' '}
            <Link href="/prijava" className="text-orange-500 hover:underline font-semibold">
              Prijavite se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
