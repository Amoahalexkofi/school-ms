// Dashboard skeleton — the same shapes the data will fill, so the wait on a
// slow connection reads as "loading" rather than "broken". Pure CSS pulse,
// honors prefers-reduced-motion via Tailwind's animate-pulse (motion-safe).
function Block({ className }: { className?: string }) {
  return <div className={`bg-slate-200/70 rounded ${className ?? ""}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      {/* topbar stand-in */}
      <div className="h-[57px] bg-white border-b border-slate-200" />
      <main className="flex-1 px-4 py-7 md:p-8 max-w-[1400px] mx-auto w-full space-y-7 motion-safe:animate-pulse">
        {/* welcome */}
        <div className="space-y-2.5">
          <Block className="h-6 w-56" />
          <Block className="h-4 w-80" />
        </div>
        {/* KPI row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <Block className="h-3.5 w-28" />
              <Block className="h-8 w-32" />
              <Block className="h-3 w-20" />
            </div>
          ))}
        </div>
        {/* attendance + fees */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <Block className="h-4 w-40" />
            <Block className="h-24 w-full" />
            <Block className="h-12 w-full" />
          </div>
          <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
            <Block className="h-4 w-32" />
            <Block className="h-12 w-28" />
            <Block className="h-2 w-full" />
            <Block className="h-20 w-full" />
          </div>
        </div>
        {/* charts */}
        <div className="grid grid-cols-12 gap-4">
          {[0, 1].map(i => (
            <div key={i} className="col-span-12 lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 space-y-4">
              <Block className="h-4 w-36" />
              <Block className="h-44 w-full" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
