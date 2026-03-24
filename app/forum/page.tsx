import { MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ForumContent } from './forum-content';

export const metadata = {
  title: 'Forum — Zajednica ljubitelja životinja',
  description: 'Pitanja, savjeti, priče i razgovori zajednice ljubitelja životinja. Pridružite se diskusiji!',
};

export default function ForumPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-pink-50">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-4 py-16 md:py-24 relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-6 bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 text-sm px-5 py-2 animate-fade-in-up">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
              Forum
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 animate-fade-in-up delay-100">
              Zajednica{' '}
              <span className="text-gradient">ljubitelja životinja</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in-up delay-200 leading-relaxed">
              Postavite pitanje, podijelite savjet ili ispričajte priču.
              Ovdje smo jedni za druge — i za naše ljubimce.
            </p>
          </div>
        </div>
      </section>

      <ForumContent />
    </div>
  );
}
