export default function CarDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-5">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Image skeleton */}
        <div className="lg:col-span-3">
          <div className="aspect-[16/10] bg-gray-200 rounded-xl" />
          <div className="hidden sm:flex gap-2 mt-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-[72px] h-[50px] bg-gray-200 rounded-lg flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
            <div className="h-6 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-1/2 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded-xl" />
            <div className="p-4 bg-gray-100 rounded-xl space-y-2">
              <div className="h-8 w-2/3 bg-gray-200 rounded" />
              <div className="h-4 w-1/2 bg-gray-200 rounded" />
            </div>
            <div className="h-12 bg-gray-200 rounded-xl" />
            <div className="h-12 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Specs skeleton */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-baseline gap-1">
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="flex-1 border-b border-dotted border-gray-200" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
