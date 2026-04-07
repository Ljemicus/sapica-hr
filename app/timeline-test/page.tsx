import { TimelineExamples } from '@/components/animations/timeline-examples';

export default function TimelineTestPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Timeline Component Test
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Testing the animated timeline component for pet care services
          </p>
        </div>
        
        <TimelineExamples />
        
        <div className="mt-16 rounded-lg border bg-card p-6">
          <h2 className="text-2xl font-semibold text-foreground">Component Features</h2>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Vertical timeline with animated steps
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Staggered animation on scroll
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Animated progress line
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Light and dark mode support
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Mobile-responsive design
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Optional time estimates
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Horizontal layout on desktop
            </li>
            <li className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Compact version for mobile
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}