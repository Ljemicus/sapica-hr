'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Search, Home, User, Calendar, Heart, MapPin, Scissors, GraduationCap, Stethoscope, HelpCircle, Settings, LogOut } from 'lucide-react';

interface CommandPaletteProps {
  locale?: string;
}

export function CommandPalette({ locale = 'hr' }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const translations = {
    hr: {
      placeholder: 'Pretražite PetPark...',
      noResults: 'Nema rezultata.',
      navigation: 'Navigacija',
      services: 'Usluge',
      account: 'Račun',
    },
    en: {
      placeholder: 'Search PetPark...',
      noResults: 'No results found.',
      navigation: 'Navigation',
      services: 'Services',
      account: 'Account',
    },
  };
  
  const t = translations[locale as keyof typeof translations] || translations.hr;

  const navigation = [
    { icon: Home, label: locale === 'hr' ? 'Početna' : 'Home', href: '/' },
    { icon: Search, label: locale === 'hr' ? 'Pretraživanje' : 'Search', href: '/pretraga' },
    { icon: Calendar, label: locale === 'hr' ? 'Rezervacije' : 'Bookings', href: '/rezervacije' },
    { icon: Heart, label: locale === 'hr' ? 'Spašeni' : 'Saved', href: '/spaseno' },
  ];

  const services = [
    { icon: Search, label: locale === 'hr' ? 'Čuvanje pasa' : 'Dog Sitting', href: '/cuvanje-pasa' },
    { icon: Scissors, label: locale === 'hr' ? 'Grooming' : 'Grooming', href: '/njega' },
    { icon: GraduationCap, label: locale === 'hr' ? 'Dresura' : 'Training', href: '/dresura' },
    { icon: Stethoscope, label: locale === 'hr' ? 'Veterinari' : 'Veterinarians', href: '/veterinari' },
    { icon: MapPin, label: locale === 'hr' ? 'Izgubljeni ljubimci' : 'Lost Pets', href: '/izgubljeni' },
  ];

  const account = [
    { icon: User, label: locale === 'hr' ? 'Profil' : 'Profile', href: '/profil' },
    { icon: Settings, label: locale === 'hr' ? 'Postavke' : 'Settings', href: '/postavke' },
    { icon: HelpCircle, label: locale === 'hr' ? 'Pomoć' : 'Help', href: '/pomoc' },
  ];

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t.placeholder} />
      <CommandList>
        <CommandEmpty>{t.noResults}</CommandEmpty>
        
        <CommandGroup heading={t.navigation}>
          {navigation.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t.services}>
          {services.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t.account}>
          {account.map((item) => (
            <CommandItem
              key={item.href}
              onSelect={() => runCommand(() => router.push(item.href))}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
