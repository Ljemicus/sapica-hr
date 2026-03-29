'use client';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/use-favorites';

interface FavoriteButtonProps {
  sitterId: string;
  className?: string;
}

export function FavoriteButton({ sitterId, className = '' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(sitterId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(sitterId);
      }}
      className={`p-2 rounded-full transition-all duration-200 ${
        active
          ? 'bg-red-500 text-white shadow-lg shadow-red-200/50'
          : 'bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
      } ${className}`}
      aria-label={active ? 'Ukloni iz omiljenih' : 'Dodaj u omiljene'}
    >
      <Heart className={`h-4 w-4 ${active ? 'fill-white' : ''}`} />
    </button>
  );
}
