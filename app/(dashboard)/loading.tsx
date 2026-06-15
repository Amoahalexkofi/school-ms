export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 animate-pulse">
      {/* Topbar skeleton */}
      <div className="bg-[#111318] border-b px-6 py-3 flex items-center justify-between">
        <div className="h-5 w-40 bg-white/[0.06] rounded" />
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 bg-white/[0.06] rounded-full" />
          <div className="h-8 w-8 bg-white/[0.06] rounded-full" />
        </div>
      </div>

      <main className="flex-1 p-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111318] rounded-xl border p-4 space-y-2">
              <div className="h-3 w-20 bg-white/[0.06] rounded" />
              <div className="h-8 w-16 bg-white/[0.06] rounded" />
            </div>
          ))}
        </div>

        {/* Toolbar skeleton */}
        <div className="flex gap-3">
          <div className="h-9 w-56 bg-white/[0.06] rounded-lg" />
          <div className="h-9 w-36 bg-white/[0.06] rounded-lg" />
          <div className="h-9 w-28 bg-white/[0.06] rounded-lg ml-auto" />
        </div>

        {/* Table skeleton */}
        <div className="bg-[#111318] rounded-xl border overflow-hidden">
          <div className="bg-[#0f1015] border-b px-4 py-3 grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-white/[0.06] rounded" />
            ))}
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-3.5 border-b last:border-0 grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="h-3 bg-white/[0.04] rounded" style={{ width: `${60 + Math.random() * 40}%` }} />
              ))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
