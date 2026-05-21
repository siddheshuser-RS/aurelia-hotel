import { Skeleton } from "@/components/ui/skeleton";

export default function GalleryLoading() {
  return (
    <section className="section-wrap py-20">
      <Skeleton className="h-5 w-28 mb-3" />
      <Skeleton className="h-12 w-64 mb-3" />
      <Skeleton className="h-4 w-80 mb-8" />
      <div className="flex gap-2 mb-8 flex-wrap">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="columns-1 gap-4 md:columns-2 lg:columns-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Skeleton key={i} className={`mb-4 w-full break-inside-avoid rounded-2xl ${i % 3 === 0 ? "h-72" : i % 3 === 1 ? "h-52" : "h-64"}`} />
        ))}
      </div>
    </section>
  );
}
