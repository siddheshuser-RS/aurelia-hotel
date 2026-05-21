import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsLoading() {
  return (
    <section className="section-wrap py-20">
      <Skeleton className="h-5 w-24 mb-3" />
      <Skeleton className="h-12 w-72 mb-3" />
      <Skeleton className="h-4 w-96 mb-10" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl">
            <Skeleton className="h-64 w-full" />
            <div className="p-5 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
