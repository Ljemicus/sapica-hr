import { Cat, Dog, HelpCircle } from 'lucide-react';
import type { Species } from '@/lib/types';

export const dashboardSpeciesIcons: Record<Species, React.ElementType> = {
  dog: Dog,
  cat: Cat,
  other: HelpCircle,
};

export const dashboardSpeciesGradients: Record<Species, string> = {
  dog: 'from-orange-400 to-amber-300',
  cat: 'from-purple-400 to-pink-300',
  other: 'from-blue-400 to-cyan-300',
};
