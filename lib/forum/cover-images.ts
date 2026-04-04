import type { ForumCategorySlug } from '@/lib/types';

export interface ForumCoverStyle {
  gradient: string;
  iconEmoji: string;
  accent: string;
}

const CATEGORY_COVERS: Record<ForumCategorySlug, ForumCoverStyle> = {
  pitanja: {
    gradient: 'from-blue-400 via-blue-500 to-indigo-500',
    iconEmoji: '❓',
    accent: 'text-blue-200',
  },
  savjeti: {
    gradient: 'from-emerald-400 via-green-500 to-teal-500',
    iconEmoji: '💡',
    accent: 'text-green-200',
  },
  price: {
    gradient: 'from-pink-400 via-rose-500 to-fuchsia-500',
    iconEmoji: '📖',
    accent: 'text-pink-200',
  },
  izgubljeni: {
    gradient: 'from-red-400 via-red-500 to-orange-500',
    iconEmoji: '🚨',
    accent: 'text-red-200',
  },
  slobodna: {
    gradient: 'from-amber-400 via-orange-500 to-yellow-500',
    iconEmoji: '💬',
    accent: 'text-amber-200',
  },
};

export function getCoverStyle(category: ForumCategorySlug): ForumCoverStyle {
  return CATEGORY_COVERS[category];
}
