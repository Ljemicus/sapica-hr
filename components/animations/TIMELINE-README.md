# Timeline Component

An animated timeline component for visualizing process steps in pet care services.

## Features

- ✅ Vertical timeline with animated steps
- ✅ Staggered animation on scroll
- ✅ Animated progress line
- ✅ Light and dark mode support
- ✅ Mobile-responsive design
- ✅ Optional time estimates
- ✅ Horizontal layout on desktop
- ✅ Compact version for mobile
- ✅ TypeScript support

## Installation

The component is already included in the project. It requires:
- `framer-motion` (already installed)
- `lucide-react` for icons (already installed)
- `@/lib/utils` for `cn` utility function

## Usage

### Basic Timeline

```tsx
import { Timeline } from '@/components/animations/timeline';
import { Dog, Home, Scissors } from 'lucide-react';

const steps = [
  {
    icon: <Dog className="h-5 w-5" />,
    title: 'Step 1',
    description: 'Description of step 1',
    duration: '5 min',
  },
  // ... more steps
];

function MyComponent() {
  return (
    <Timeline
      steps={steps}
      title="Our Process"
      subtitle="How it works"
      orientation="vertical"
    />
  );
}
```

### Compact Timeline (for mobile)

```tsx
import { CompactTimeline } from '@/components/animations/timeline';

function MyComponent() {
  return (
    <CompactTimeline
      steps={steps}
      title="Our Process"
      subtitle="How it works"
    />
  );
}
```

### Pre-built Examples

```tsx
import {
  DogWalkingTimelineExample,
  PetSittingTimelineExample,
  GroomingTimelineExample,
  ServiceProcessShowcase,
} from '@/components/animations/timeline-examples';

// Use pre-configured examples
function ServicePage() {
  return (
    <div>
      <DogWalkingTimelineExample />
      <PetSittingTimelineExample />
      <GroomingTimelineExample />
    </div>
  );
}
```

## Props

### TimelineProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `TimelineStep[]` | **Required** | Array of step objects |
| `title` | `string` | `undefined` | Optional section title |
| `subtitle` | `string` | `undefined` | Optional section subtitle |
| `className` | `string` | `undefined` | Additional CSS classes |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Timeline layout direction |
| `lineColor` | `string` | `'bg-primary/30'` | Color class for the timeline line |
| `animated` | `boolean` | `true` | Enable/disable animations |

### TimelineStep

| Property | Type | Description |
|----------|------|-------------|
| `icon` | `ReactNode` | Icon component (e.g., from lucide-react) |
| `title` | `string` | Step title |
| `description` | `string` | Step description |
| `duration` | `string` | Optional time estimate |

## Examples

Three pre-configured examples are included:

1. **Dog Walking Process** (5 steps)
   - Booking → Meet & Greet → Walk → Return → Report

2. **Pet Sitting Process** (5 steps)  
   - Schedule → Setup → Daily Care → Security → Updates

3. **Grooming Process** (5 steps)
   - Booking → Health Check → Grooming → Styling → Pickup

## Responsive Behavior

- **Desktop**: Vertical timeline by default, horizontal option available
- **Tablet**: Vertical timeline
- **Mobile**: Compact timeline or vertical with adjusted spacing
- **Auto-switch**: `PetSittingTimelineExample` automatically switches between horizontal (desktop) and compact (mobile)

## Animation

- Steps animate in sequence with stagger effect
- Progress line grows from top to bottom
- Dots pulse in with spring animation
- All animations trigger on scroll into view
- Can be disabled with `animated={false}`

## Styling

The component uses Tailwind CSS classes and supports:
- Light/dark mode via `text-foreground`, `bg-background`, etc.
- Custom colors via `lineColor` prop
- Custom classes via `className` prop
- Responsive spacing and typography

## Test Page

A test page is available at `/timeline-test` to preview all variations.

## Browser Support

- Modern browsers with CSS Grid and Flexbox support
- Reduced motion preferences are respected via `@media (prefers-reduced-motion)`