import { SkeletonGrid, SkeletonText } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted rounded mb-4 animate-pulse" />
          <SkeletonText lines={2} />
        </div>

        {/* Content grid skeleton */}
        <SkeletonGrid count={6} />
      </div>
    </div>
  );
}
