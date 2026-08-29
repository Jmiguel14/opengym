import { Card, Skeleton } from "@/components/ui";

export default function NewProductLoading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading</span>
      <Skeleton className="mb-2 h-4 w-36" />
      <Skeleton className="mb-6 h-8 w-48" />
      <Card className="max-w-xl space-y-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-28" />
      </Card>
    </div>
  );
}
