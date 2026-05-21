import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="section-wrap py-20">
      <Skeleton className="h-5 w-24 mb-3" />
      <Skeleton className="h-16 w-2/3 mb-5" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-4/5 mb-12" />
      <Skeleton className="h-[500px] w-full rounded-3xl mb-16" />
      <div className="grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-2xl" />)}
      </div>
    </div>
  );
}
