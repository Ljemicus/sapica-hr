'use client';

import { Timeline, CompactTimeline, TimelineStep } from './timeline';
import {
  Dog,
  Home,
  Scissors,
  Calendar,
  MapPin,
  Phone,
  CheckCircle,
  Star,
  Shield,
  Heart,
  Clock,
  Users,
} from 'lucide-react';

// Dog walking process steps
const dogWalkingSteps: TimelineStep[] = [
  {
    icon: <Phone className="h-5 w-5" />,
    title: 'Book Your Walk',
    description: 'Schedule through our app or website. Choose date, time, and duration.',
    duration: '2 min',
  },
  {
    icon: <MapPin className="h-5 w-5" />,
    title: 'Meet & Greet',
    description: 'Your walker visits to meet your dog and learn their routine.',
    duration: '30 min',
  },
  {
    icon: <Dog className="h-5 w-5" />,
    title: 'Pickup & Walk',
    description: 'Walker picks up your dog, provides exercise and playtime.',
    duration: '30-60 min',
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: 'Safe Return',
    description: 'Dog is returned home, fed/watered, and you receive updates.',
    duration: '10 min',
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: 'Post-Walk Report',
    description: 'Get photos, GPS route map, and behavior notes via app.',
    duration: 'Instant',
  },
];

// Pet sitting process steps
const petSittingSteps: TimelineStep[] = [
  {
    icon: <Calendar className="h-5 w-5" />,
    title: 'Schedule Stay',
    description: 'Book dates for in-home pet sitting or boarding.',
    duration: '5 min',
  },
  {
    icon: <Home className="h-5 w-5" />,
    title: 'Home Setup',
    description: 'Sitter prepares your home with familiar items and safety checks.',
    duration: '1 hour',
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: 'Daily Care',
    description: 'Feeding, playtime, medication, and companionship throughout stay.',
    duration: 'Multiple visits',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Home Security',
    description: 'Mail collection, plant watering, and security checks included.',
    duration: '24/7',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Owner Updates',
    description: 'Daily photos and videos so you can enjoy your trip worry-free.',
    duration: 'Daily',
  },
];

// Grooming process steps
const groomingSteps: TimelineStep[] = [
  {
    icon: <Calendar className="h-5 w-5" />,
    title: 'Appointment Booking',
    description: 'Select service type, date, and drop-off time.',
    duration: '3 min',
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: 'Health Check',
    description: 'Gentle examination for skin, coat, ears, and nails.',
    duration: '10 min',
  },
  {
    icon: <Scissors className="h-5 w-5" />,
    title: 'Bathing & Grooming',
    description: 'Specialty shampoo, conditioning, brushing, and haircut.',
    duration: '45-90 min',
  },
  {
    icon: <Dog className="h-5 w-5" />,
    title: 'Drying & Styling',
    description: 'Low-heat drying, nail trimming, ear cleaning, and finishing.',
    duration: '30 min',
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: 'Pickup & Aftercare',
    description: 'Receive grooming report and aftercare instructions.',
    duration: '15 min',
  },
];

export function TimelineExamples() {
  return (
    <div className="space-y-16 py-8">
      {/* Dog Walking Timeline */}
      <section>
        <Timeline
          steps={dogWalkingSteps}
          title="Dog Walking Process"
          subtitle="From booking to happy returns"
          orientation="vertical"
        />
      </section>

      {/* Pet Sitting Timeline - Horizontal on desktop */}
      <section className="hidden md:block">
        <Timeline
          steps={petSittingSteps}
          title="Pet Sitting Service"
          subtitle="Complete care while you're away"
          orientation="horizontal"
          lineColor="bg-blue-500/30"
        />
      </section>

      {/* Pet Sitting Timeline - Compact for mobile */}
      <section className="md:hidden">
        <CompactTimeline
          steps={petSittingSteps}
          title="Pet Sitting Service"
          subtitle="Complete care while you're away"
        />
      </section>

      {/* Grooming Timeline */}
      <section>
        <Timeline
          steps={groomingSteps}
          title="Professional Grooming"
          subtitle="Spa-like experience for your pet"
          orientation="vertical"
          lineColor="bg-purple-500/30"
        />
      </section>
    </div>
  );
}

// Individual example components for use in different pages
export function DogWalkingTimelineExample() {
  return (
    <Timeline
      steps={dogWalkingSteps}
      title="Our Dog Walking Process"
      subtitle="Reliable, safe, and fun walks for your furry friend"
      orientation="vertical"
    />
  );
}

export function PetSittingTimelineExample() {
  return (
    <div>
      {/* Desktop */}
      <div className="hidden md:block">
        <Timeline
          steps={petSittingSteps}
          title="In-Home Pet Sitting"
          subtitle="Peace of mind while you travel"
          orientation="horizontal"
          lineColor="bg-blue-500/30"
        />
      </div>
      {/* Mobile */}
      <div className="md:hidden">
        <CompactTimeline
          steps={petSittingSteps}
          title="In-Home Pet Sitting"
          subtitle="Peace of mind while you travel"
        />
      </div>
    </div>
  );
}

export function GroomingTimelineExample() {
  return (
    <Timeline
      steps={groomingSteps}
      title="Grooming Service Steps"
      subtitle="From check-in to fabulous finish"
      orientation="vertical"
      lineColor="bg-purple-500/30"
    />
  );
}

// Usage example for a service page
export function ServiceProcessShowcase() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          How Our Services Work
        </h1>
        <p className="mt-4 text-xl text-muted-foreground">
          Simple, transparent processes for exceptional pet care
        </p>
      </div>

      <div className="grid gap-12 md:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <Dog className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Dog Walking</h3>
          </div>
          <Timeline
            steps={dogWalkingSteps.slice(0, 3)}
            orientation="vertical"
            animated={false}
            className="text-sm"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Home className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Pet Sitting</h3>
          </div>
          <Timeline
            steps={petSittingSteps.slice(0, 3)}
            orientation="vertical"
            animated={false}
            className="text-sm"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <Scissors className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Grooming</h3>
          </div>
          <Timeline
            steps={groomingSteps.slice(0, 3)}
            orientation="vertical"
            animated={false}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}