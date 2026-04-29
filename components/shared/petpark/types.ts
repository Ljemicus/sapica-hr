export type PetParkCategory =
  | 'sitter'
  | 'grooming'
  | 'trainer'
  | 'lost'
  | 'community'
  | 'vet'
  | 'adoption'
  | 'breeder'
  | 'shop'
  | 'dogFriendly'
  | 'medical';

export type PetParkAction = {
  label: string;
  href: string;
};

export const categoryStyles: Record<PetParkCategory, { bg: string; accent: string; text: string; label: string }> = {
  sitter: {
    bg: 'bg-[color:var(--pp-sitter-bg)]',
    accent: 'text-[color:var(--pp-sitter-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Sitteri',
  },
  grooming: {
    bg: 'bg-[color:var(--pp-grooming-bg)]',
    accent: 'text-[color:var(--pp-grooming-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Grooming',
  },
  trainer: {
    bg: 'bg-[color:var(--pp-trainer-bg)]',
    accent: 'text-[color:var(--pp-trainer-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Treneri',
  },
  lost: {
    bg: 'bg-[color:var(--pp-lost-bg)]',
    accent: 'text-[color:var(--pp-lost-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Izgubljeni',
  },
  community: {
    bg: 'bg-[color:var(--pp-community-bg)]',
    accent: 'text-[color:var(--pp-community-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Zajednica',
  },
  vet: {
    bg: 'bg-[color:var(--pp-vet-bg)]',
    accent: 'text-[color:var(--pp-vet-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Veterinari',
  },
  adoption: {
    bg: 'bg-[color:var(--pp-adoption-bg)]',
    accent: 'text-[color:var(--pp-adoption-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Udomljavanje',
  },
  breeder: {
    bg: 'bg-[color:var(--pp-breeder-bg)]',
    accent: 'text-[color:var(--pp-breeder-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Uzgajivačnice',
  },
  shop: {
    bg: 'bg-[color:var(--pp-cream)]',
    accent: 'text-[color:var(--pp-logo-orange)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Shop',
  },
  dogFriendly: {
    bg: 'bg-[color:var(--pp-trainer-bg)]',
    accent: 'text-[color:var(--pp-logo-teal)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Dog-friendly',
  },
  medical: {
    bg: 'bg-[color:var(--pp-vet-bg)]',
    accent: 'text-[color:var(--pp-vet-accent)]',
    text: 'text-[color:var(--pp-ink)]',
    label: 'Zdravlje',
  },
};
