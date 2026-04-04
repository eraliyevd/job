export default function JobsLoading() {
  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <div className="skeleton h-8 w-48 rounded-xl mb-2" />
        <div className="skeleton h-12 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="card p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="skeleton w-11 h-11 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 rounded-lg w-3/4" />
                <div className="skeleton h-3 rounded-lg w-1/2" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="skeleton h-5 rounded-full w-20" />
              <div className="skeleton h-5 rounded-full w-24" />
            </div>
            <div className="skeleton h-px rounded" />
            <div className="flex justify-between">
              <div className="skeleton h-4 rounded-lg w-24" />
              <div className="skeleton h-4 rounded-lg w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
