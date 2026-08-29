import { Card, Skeleton } from "@/components/ui";

export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <div className="mb-6 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Card key={i}>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-3 h-8 w-20" />
            <Skeleton className="mt-2 h-3 w-32" />
          </Card>
        ))}
      </div>
      <Card className="mt-6 overflow-hidden p-0">
        <div className="space-y-0">
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-border/50 px-4 py-3 last:border-0"
            >
              <Skeleton className="h-4 w-40" />
              <Skeleton className="ml-auto h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
