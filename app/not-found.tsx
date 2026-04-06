'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft, Dog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

export default function NotFound() {
  const { language } = useLanguage();

  useEffect(() => {
    // Log 404 to analytics
    if (typeof window !== 'undefined') {
      console.log('404:', window.location.pathname);
    }
  }, []);

  const t = {
    hr: {
      title: 'Ups! Stranica nije pronađena',
      subtitle: 'Čini se da se ovaj ljubimac izgubio.',
      home: 'Početna',
      search: 'Pretraži',
      back: 'Natrag',
    },
    en: {
      title: 'Oops! Page not found',
      subtitle: 'Seems like this pet got lost.',
      home: 'Home',
      search: 'Search',
      back: 'Go back',
    },
  };

  const copy = language === 'en' ? t.en : t.hr;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Animated illustration */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative w-40 h-40 mx-auto">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Dog className="w-32 h-32 text-muted-foreground/50" />
            </motion.div>
            {/* Question marks */}
            <motion.span
              animate={{ opacity: [0, 1, 0], y: [-10, -30] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute top-0 right-4 text-4xl"
            >
              ?
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0], y: [-10, -30] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute top-4 left-4 text-3xl"
            >
              ?
            </motion.span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-4 font-[var(--font-heading)]"
        >
          404
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-muted-foreground mb-2"
        >
          {copy.title}
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-8"
        >
          {copy.subtitle}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link href="/">
            <Button className="group">
              <Home className="mr-2 h-4 w-4" />
              {copy.home}
            </Button>
          </Link>
          <Link href="/pretraga">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              {copy.search}
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {copy.back}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
