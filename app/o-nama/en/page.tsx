import type { Metadata } from 'next';
import { Heart, MapPin, Users, PawPrint, Shield, Search } from 'lucide-react';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us — Our Story | PetPark',
  description: 'PetPark was born from a simple problem — pet owners in Croatia didn\'t have everything in one place. Pet sitting, grooming, training, vets, adoption — now they do.',
  alternates: { canonical: 'https://petpark.hr/o-nama/en' },
};

const VALUES = [
  {
    icon: Shield,
    title: 'Trust',
    description: 'Verified sitters, reviews, transparency. You know who you\'re leaving your pet with.',
    color: 'text-warm-orange',
    bg: 'bg-warm-orange/5',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Forum, blog, lost pets, adoption. More than a platform — a community.',
    color: 'text-warm-teal',
    bg: 'bg-warm-teal/5',
  },
  {
    icon: Heart,
    title: 'Simplicity',
    description: 'Find, book, done. Everything in one place, no complications.',
    color: 'text-warm-coral',
    bg: 'bg-warm-coral/5',
  },
];

export default function AboutPageEn() {
  return (
    <div>
      {/* Editorial Hero */}
      <section className="relative organizations-hero-gradient overflow-hidden">
        <div className="absolute inset-0 paw-pattern opacity-[0.03]" />
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <p className="section-kicker">About Us</p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] leading-[1.05]">
              Born from love.{' '}
              <span className="text-gradient">Literally.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              PetPark was created from the desire to help every paw find their human.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg dark:prose-invert mx-auto">
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-lg animate-fade-in-up">
                We are a platform where pet owners can find
                everything in one place — pet sitting, grooming, training, veterinarians, adoption,
                dog-friendly locations, and a community that understands. Not an agency, not a middleman —{' '}
                <strong className="text-foreground">an ecosystem for people who love animals</strong>.
              </p>

              <div className="appeal-card my-10 animate-fade-in-up delay-200 overflow-hidden">
                <div className="p-8 md:p-10 text-center bg-gradient-to-r from-warm-orange/5 to-warm-teal/5">
                  <PawPrint className="h-10 w-10 text-warm-orange mx-auto mb-4" />
                  <p className="text-xl md:text-2xl font-bold text-foreground leading-snug font-[var(--font-heading)]">
                    Every pet deserves care when their owner can\'t be there.
                    <br />
                    Every owner deserves peace of mind knowing their pet is in good hands.
                  </p>
                </div>
              </div>

              <p className="text-lg animate-fade-in-up delay-300">
                In Croatia, there are over <strong className="text-foreground">800,000 dogs</strong> —
                yet a platform that brings it all together? It didn\'t exist. Outside Zagreb, practically
                nothing existed. We\'re changing that.
              </p>
              <p className="text-lg animate-fade-in-up delay-400">
                We believe that people in the neighborhood can help each other. That a student who
                adores dogs can earn money by watching your Max while you\'re away. That a retiree
                living alone can walk your pet and brighten both their days.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Origin */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 animate-fade-in-up">
            <MapPin className="h-4 w-4 text-warm-orange" />
            <span translate="no">Rijeka</span>, Croatia
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-6 font-[var(--font-heading)] animate-fade-in-up delay-100">
            Small team, big mission
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 animate-fade-in-up delay-200">
            We started from <span translate="no">Rijeka</span>, but our goal is all of Croatia.
            Every city, every neighborhood, every pet. We grow because
            the community grows with us — every new user, every adopted pet,
            every happy paw is proof that this works.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {VALUES.map((v, i) => (
            <div 
              key={i} 
              className="community-section-card p-6 text-center animate-fade-in-up"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className={`inline-flex p-3 rounded-xl ${v.bg} mb-4`}>
                <v.icon className={`h-6 w-6 ${v.color}`} />
              </div>
              <h3 className="text-lg font-bold mb-2 font-[var(--font-heading)]">{v.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 md:px-10 lg:px-16 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-warm-orange to-warm-teal p-10 md:p-16 text-center text-white shadow-xl">
          <div className="absolute inset-0 paw-pattern opacity-[0.06]" />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 font-[var(--font-heading)]">
              PetPark isn\'t just an app. 🐾
            </h2>
            <p className="text-white/85 text-lg mb-8 max-w-xl mx-auto">
              It\'s a place where people who love animals find each other and help one another
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/pretraga/en">
                <Button size="lg" className="bg-white text-warm-orange hover:bg-white/90 shadow-xl shadow-black/10 rounded-xl font-bold text-lg px-8 h-14">
                  <Search className="mr-2 h-5 w-5" />
                  Find a sitter
                </Button>
              </Link>
              <Link href="/postani-sitter/en">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl font-bold text-lg px-8 h-14">
                  <Heart className="mr-2 h-5 w-5" />
                  Become a sitter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
