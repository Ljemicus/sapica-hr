export default function Loading() {
  return (
    <div className="concept-zero">
      {/* Hero skeleton */}
      <div className="forum-hero-gradient">
        <div className="container mx-auto px-6 md:px-10 lg:px-16 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center space-y-5">
            <div className="h-4 w-24 bg-warm-orange/20 rounded-full mx-auto animate-shimmer" />
            <div className="h-12 w-3/4 bg-foreground/5 rounded-2xl mx-auto animate-shimmer" />
            <div className="h-5 w-2/3 bg-foreground/5 rounded-xl mx-auto animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-6 md:px-10 lg:px-16 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="forum-topic-card p-6">
                <div className="flex gap-4">
                  <div className="h-11 w-11 rounded-full bg-foreground/5 animate-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-3 w-20 bg-foreground/5 rounded-full animate-shimmer" />
                    <div className="h-5 w-3/4 bg-foreground/5 rounded-lg animate-shimmer" />
                    <div className="h-4 w-full bg-foreground/5 rounded-lg animate-shimmer" />
                    <div className="h-3 w-1/3 bg-foreground/5 rounded-full animate-shimmer" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-6">
            <div className="forum-sidebar-panel p-6 space-y-4">
              <div className="h-3 w-20 bg-foreground/5 rounded-full animate-shimmer" />
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-foreground/5 animate-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-full bg-foreground/5 rounded-lg animate-shimmer" />
                    <div className="h-3 w-1/2 bg-foreground/5 rounded-full animate-shimmer" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
