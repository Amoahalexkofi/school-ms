import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/services/dashboard";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import {
  ArrowRight, Users, UserCog, Banknote, TrendingDown,
  ClipboardList, DollarSign, BookOpen, BarChart2, UserPlus,
  ArrowUpRight, Minus,
} from "lucide-react";
import Link from "next/link";

/* ─── tiny sparkline ─────────────────────────────────────────────────────── */
function Spark({ data, color }: { data: number[]; color: string }) {
  if (!data?.length) return null;
  const w = 72, h = 28;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 4) + 2;
    const y = h - 4 - ((v - min) / range) * (h - 8);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ─── arc gauge ──────────────────────────────────────────────────────────── */
function ArcGauge({ pct, size = 120 }: { pct: number; size?: number }) {
  const stroke = 10, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const start = 135, span = 270;
  function arc(from: number, to: number) {
    const sx = cx + r * Math.cos(toRad(from)), sy = cy + r * Math.sin(toRad(from));
    const ex = cx + r * Math.cos(toRad(to)),   ey = cy + r * Math.sin(toRad(to));
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }
  const color = pct >= 90 ? "#10b981" : pct >= 70 ? "#3b82f6" : pct >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={arc(start, start + span)} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} strokeLinecap="round" />
        {pct > 0 && (
          <path
            d={arc(start, start + Math.max((pct / 100) * span, 5))}
            fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
        <span className="text-2xl font-black text-white tabular-nums leading-none" style={{ color }}>{pct}%</span>
        <span className="text-[10px] text-white/30 mt-0.5 font-medium">present</span>
      </div>
    </div>
  );
}

/* ─── KPI card ───────────────────────────────────────────────────────────── */
function KpiCard({
  label, value, sub, href, accent, sparkData, sparkColor, delta,
}: {
  label: string; value: string | number; sub?: string; href?: string;
  accent: string; sparkData?: number[]; sparkColor?: string; delta?: number | null;
}) {
  const inner = (
    <div className="relative bg-[#111318] border border-white/[0.06] rounded-xl p-5 h-full flex flex-col justify-between gap-4 overflow-hidden hover:border-white/[0.1] transition-colors group">
      <div>
        <p className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.06em] mb-3">{label}</p>
        <p className="text-[32px] font-black text-white leading-none tabular-nums tracking-tight">{value}</p>
        {sub && <p className="text-[11px] text-white/25 mt-1.5">{sub}</p>}
      </div>
      <div className="flex items-end justify-between gap-2">
        {sparkData && sparkColor ? (
          <Spark data={sparkData} color={sparkColor} />
        ) : <span />}
        <div className="flex items-center gap-1.5 ml-auto">
          {typeof delta === "number" && delta !== 0 && (
            <span className={`text-[11px] font-semibold ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {delta > 0 ? "+" : ""}{delta}%
            </span>
          )}
          {href && (
            <ArrowUpRight className="h-3.5 w-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
          )}
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : <div className="h-full">{inner}</div>;
}

/* ─── section header ─────────────────────────────────────────────────────── */
function SectionHead({ title, href, sub }: { title: string; href?: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h2 className="text-[13px] font-semibold text-white/70">{title}</h2>
        {sub && <p className="text-[11px] text-white/25 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="text-[11px] text-emerald-400/70 hover:text-emerald-400 font-medium flex items-center gap-0.5 transition-colors">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

/* ─── page ───────────────────────────────────────────────────────────────── */
export default async function DashboardPage() {
  const session = await auth();
  const role    = (session?.user as any)?.role;
  if (role === "STUDENT") redirect("/my-results");
  if (role === "PARENT")  redirect("/parent/results");

  const [stats, db] = await Promise.all([
    getDashboardStats().catch(() => null),
    getDb().catch(() => null),
  ]);

  const profile = db
    ? await (db as any).schoolProfile.findFirst({ select: { name: true, currency: true } }).catch(() => null)
    : null;

  const schoolName   = profile?.name ?? "Your School";
  const currency     = profile?.currency ?? "";
  const totalStaff   = Object.values(stats?.staffByRole ?? {}).reduce((a: number, b) => a + (b as number), 0);
  const teacherCount = (stats?.staffByRole?.["TEACHER"] ?? 0) as number;
  const attTotal     = stats?.studentAttendance?.total ?? 0;
  const attPct       = (v: number) => attTotal > 0 ? Math.round((v / attTotal) * 100) : 0;
  const presentPct   = attPct(stats?.studentAttendance?.present ?? 0);
  const feesTotal    = stats?.feesTotal ?? 0;
  const feesPaidPct  = feesTotal > 0 ? Math.round(((stats?.feesPaid ?? 0) / feesTotal) * 100) : 0;

  const now      = new Date();
  const dayLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="flex flex-col flex-1 bg-[#0a0b0f] min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 p-5 md:p-6 max-w-[1440px] w-full mx-auto space-y-5">

        {/* ── Header row ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">{schoolName}</h1>
            <p className="text-[12px] text-white/25 mt-0.5">{dayLabel}</p>
          </div>
          {stats?.currentSession && (
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              {stats.currentSession}
            </span>
          )}
        </div>

        {/* ── KPI row ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <KpiCard
            label="Students enrolled" value={stats?.totalStudents ?? 0}
            sub="current session" href="/students"
            accent="blue" sparkData={[62,58,71,68,75,70,72]} sparkColor="#3b82f6"
          />
          <KpiCard
            label="Teachers / Staff" value={`${teacherCount} / ${totalStaff}`}
            sub="active employees" href="/staff"
            accent="violet"
          />
          <KpiCard
            label="Fees collected" value={`${currency}${(stats?.monthCollection ?? 0).toLocaleString()}`}
            sub="this month" href="/fees/collect"
            accent="emerald" sparkData={stats?.sparklines?.fees} sparkColor="#10b981"
          />
          <KpiCard
            label="Expenses" value={`${currency}${(stats?.monthExpense ?? 0).toLocaleString()}`}
            sub="this month" href="/finance"
            accent="rose" sparkData={stats?.sparklines?.expenses} sparkColor="#f43f5e"
          />
        </div>

        {/* ── Main content ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Attendance (5 cols) */}
          <div className="col-span-12 lg:col-span-5 bg-[#111318] border border-white/[0.06] rounded-xl p-5">
            <SectionHead title="Attendance" sub="Today's summary" href="/attendance" />

            {attTotal === 0 ? (
              <div className="flex flex-col items-center py-8 text-center">
                <ClipboardList className="h-8 w-8 text-white/[0.08] mb-3" />
                <p className="text-[13px] font-semibold text-white/30">Not marked today</p>
                <p className="text-[11px] text-white/15 mt-1 mb-4">Take attendance to see the summary</p>
                <Link href="/attendance" className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:bg-emerald-500/15 transition-colors">
                  <ClipboardList className="h-3 w-3" /> Mark now
                </Link>
              </div>
            ) : (
              <div className="flex gap-6 items-start">
                <ArcGauge pct={presentPct} size={110} />
                <div className="flex-1 space-y-2 pt-1 min-w-0">
                  {[
                    { label: "Present",  v: stats?.studentAttendance?.present ?? 0,  pct: attPct(stats?.studentAttendance?.present ?? 0),  color: "bg-emerald-500" },
                    { label: "Absent",   v: stats?.studentAttendance?.absent ?? 0,   pct: attPct(stats?.studentAttendance?.absent ?? 0),   color: "bg-red-500" },
                    { label: "Late",     v: stats?.studentAttendance?.late ?? 0,     pct: attPct(stats?.studentAttendance?.late ?? 0),     color: "bg-amber-500" },
                    { label: "Half day", v: stats?.studentAttendance?.halfDay ?? 0,  pct: attPct(stats?.studentAttendance?.halfDay ?? 0),  color: "bg-blue-500" },
                  ].map(({ label, v, pct: p, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-[11px] text-white/30 w-14 shrink-0">{label}</span>
                      <div className="flex-1 h-1 bg-[#111318]/[0.06] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${p}%` }} />
                      </div>
                      <span className="text-[11px] font-semibold text-white/50 tabular-nums w-6 text-right shrink-0">{v}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/[0.06] flex justify-between">
                    <span className="text-[10px] text-white/20">Total</span>
                    <span className="text-[11px] font-bold text-white/40 tabular-nums">{attTotal}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fee collection (4 cols) */}
          <div className="col-span-12 lg:col-span-4 bg-[#111318] border border-white/[0.06] rounded-xl p-5">
            <SectionHead title="Fee Collection" sub="Current session" href="/fees/collect" />

            <div className="mb-5">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[36px] font-black text-white tabular-nums leading-none">{feesPaidPct}%</span>
                <span className="text-[11px] text-white/25">{feesTotal} invoices</span>
              </div>
              <div className="h-1.5 bg-[#111318]/[0.06] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${feesPaidPct}%` }}
                />
              </div>
              <p className="text-[10px] text-white/20">collected this session</p>
            </div>

            <div className="space-y-0 divide-y divide-white/[0.04]">
              {[
                { label: "Paid",            value: String(stats?.feesPaid ?? 0),  accent: false },
                { label: "Outstanding",     value: String(stats?.feesUnpaid ?? 0), accent: (stats?.feesUnpaid ?? 0) > 0 },
                { label: "This month",      value: `${currency}${(stats?.monthCollection ?? 0).toLocaleString()}`, accent: false },
                { label: "Expenses",        value: `${currency}${(stats?.monthExpense ?? 0).toLocaleString()}`,    accent: false },
              ].map(({ label, value, accent }) => (
                <div key={label} className="flex items-center justify-between py-2.5">
                  <span className="text-[12px] text-white/30">{label}</span>
                  <span className={`text-[12px] font-semibold tabular-nums ${accent ? "text-red-400" : "text-white/60"}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Staff + Library (3 cols) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
            {/* Staff today */}
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5">
              <SectionHead title="Staff today" href="/attendance/staff" />
              <div className="space-y-0 divide-y divide-white/[0.04]">
                {[
                  { label: "Present", v: stats?.staffAttendance?.present ?? 0, color: "text-emerald-400" },
                  { label: "Absent",  v: stats?.staffAttendance?.absent  ?? 0, color: (stats?.staffAttendance?.absent ?? 0) > 0 ? "text-red-400" : "text-white/50" },
                ].map(({ label, v, color }) => (
                  <div key={label} className="flex justify-between items-center py-2.5">
                    <span className="text-[12px] text-white/30">{label}</span>
                    <span className={`text-[13px] font-bold tabular-nums ${color}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Library */}
            <div className="bg-[#111318] border border-white/[0.06] rounded-xl p-5 flex-1">
              <SectionHead title="Library" href="/library" />
              <div className="space-y-0 divide-y divide-white/[0.04]">
                {[
                  { label: "Available", v: stats?.books?.available ?? 0,      color: "text-white/50" },
                  { label: "Issued",    v: stats?.books?.issued ?? 0,          color: "text-white/50" },
                  ...(( stats?.books?.dueForReturn ?? 0) > 0
                    ? [{ label: "Overdue", v: stats?.books?.dueForReturn ?? 0, color: "text-red-400" }]
                    : []),
                ].map(({ label, v, color }) => (
                  <div key={label} className="flex justify-between items-center py-2.5">
                    <span className={`text-[12px] ${label === "Overdue" ? "text-red-400/60" : "text-white/30"}`}>{label}</span>
                    <span className={`text-[13px] font-bold tabular-nums ${color}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Today's payments (8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-[#111318] border border-white/[0.06] rounded-xl p-5">
            <SectionHead
              title="Today's Payments"
              sub={`${stats?.todayPayments?.length ?? 0} transaction${stats?.todayPayments?.length !== 1 ? "s" : ""}`}
              href="/fees/collect"
            />

            {!stats?.todayPayments?.length ? (
              <div className="py-10 flex flex-col items-center text-center">
                <DollarSign className="h-8 w-8 text-white/[0.06] mb-3" />
                <p className="text-[12px] text-white/25">No payments today</p>
                <Link href="/fees/collect" className="mt-3 text-[11px] text-emerald-400/70 hover:text-emerald-400 font-medium transition-colors">
                  Collect a fee →
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_64px_72px] text-[10px] font-semibold uppercase tracking-[0.06em] text-white/20 pb-2 border-b border-white/[0.05] gap-3">
                  <span>Student</span>
                  <span className="text-right">Time</span>
                  <span className="text-right">Amount</span>
                </div>
                <div className="divide-y divide-white/[0.04]">
                  {stats.todayPayments.slice(0, 8).map((p: any, i: number) => (
                    <div key={i} className="grid grid-cols-[1fr_64px_72px] items-center py-2.5 gap-3 hover:bg-[#111318]/[0.02] -mx-1 px-1 rounded transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#111318]/[0.06] flex items-center justify-center shrink-0 text-[9px] font-bold text-white/40">
                          {(p.studentName || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[12px] text-white/60 font-medium truncate">{p.studentName || "—"}</span>
                      </div>
                      <span className="text-[11px] text-white/25 tabular-nums text-right">
                        {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-[12px] font-semibold text-white/60 tabular-nums text-right">
                        {currency}{(p.amount ?? 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                {stats.todayPayments.length > 8 && (
                  <p className="pt-3 text-center text-[11px] text-white/20">
                    +{stats.todayPayments.length - 8} more
                  </p>
                )}
              </>
            )}
          </div>

          {/* Quick actions (4 cols) */}
          <div className="col-span-12 lg:col-span-4 bg-[#111318] border border-white/[0.06] rounded-xl p-5">
            <SectionHead title="Quick actions" />
            <div className="space-y-0.5">
              {[
                { href: "/attendance",   label: "Mark attendance",  icon: ClipboardList, show: ["ADMIN","SUPER_ADMIN","TEACHER"] },
                { href: "/fees/collect", label: "Collect fees",     icon: DollarSign,    show: ["ADMIN","SUPER_ADMIN","ACCOUNTANT"] },
                { href: "/students/new", label: "Add student",      icon: UserPlus,      show: ["ADMIN","SUPER_ADMIN"] },
                { href: "/exam-groups",  label: "Enter exam marks", icon: BookOpen,      show: ["ADMIN","SUPER_ADMIN","TEACHER"] },
                { href: "/staff/new",    label: "Add staff",        icon: UserCog,       show: ["ADMIN","SUPER_ADMIN"] },
                { href: "/reports",      label: "View reports",     icon: BarChart2,     show: [] },
              ]
                .filter(a => !a.show.length || a.show.includes(role))
                .map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href} href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#111318]/[0.04] transition-colors group"
                  >
                    <div className="w-6 h-6 rounded-md bg-[#111318]/[0.05] flex items-center justify-center shrink-0 group-hover:bg-emerald-500/10 transition-colors">
                      <Icon className="h-3.5 w-3.5 text-white/25 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <span className="text-[12px] text-white/40 group-hover:text-white/70 flex-1 transition-colors">{label}</span>
                    <ArrowRight className="h-3 w-3 text-white/10 group-hover:text-white/30 transition-colors" />
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
