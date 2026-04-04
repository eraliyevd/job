export default function DashboardLoading() {
  return (
    <div className="container-app py-10 max-w-7xl">
      <div className="flex justify-between items-center mb-7">
        <div className="space-y-2">
          <div className="skeleton h-7 w-48 rounded-xl" />
          <div className="skeleton h-4 w-36 rounded-lg" />
        </div>
        <div className="skeleton h-10 w-36 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="skeleton w-9 h-9 rounded-xl mb-3" />
            <div className="skeleton h-7 w-16 rounded-lg mb-1" />
            <div className="skeleton h-3 w-24 rounded" />
          </div>
        ))}
      </div>
      <div className="card h-64" />
    </div>
  );
}
