'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';

interface SearchSuggestion {
  id: string;
  title: string;
  type: 'service' | 'city' | 'sitter';
  href: string;
}

export function InstantSearch() {
  const router = useRouter();
  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const debouncedSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      
      // Simulate API call - in production this would fetch from backend
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockSuggestions: SearchSuggestion[] = ([
        { id: '1', title: language === 'hr' ? 'Čuvanje pasa' : 'Dog sitting', type: 'service' as const, href: '/pretraga' },
        { id: '2', title: language === 'hr' ? 'Grooming' : 'Grooming', type: 'service' as const, href: '/njega' },
        { id: '3', title: 'Zagreb', type: 'city' as const, href: '/cuvanje-pasa-zagreb' },
        { id: '4', title: 'Rijeka', type: 'city' as const, href: '/cuvanje-pasa-rijeka' },
        { id: '5', title: 'Split', type: 'city' as const, href: '/cuvanje-pasa-split' },
      ] as SearchSuggestion[]).filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSuggestions(mockSuggestions);
      setIsLoading(false);
    },
    [language]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, debouncedSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/pretraga?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    router.push(suggestion.href);
    setQuery('');
    setShowSuggestions(false);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'service':
        return '🔧';
      case 'city':
        return '📍';
      default:
        return '🔍';
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={language === 'hr' ? 'Pretražite usluge, gradove...' : 'Search services, cities...'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          className="pl-10 pr-10 h-11 rounded-full bg-muted/50 border-0 focus:bg-background focus:ring-2 focus:ring-primary/20"
        />
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </motion.div>
          )}
          {!isLoading && query && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              onClick={() => {
                setQuery('');
                setSuggestions([]);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </motion.button>
          )}
        </AnimatePresence>
      </form>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || query.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-background rounded-2xl shadow-xl border border-border overflow-hidden z-50"
          >
            {suggestions.length > 0 ? (
              <ul className="py-2">
                {suggestions.map((suggestion, index) => (
                  <motion.li
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                    >
                      <span className="text-lg">{getIconForType(suggestion.type)}</span>
                      <div>
                        <p className="font-medium">{suggestion.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {suggestion.type}
                        </p>
                      </div>
                    </button>
                  </motion.li>
                ))}
              </ul>
            ) : query.length >= 2 && !isLoading ? (
              <div className="px-4 py-6 text-center text-muted-foreground">
                {language === 'hr' ? 'Nema rezultata' : 'No results found'}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
