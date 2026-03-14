import { Skeleton } from "@/components/smartor/skeleton";

type HospitalTabSkeletonVariant = "overview" | "operations" | "scheduling" | "coordination";

type HospitalTabSkeletonProps = {
  variant: HospitalTabSkeletonVariant;
};

export function HospitalTabSkeleton({ variant }: HospitalTabSkeletonProps) {
  if (variant === "operations") {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
          <Skeleton className="h-[26rem] w-full rounded-3xl" />
          <div className="space-y-5">
            <Skeleton className="h-[12.2rem] w-full rounded-3xl" />
            <Skeleton className="h-[12.2rem] w-full rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "scheduling") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-[20rem] w-full rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[15rem] w-full rounded-3xl" />
          <Skeleton className="h-[15rem] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (variant === "coordination") {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[14rem] w-full rounded-3xl" />
          <Skeleton className="h-[14rem] w-full rounded-3xl" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Skeleton className="h-[10rem] w-full rounded-3xl" />
          <Skeleton className="h-[10rem] w-full rounded-3xl" />
          <Skeleton className="h-[10rem] w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64 rounded-2xl" />
        <Skeleton className="h-5 w-full max-w-3xl rounded-2xl" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 w-full rounded-3xl" />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Skeleton className="h-[18rem] w-full rounded-3xl" />
        <Skeleton className="h-[18rem] w-full rounded-3xl" />
      </div>
    </div>
  );
}
