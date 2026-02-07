export function CandidateSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 animate-pulse"
        />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 pb-20">
      {/* Header Skeleton */}
      <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />

      {/* Cards Skeleton */}
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"
          />
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    </div>
  );
}
