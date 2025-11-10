export function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Ładowanie ofert">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-lg shadow-md p-4 animate-pulse"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-200 rounded-full" />

            <div className="flex-shrink-0 w-20 h-12 bg-gray-200 rounded" />

            <div className="flex-1 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>

            <div className="flex-shrink-0 w-12">
              <div className="h-8 bg-gray-200 rounded" />
            </div>
          </div>

          <div className="flex gap-2 mt-3 ml-14">
            <div className="h-6 bg-gray-200 rounded-full w-20" />
            <div className="h-6 bg-gray-200 rounded-full w-24" />
            <div className="h-6 bg-gray-200 rounded-full w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
