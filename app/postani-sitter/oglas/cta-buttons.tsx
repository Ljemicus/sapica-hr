'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackEvent } from '@/lib/analytics';

export function LandingPrimaryCTA({ className = '' }: { className?: string }) {
  return (
    <Link
      href="/onboarding/provider?source=sitter-landing"
      onClick={() => trackEvent('Sitter Landing CTA Click', { location: className || 'default' })}
    >
      <Button size="lg" className={className || 'h-14 px-8 rounded-xl text-lg font-bold bg-orange-500 hover:bg-orange-600'}>
        Prijavi se odmah
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </Link>
  );
}

export function LandingSecondaryCTA() {
  return (
    <Link href="#kako-radi" onClick={() => trackEvent('Sitter Landing Secondary CTA Click', { target: 'how-it-works' })}>
      <Button size="lg" variant="outline" className="h-14 px-8 rounded-xl text-lg font-semibold">
        Kako to funkcionira?
      </Button>
    </Link>
  );
}
