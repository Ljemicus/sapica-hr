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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
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
      const { error: profileError } = await supabase.from('users').insert({ id: authData.user.id, email: data.email, name: data.name, role: data.role, city: data.city, avatar_url: avatarUrl });
      if (profileError) { toast.error('Greška pri kreiranju profila'); setLoading(false); return; }
      if (data.role === 'sitter') {
        await supabase.from('sitter_profiles').insert({ user_id: authData.user.id, city: data.city });
      }
    }

    // If email confirmation is required, the session won't be set yet
    if (authData.session) {
      toast.success('Registracija uspješna!');
      const target = data.role === 'sitter' ? '/dashboard/sitter' : '/dashboard/vlasnik';
      router.push(target);
      router.refresh();
    } else {
      toast.success('Registracija uspješna! Provjerite email za potvrdu.');
      router.push('/prijava');
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard/vlasnik`,
      },
    });
    if (error) {
      toast.error('Greška pri registraciji s Google računom');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex">
      {/* Left side - Decorative */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-orange-500 to-amber-400 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.08]" />
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-white rounded-full opacity-10" />
        <div className="absolute top-10 -right-10 w-40 h-40 bg-white rounded-full opacity-10" />
        <div className="relative text-center text-white p-12 max-w-md">
          <PawLogo className="h-32 w-32 mx-auto mb-8 opacity-90" />
          <h2 className="text-3xl font-bold mb-4">Pridružite se PetParku!</h2>
          <p className="text-white/80 text-lg leading-relaxed">
            {selectedRole === 'sitter'
              ? 'Zarađujte radeći ono što volite — pružajte usluge u svom gradu i postanite dio naše zajednice.'
              : 'Pronađite sve za vašeg ljubimca na jednom mjestu — čuvanje, njega, školovanje i više.'}
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
            <p className="text-muted-foreground mt-2">Kreirajte svoj PetPark račun</p>
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
                <p className="font-semibold text-sm">Pružatelj usluga</p>
                <p className="text-xs text-muted-foreground mt-0.5">Želim pružati usluge</p>
              </button>
            </div>
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>

          {/* Social Registration */}
          <div className="space-y-3 mb-6 animate-fade-in-up delay-150">
            <button
              type="button"
              onClick={async () => {
                const { error } = await supabase.auth.signInWithOAuth({
                  provider: 'apple',
                  options: { redirectTo: `${window.location.origin}/auth/callback` }
                });
                if (error) toast.error(error.message);
              }}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-black text-white font-medium hover:bg-gray-800 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Registriraj se s Apple
            </button>
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl border-2 border-gray-200 font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors"
              disabled={loading}
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Registriraj se s Google
            </button>
            <button
              type="button"
              onClick={() => toast.info('Facebook prijava će biti dostupna uskoro!')}
              className="w-full flex items-center justify-center gap-3 p-3.5 rounded-2xl bg-[#1877F2] text-white font-medium hover:bg-[#166FE5] transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Registriraj se s Facebook
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-muted-foreground">ili s email-om</span></div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in-up delay-200">
            {/* Avatar upload */}
            <div className="flex justify-center mb-2">
              <ImageUpload
                variant="avatar"
                bucket="avatars"
                entityId="registration"
                fallbackText={watch('name')?.charAt(0)?.toUpperCase() || '?'}
                onUploadComplete={(urls) => setAvatarUrl(urls[0] || null)}
              />
            </div>
            <p className="text-center text-xs text-muted-foreground -mt-2 mb-2">Dodajte profilnu sliku (opcionalno)</p>

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
