export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-slate-200 rounded-lg" />
          <div className="h-4 w-80 bg-slate-100 rounded" />
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-lg" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm space-y-3">
            <div className="h-3 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-28 bg-slate-200 rounded" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-100 rounded-lg" />
        </div>
        <div className="space-y-4">
          <div className="bg-slate-200 rounded-xl h-36" />
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm h-24 p-4 space-y-2">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-6 w-32 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
        <div className="h-5 w-48 bg-slate-200 rounded" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 w-20 bg-slate-100 rounded" />
            <div className="h-4 flex-1 bg-slate-100 rounded" />
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-4 w-16 bg-slate-100 rounded" />
            <div className="h-6 w-20 bg-slate-200 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
