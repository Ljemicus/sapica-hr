import { HeroSection } from '@/components/home/hero-section';
import { GlassNavbar } from '@/components/shared/glass-navbar';

export default function TestHeroPage() {
  return (
    <div className="min-h-screen">
      <GlassNavbar />
      <HeroSection />
      <div className="h-screen bg-gray-100 p-8">
        <h2 className="text-3xl font-bold mb-4">Scroll down to test navbar hide/show</h2>
        <p className="text-gray-600 mb-8">
          The navbar should hide when scrolling down and show when scrolling up.
          The hero section has animated gradient background, floating paw elements,
          gradient text effect, CTA button with pulse animation, and scroll indicator.
        </p>
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="p-4 bg-white rounded-lg shadow">
              <h3 className="font-semibold">Section {i + 1}</h3>
              <p className="text-gray-500">
                Scroll to test the navbar behavior. The navbar has glassmorphism effect
                with backdrop blur and changes opacity based on scroll position.
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}