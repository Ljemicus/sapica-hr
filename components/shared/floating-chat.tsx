'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function FloatingChat() {
  return (
    <Link
      href="/poruke"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all hover:bg-orange-600 hover:scale-110 active:scale-95"
      aria-label="Poruke"
    >
      <MessageCircle className="h-6 w-6" />
    </Link>
  );
}
