const Block = ({ className = "" }) => (
  <div className={`animate-pulse bg-white/10 ${className}`} />
);

export default function DetailsSkeleton() {
  return (
    <div className="bg-black min-h-screen">
      {/* Backdrop */}
      <div className="relative w-full h-[45vh] overflow-hidden">
        <Block className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 -mt-40 relative z-10 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <Block className="w-56 md:w-72 aspect-[2/3] rounded-xl flex-shrink-0" />

          {/* Details */}
          <div className="flex-1 pt-2 md:pt-32">
            <Block className="h-10 md:h-12 w-3/4 rounded-md mb-3" />
            <Block className="h-4 w-1/2 rounded mb-4" />

            {/* Info row */}
            <div className="flex items-center gap-4 mb-5">
              <Block className="h-8 w-24 rounded-full" />
              <Block className="h-4 w-14 rounded" />
              <Block className="h-6 w-20 rounded-full" />
            </div>

            {/* Genre pills */}
            <div className="flex gap-2 mb-6">
              <Block className="h-7 w-20 rounded-full" />
              <Block className="h-7 w-24 rounded-full" />
              <Block className="h-7 w-16 rounded-full" />
            </div>

            {/* Runtime card */}
            <Block className="h-14 w-36 rounded-lg mb-6" />

            {/* Overview */}
            <Block className="h-4 w-24 rounded mb-3" />
            <div className="space-y-2.5">
              <Block className="h-4 w-full rounded" />
              <Block className="h-4 w-full rounded" />
              <Block className="h-4 w-5/6 rounded" />
              <Block className="h-4 w-2/3 rounded" />
            </div>

            {/* Button */}
            <Block className="h-12 w-44 rounded-full mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}