export function TableSkeleton({ rows = 8 }: { rows?: number }): React.JSX.Element {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-12 animate-pulse rounded-lg bg-stone-200" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-10 w-24 animate-pulse rounded-md bg-stone-200" />
        ))}
      </div>
      <div className="overflow-hidden rounded-lg border border-stone-300">
        <div className="h-10 bg-stone-100" />
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 border-b border-stone-200 px-3 py-3">
            <div className="size-9 animate-pulse rounded-md bg-stone-200" />
            <div className="h-4 w-40 animate-pulse rounded bg-stone-200" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-stone-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
