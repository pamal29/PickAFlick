import Skeleton from "./Skeleton";

export default function PosterCardSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <Skeleton className="mt-1 h-3 w-1/3" />
    </div>
  );
}