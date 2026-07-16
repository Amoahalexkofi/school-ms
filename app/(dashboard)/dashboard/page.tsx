import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/services/dashboard";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";
import { isAddonEnabled } from "@/lib/addons";
import { getBranchBreakdown } from "@/lib/services/branches";
import { Topbar } from "@/components/Topbar";
import {
  ArrowRight, AlertCircle, Users, UserCog, Banknote, TrendingDown,
  ClipboardList, DollarSign, BookOpen, BarChart2, UserPlus, Building,
} from "lucide-react";
import Link from "next/link";

// ─── Sparkline — a quiet 7-day line, no axes, no junk ─────────────────────────
function Sparkline({ data, stroke = "#4f46e5" }: { data: number[]; stroke?: string }) {
  if (!data?.length || data.every(v => v === 0)) return null;
  const w = 96, h = 28, pad = 2;
  const max = Math.max(...data), min = Math.min(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (data.length - 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden
      className="w-full max-w-[96px] h-7">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" opacity="0.85"
        vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Month-over-month delta, spoken plainly. Neutral color — a rise in expenses
// is not "good news green", and a quiet dashboard editorializes sparingly.
function monthDelta(current: number, previous: number): string | null {
  if (previous <= 0) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return "level with last month";
  return `${pct > 0 ? "+" : ""}${pct}% vs same time last month`;
}

// ─── Charts — hand-drawn SVG, axes + dashed gridlines, no chart library ──────
function niceMax(v: number) {
  if (v <= 0) return 100;
  const mag = 10 ** Math.floor(Math.log10(v));
  return Math.ceil(v / mag) * mag;
}

function AreaChart({ data, height = 200 }: { data: { label: string; amount: number }[]; height?: number }) {
  const w = 560, h = height, padL = 46, padR = 12, padT = 10, padB = 26;
  const iw = w - padL - padR, ih = h - padT - padB;
  const max = niceMax(Math.max(...data.map(d => d.amount), 1));
  const x = (i: number) => padL + (i * iw) / (data.length - 1);
  const y = (v: number) => padT + ih - (v / max) * ih;
  const pts = data.map((d, i) => `${x(i).toFixed(1)},${y(d.amount).toFixed(1)}`).join(" ");
  const area = `${padL},${padT + ih} ${pts} ${x(data.length - 1)},${padT + ih}`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(f => Math.round(max * f));
  const fmt = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Fee collection by month">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.16" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map(t => (
        <g key={t}>
          <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 4" />
          <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" fill="#64748b" style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(t)}</text>
        </g>
      ))}
      <polygon points={area} fill="url(#areaFill)" />
      <polyline points={pts} fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={d.label + i} x={x(i)} y={h - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
          fontSize="10.5" fill="#64748b">{d.label}</text>
      ))}
    </svg>
  );
}

function BarChart({ data, height = 200 }: { data: { name: string; avg: number }[]; height?: number }) {
  const w = 560, h = height, padL = 40, padR = 12, padT = 10, padB = 26;
  const iw = w - padL - padR, ih = h - padT - padB;
  const max = 100; // scores are percentages
  const band = iw / data.length;
  const barW = Math.min(56, band * 0.62);
  const y = (v: number) => padT + ih - (v / max) * ih;
  const ticks = [0, 25, 50, 75, 100];
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto" role="img" aria-label="Average score by class">
      {ticks.map(t => (
        <g key={t}>
          <line x1={padL} x2={w - padR} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3 4" />
          <text x={padL - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10.5" fill="#64748b" style={{ fontVariantNumeric: "tabular-nums" }}>{t}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const cx = padL + band * i + band / 2;
        return (
          <g key={d.name}>
            <rect x={cx - barW / 2} y={y(d.avg)} width={barW} height={Math.max(2, (d.avg / max) * ih)}
              rx="4" fill="#1e293b" />
            <text x={cx} y={y(d.avg) - 5} textAnchor="middle" fontSize="10" fill="#334155"
              style={{ fontVariantNumeric: "tabular-nums" }} fontWeight="600">{d.avg}</text>
            <text x={cx} y={h - 8} textAnchor="middle" fontSize="10.5" fill="#64748b">{d.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── KPI Card — calm, neutral ─────────────────────────────────────────────────
function KpiCard({
  label, value, sub, href, icon: Icon, spark,
}: {
  label: string; value: string | number; sub?: string; href?: string; icon: React.ElementType; spark?: number[];
}) {
  const inner = (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col
      hover:border-slate-300 hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </div>
      <div className="flex items-end gap-3 mt-4">
        <p className="text-[30px] font-semibold text-slate-900 leading-none tabular-nums tracking-tight whitespace-nowrap">{value}</p>
        {spark && <div className="flex-1 min-w-0 flex justify-end"><Sparkline data={spark} /></div>}
      </div>
      {sub && <p className="text-[12px] text-slate-500 mt-2">{sub}</p>}
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : <div className="h-full">{inner}</div>;
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
function StatRow({ label, value, valueClass = "text-slate-900", bar, barPct }: {
  label: string; value: string | number; valueClass?: string; bar?: string; barPct?: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-[13px] text-slate-500 w-20 shrink-0">{label}</span>
      {bar && (
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden min-w-0">
          <div className={`h-full rounded-full ${bar}`} style={{ width: `${barPct ?? 0}%` }} />
        </div>
      )}
      <span className={`text-[13px] tabular-nums font-semibold ml-auto ${valueClass}`}>{value}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await auth();
  const role    = (session?.user as any)?.role;
  if (role === "STUDENT") redirect("/my-results");
  if (role === "PARENT")  redirect("/parent/results");

  const db      = await getDb().catch(() => null);
  const profile = db ? await (db as any).schoolProfile
    .findFirst({ select: { name: true, currency: true } })
    .catch(() => null) : null;

  let statsError = false;
  const stats   = await getDashboardStats().catch(() => { statsError = true; return null; });

  const schoolName  = profile?.name ?? "Your School";
  const currency    = profile?.currency ?? "";
  const money       = (n: number) => `${currency ? `${currency} ` : ""}${(n ?? 0).toLocaleString()}`;
  const totalStaff  = Object.values(stats?.staffByRole ?? {}).reduce((a: number, b) => a + (b as number), 0);
  const teacherCount = stats?.staffByRole?.["TEACHER"] ?? 0;

  const attTotal   = stats?.studentAttendance?.total ?? 0;
  const attPct     = (v: number) => attTotal > 0 ? Math.round((v / attTotal) * 100) : 0;
  const presentPct = attPct(stats?.studentAttendance?.present ?? 0);
  const feesPaidPct = (stats?.feesTotal ?? 0) > 0
    ? Math.round(((stats?.feesPaid ?? 0) / stats!.feesTotal) * 100) : 0;

  const now      = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dayLabel   = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const monthLabel = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const userName = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "";

  // Multi Branch: when an admin is viewing "All Branches", show a per-branch breakdown.
  const isAdmin       = role === "ADMIN" || role === "SUPER_ADMIN";
  const mbEnabled     = isAdmin ? await isAddonEnabled("multi_branch").catch(() => false) : false;
  const activeBranch  = await getActiveBranchId().catch(() => null);
  const branchRows    = mbEnabled && !activeBranch ? await getBranchBreakdown().catch(() => []) : [];
  const showBreakdown = branchRows.length > 1;
  const branchTotals  = branchRows.reduce(
    (t: any, b: any) => ({ students: t.students + b.students, staff: t.staff + b.staff, collected: t.collected + b.collected }),
    { students: 0, staff: 0, collected: 0 }
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 px-4 py-7 md:p-8 max-w-[1400px] mx-auto w-full space-y-7">

        {/* ── Welcome ── */}
        <div className="dash-rise flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[21px] font-semibold text-slate-900 tracking-tight">
              {greeting}{userName ? `, ${userName.split(" ")[0]}` : ""}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 text-[13px] text-slate-500 flex-wrap">
              <span>{schoolName}</span>
              {stats?.currentSession && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="font-medium text-slate-600">{stats.currentSession}</span>
                </>
              )}
              {stats?.sessionProgress && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="tabular-nums">
                    Week {stats.sessionProgress.week} · {stats.sessionProgress.schoolDaysLeft} school day{stats.sessionProgress.schoolDaysLeft !== 1 ? "s" : ""} to vacation
                  </span>
                </>
              )}
            </div>
          </div>
          <p className="text-[13px] text-slate-500 hidden md:block shrink-0">{dayLabel}</p>
        </div>

        {/* ── All-branches breakdown (head office view) ── */}
        {showBreakdown && (
          <div className="dash-rise bg-white rounded-xl border border-slate-200 overflow-hidden" style={{ animationDelay: "40ms" }}>
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
              <Building className="h-4 w-4 text-slate-400" />
              <h2 className="text-[14px] font-semibold text-slate-900">All branches</h2>
              <span className="text-[12px] text-slate-500">· {branchRows.length} branches</span>
              <span className="ml-auto text-[12px] text-slate-500 hidden sm:block">Select a branch in the sidebar to drill in</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-slate-500 font-medium uppercase tracking-wider border-b border-slate-100">
                    <th className="text-left px-5 py-2.5">Branch</th>
                    <th className="text-right px-4 py-2.5">Students</th>
                    <th className="text-right px-4 py-2.5">Staff</th>
                    <th className="text-right px-4 py-2.5">Collected (mo)</th>
                    <th className="text-right px-5 py-2.5">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {branchRows.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {b.name}
                        {b.isMain && <span className="ml-1.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded">Main</span>}
                      </td>
                      <td className="text-right px-4 py-3 tabular-nums text-slate-700">{b.students}</td>
                      <td className="text-right px-4 py-3 tabular-nums text-slate-700">{b.staff}</td>
                      <td className="text-right px-4 py-3 tabular-nums text-slate-700">{money(b.collected)}</td>
                      <td className="text-right px-5 py-3 tabular-nums text-slate-700">{b.attendancePct != null ? `${b.attendancePct}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50 font-semibold text-slate-900">
                    <td className="px-5 py-3">Total</td>
                    <td className="text-right px-4 py-3 tabular-nums">{branchTotals.students}</td>
                    <td className="text-right px-4 py-3 tabular-nums">{branchTotals.staff}</td>
                    <td className="text-right px-4 py-3 tabular-nums">{money(branchTotals.collected)}</td>
                    <td className="px-5 py-3" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {statsError ? (
          /* A failed fetch is not an empty school — never send someone to
             "fix" a healthy config over a network blip. */
          <div className="bg-white rounded-xl border border-slate-200 border-dashed py-20 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">Couldn&apos;t load the dashboard</p>
            <p className="text-sm text-slate-500 mt-1">Check your connection — your data is safe.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-1 mt-4 text-sm text-indigo-600 font-semibold hover:underline">
              Retry <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : !stats ? (
          <div className="bg-white rounded-xl border border-slate-200 border-dashed py-20 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">No data yet</p>
            <p className="text-sm text-slate-500 mt-1">Create an active academic session to populate the dashboard.</p>
            <Link href="/settings" className="inline-flex items-center gap-1 mt-4 text-sm text-indigo-600 font-semibold hover:underline">
              Go to Settings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="dash-rise grid grid-cols-2 xl:grid-cols-4 gap-4" style={{ animationDelay: "70ms" }}>
              <KpiCard
                label="Students enrolled" value={stats.totalStudents}
                sub="Current session" href="/students" icon={Users}
              />
              <KpiCard
                label="Teachers" value={teacherCount}
                sub={`of ${totalStaff} total staff`} href="/staff" icon={UserCog}
              />
              <KpiCard
                label="Collected this month" value={money(stats.monthCollection ?? 0)}
                sub={monthDelta(stats.monthCollection ?? 0, stats.lastMonthCollection ?? 0) ?? monthLabel}
                href="/fees" icon={Banknote} spark={stats.sparklines?.fees}
              />
              <KpiCard
                label="Expenses this month" value={money(stats.monthExpense ?? 0)}
                sub={monthDelta(stats.monthExpense ?? 0, stats.lastMonthExpense ?? 0) ?? monthLabel}
                href="/finance" icon={TrendingDown} spark={stats.sparklines?.expenses}
              />
            </div>

            {/* ── Attendance + Fees ── */}
            <div className="dash-rise grid grid-cols-12 gap-4" style={{ animationDelay: "140ms" }}>

              {/* Attendance */}
              <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">Student attendance</h2>
                    <p className="text-[12px] text-slate-500 mt-0.5">Today's summary</p>
                  </div>
                  <Link href="/attendance"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    <ClipboardList className="h-3.5 w-3.5" /> Mark
                  </Link>
                </div>

                {attTotal === 0 ? (
                  <div className="py-8 flex flex-col items-center text-center">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                      <ClipboardList className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-[14px] font-medium text-slate-600">Not marked today</p>
                    <p className="text-[13px] text-slate-500 mt-1 mb-4">Take attendance to see today's breakdown.</p>
                    <Link href="/attendance"
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
                      Mark now
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start gap-8">
                    {/* Present headline */}
                    <div className="shrink-0">
                      <p className="text-[44px] font-semibold text-slate-900 leading-none tabular-nums tracking-tight">{presentPct}%</p>
                      <p className="text-[12px] text-slate-500 mt-2">present today</p>
                      <p className="text-[12px] text-slate-500 mt-0.5">{attTotal} students marked</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      {[
                        { label: "Present",  v: stats.studentAttendance.present,  bar: "bg-emerald-500" },
                        { label: "Absent",   v: stats.studentAttendance.absent,   bar: "bg-rose-400" },
                        { label: "Late",     v: stats.studentAttendance.late,     bar: "bg-amber-400" },
                        { label: "Half day", v: stats.studentAttendance.halfDay,  bar: "bg-slate-400" },
                      ].map(({ label, v, bar }) => (
                        <StatRow key={label} label={label} value={v} bar={bar} barPct={attPct(v)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Which sections haven't marked today — the head's chase list */}
                {isAdmin && stats.unmarkedSections?.length > 0 && attTotal > 0 && (
                  <div className="mt-4 flex items-start gap-2 text-[12.5px] bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-px" />
                    <span className="text-amber-800">
                      Not marked today:{" "}
                      <span className="font-semibold">{stats.unmarkedSections.slice(0, 4).join(", ")}</span>
                      {stats.unmarkedSections.length > 4 && ` +${stats.unmarkedSections.length - 4} more`}
                      {" — "}
                      <Link href="/attendance" className="underline underline-offset-2 hover:text-amber-900">remind or mark now</Link>
                    </span>
                  </div>
                )}

                {/* 10-day trend — % present per marked school day */}
                {stats.attendanceTrend?.length > 1 && (
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2.5">
                      <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Last {stats.attendanceTrend.length} school days</p>
                      <p className="text-[11px] text-slate-500 tabular-nums">% present</p>
                    </div>
                    <div className="flex items-end gap-1.5 h-12">
                      {stats.attendanceTrend.map((d: any, i: number) => {
                        const isLast = i === stats.attendanceTrend.length - 1;
                        return (
                          <div key={d.date} className="flex-1 flex flex-col items-center justify-end h-full gap-1"
                            title={`${new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} — ${d.pct}% present`}>
                            <span className={`text-[9.5px] tabular-nums leading-none ${isLast ? "text-indigo-600 font-semibold" : "text-slate-400"}`}>{d.pct}</span>
                            <div className={`w-full rounded-sm ${isLast ? "bg-indigo-600" : "bg-slate-200"}`}
                              style={{ height: `${Math.max(6, d.pct * 0.6)}%` }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Fee Collection */}
              <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">Fee collection</h2>
                    <p className="text-[12px] text-slate-500 mt-0.5">Current session</p>
                  </div>
                  <Link href="/fees"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    <DollarSign className="h-3.5 w-3.5" /> Collect
                  </Link>
                </div>

                <div className="mb-5">
                  <div className="flex items-end justify-between mb-2.5">
                    <span className="text-[40px] font-semibold text-slate-900 leading-none tabular-nums tracking-tight">{feesPaidPct}%</span>
                    <span className="text-[12px] text-slate-500 mb-1">{stats.feesPaid + stats.feesUnpaid} invoices</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${feesPaidPct}%` }} />
                  </div>
                  <p className="text-[12px] text-slate-500 mt-2">collected this session</p>
                </div>

                <div className="flex-1">
                  {[
                    { label: "Paid invoices", value: String(stats.feesPaid),   vc: "text-slate-900" },
                    { label: "Outstanding",   value: String(stats.feesUnpaid), vc: stats.feesUnpaid > 0 ? "text-rose-600" : "text-slate-900" },
                    { label: "Last payment",
                      value: stats.todayPayments.length > 0
                        ? `${new Date(stats.todayPayments[0].createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} · ${money(stats.todayPayments[0].amount ?? 0)}`
                        : "None today",
                      vc: "text-slate-900" },
                  ].map(({ label, value, vc }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                      <span className="text-[13px] text-slate-500">{label}</span>
                      <span className={`text-[13px] font-semibold tabular-nums ${vc}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Trend charts ── */}
            {(stats.monthlyCollections?.some((m: any) => m.amount > 0) || stats.classAverages?.length > 0) && (
              <div className="dash-rise grid grid-cols-12 gap-4" style={{ animationDelay: "175ms" }}>
                {stats.monthlyCollections?.some((m: any) => m.amount > 0) && (
                  <div className={`col-span-12 ${stats.classAverages?.length > 0 ? "lg:col-span-6" : ""} bg-white rounded-xl border border-slate-200 p-5`}>
                    <div className="mb-4">
                      <h2 className="text-[15px] font-semibold text-slate-900">Monthly revenue</h2>
                      <p className="text-[12px] text-slate-500 mt-0.5">Fee collection trend{currency ? ` (${currency})` : ""} · last 6 months</p>
                    </div>
                    <AreaChart data={stats.monthlyCollections} />
                  </div>
                )}
                {stats.classAverages?.length > 0 && (
                  <div className={`col-span-12 ${stats.monthlyCollections?.some((m: any) => m.amount > 0) ? "lg:col-span-6" : ""} bg-white rounded-xl border border-slate-200 p-5`}>
                    <div className="mb-4">
                      <h2 className="text-[15px] font-semibold text-slate-900">Student performance</h2>
                      <p className="text-[12px] text-slate-500 mt-0.5">Average score by class · current session</p>
                    </div>
                    <BarChart data={stats.classAverages} />
                  </div>
                )}
              </div>
            )}

            {/* ── Payments + Side column ── */}
            <div className="dash-rise grid grid-cols-12 gap-4" style={{ animationDelay: "210ms" }}>

              {/* Recent payments */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">Today's payments</h2>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {stats.todayPayments.length} transaction{stats.todayPayments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href="/fees"
                    className="text-[12px] text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-0.5 transition-colors">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {stats.todayPayments.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center mb-3">
                      <DollarSign className="h-5 w-5 text-slate-300" />
                    </div>
                    <p className="text-[14px] font-medium text-slate-500">No payments yet today</p>
                    <Link href="/fees" className="mt-2 text-[13px] text-indigo-600 font-medium hover:underline">
                      Collect a fee →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_72px_80px] text-[11px] text-slate-500 font-medium uppercase tracking-wider pb-2 border-b border-slate-100 gap-4">
                      <span>Student</span>
                      <span className="text-right">Time</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {stats.todayPayments.slice(0, 8).map((p: any, i: number) => (
                        <div key={i} className="grid grid-cols-[1fr_72px_80px] items-center py-3 gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[10px] font-semibold text-slate-500">
                              {(p.studentName || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()}
                            </div>
                            <span className="text-[13px] text-slate-800 font-medium truncate">{p.studentName || "—"}</span>
                          </div>
                          <span className="text-[12px] text-slate-500 tabular-nums text-right">
                            {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-[13px] font-semibold text-slate-900 tabular-nums text-right">
                            {money(p.amount ?? 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                    {stats.todayPayments.length > 8 && (
                      <div className="pt-3 text-center">
                        <Link href="/fees" className="text-[12px] text-slate-500 hover:text-indigo-600 transition-colors font-medium">
                          + {stats.todayPayments.length - 8} more payments today
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Side column */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

                {/* Quick actions */}
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-[13px] font-semibold text-slate-900 mb-3">Quick actions</h2>
                  <div className="space-y-0.5">
                    {[
                      { href: "/attendance",   label: "Mark attendance",  show: ["ADMIN","SUPER_ADMIN","TEACHER"],    icon: ClipboardList },
                      { href: "/fees", label: "Collect fees",     show: ["ADMIN","SUPER_ADMIN","ACCOUNTANT"], icon: DollarSign },
                      { href: "/students/new", label: "Add student",      show: ["ADMIN","SUPER_ADMIN"],              icon: UserPlus },
                      { href: "/exam-groups",  label: "Enter marks",      show: ["ADMIN","SUPER_ADMIN","TEACHER"],    icon: BookOpen },
                      { href: "/staff/new",    label: "Add staff",        show: ["ADMIN","SUPER_ADMIN"],              icon: UserCog },
                      { href: "/reports",      label: "Reports",          show: [],                                   icon: BarChart2 },
                    ].filter(a => a.show.length === 0 || a.show.includes(role)).map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}
                        className="flex items-center gap-2.5 py-2 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group">
                        <Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
                        <span className="text-[13px] text-slate-700 flex-1">{label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Outstanding by class — where the unpaid invoices live */}
                {stats.outstandingByClass?.length > 0 && (
                  <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-[13px] font-semibold text-slate-900">Outstanding by class</h2>
                      <Link href="/fees" className="text-[11px] text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                        Chase up →
                      </Link>
                    </div>
                    <div className="space-y-2.5">
                      {stats.outstandingByClass.map((c: any) => {
                        const pct = c.total > 0 ? Math.round((c.unpaid / c.total) * 100) : 0;
                        return (
                          <div key={c.name}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[12.5px] text-slate-600 truncate">{c.name}</span>
                              <span className="text-[12px] font-semibold tabular-nums text-slate-900">
                                {c.unpaid}<span className="font-normal text-slate-500"> of {c.total} unpaid</span>
                              </span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Staff + Library */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 flex-1">
                  <div className="mb-5">
                    <h2 className="text-[13px] font-semibold text-slate-900 mb-2">Staff today</h2>
                    {[
                      { label: "Present", v: stats.staffAttendance.present, vc: "text-slate-900" },
                      { label: "Absent",  v: stats.staffAttendance.absent,  vc: stats.staffAttendance.absent > 0 ? "text-rose-600" : "text-slate-900" },
                    ].map(({ label, v, vc }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <span className="text-[13px] text-slate-500">{label}</span>
                        <span className={`text-[13px] font-semibold tabular-nums ${vc}`}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h2 className="text-[13px] font-semibold text-slate-900 mb-2">Library</h2>
                    {[
                      { label: "Available", v: stats.books.available, vc: "text-slate-900" },
                      { label: "Issued",    v: stats.books.issued,    vc: "text-slate-900" },
                      ...(stats.books.dueForReturn > 0
                        ? [{ label: "Overdue", v: stats.books.dueForReturn, vc: "text-rose-600" }]
                        : []),
                    ].map(({ label, v, vc }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                        <span className={`text-[13px] ${label === "Overdue" ? "text-rose-500" : "text-slate-500"}`}>{label}</span>
                        <span className={`text-[13px] font-semibold tabular-nums ${vc}`}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
