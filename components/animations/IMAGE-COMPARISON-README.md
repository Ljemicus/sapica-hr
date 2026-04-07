# Image Comparison Slider Component

A responsive, accessible image comparison slider built with React, TypeScript, Tailwind CSS, and Framer Motion. Perfect for showing "before and after" pet grooming results.

## Features

- 🎯 **Mouse & Touch Support**: Drag the handle with mouse or touch gestures
- ⌨️ **Keyboard Accessible**: Use arrow keys for precise control
- ✨ **Smooth Animations**: Framer Motion powered transitions
- 📱 **Responsive Design**: Works perfectly on mobile devices
- 🎨 **Customizable**: Labels, positions, animations, and more
- 🔍 **Scroll Reveal**: Optional animation when component enters view
- ♿ **Accessibility**: Full ARIA support for screen readers

## Installation

The component is ready to use in the PetPark project. It requires:
- React 19+
- TypeScript
- Tailwind CSS
- Framer Motion 12+
- Lucide React (for icons)

## Basic Usage

```tsx
import ImageComparisonSlider from "@/components/animations/image-comparison";

export default function ExamplePage() {
  return (
    <ImageComparisonSlider
      beforeImage="/path/to/before.jpg"
      afterImage="/path/to/after.jpg"
      beforeLabel="Before Grooming"
      afterLabel="After Grooming"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `beforeImage` | `string` | **Required** | URL of the "before" image |
| `afterImage` | `string` | **Required** | URL of the "after" image |
| `beforeLabel` | `string` | `"Prije"` | Label for the before image |
| `afterLabel` | `string` | `"Poslije"` | Label for the after image |
| `initialPosition` | `number` | `50` | Initial slider position (0-100) |
| `revealOnScroll` | `boolean` | `false` | Animate in when component enters viewport |
| `showLabels` | `boolean` | `true` | Show/hide the before/after labels |
| `showHandle` | `boolean` | `true` | Show/hide the draggable handle |
| `className` | `string` | - | Additional CSS classes for styling |

## Advanced Examples

### With Scroll Reveal Animation
```tsx
<ImageComparisonSlider
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
  beforeLabel="Unkempt"
  afterLabel="Groomed"
  revealOnScroll={true}
/>
```

### Custom Initial Position
```tsx
<ImageComparisonSlider
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
  initialPosition={25} // Shows 75% of after image
/>
```

### Minimal Version
```tsx
<ImageComparisonSlider
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
  showLabels={false}
  className="max-w-2xl"
/>
```

## Styling

The component uses Tailwind CSS classes and can be customized with the `className` prop:

```tsx
<ImageComparisonSlider
  beforeImage="/before.jpg"
  afterImage="/after.jpg"
  className="rounded-3xl shadow-2xl border-4 border-white"
/>
```

## Accessibility

The component includes:
- `role="slider"` with proper ARIA attributes
- Keyboard navigation (arrow keys)
- Screen reader announcements
- Focus indicators
- Touch target sizing for mobile

## Testing

A test page is available at `/test-image-comparison` that demonstrates all features.

## Implementation Details

### Technical Stack
- **React**: Component architecture and hooks
- **TypeScript**: Type safety and prop definitions
- **Framer Motion**: Smooth animations and gestures
- **Tailwind CSS**: Responsive styling
- **Lucide React**: Handle icons

### Key Hooks Used
- `useState`: Component state management
- `useRef`: DOM element references
- `useEffect`: Side effects and cleanup
- `useMotionValue`: Animation values
- `useSpring`: Spring physics for smooth motion
- `useTransform`: Value transformations

### Event Handling
- Mouse events: `onMouseDown`, `onMouseMove`, `onMouseUp`
- Touch events: `onTouchStart`, `onTouchMove`, `onTouchEnd`
- Keyboard events: `onKeyDown` for arrow keys

## Browser Support

The component works in all modern browsers that support:
- CSS Grid and Flexbox
- ES6+ JavaScript
- Touch events (for mobile)

## Performance

- Lazy loading of images (handled by Next.js Image component if used)
- Efficient re-renders with React memoization patterns
- Smooth 60fps animations with Framer Motion
- Optimized for mobile devices

## License

Part of the PetPark project.