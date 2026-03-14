import { Skeleton } from "@/components/smartor/skeleton";

export default function Loading() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 md:px-8 lg:py-12">
      <Skeleton className="h-56 w-full rounded-[32px]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-[32px]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-[30rem] w-full rounded-[32px]" />
        <Skeleton className="h-[30rem] w-full rounded-[32px]" />
      </div>
    </main>
  );
}
