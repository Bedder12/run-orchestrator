export function RunCardSkeleton() {
  return (
    <div className="block p-4 rounded-lg border border-border bg-card animate-pulse">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-5 w-40 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded-full" />
          </div>
          <div className="h-4 w-3/4 bg-muted rounded" />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <div className="h-4 w-16 bg-muted rounded mb-1" />
            <div className="h-3 w-20 bg-muted rounded" />
          </div>
          <div className="h-4 w-4 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
