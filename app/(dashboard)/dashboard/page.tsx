import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/services/dashboard";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import {
  ArrowRight, AlertCircle, Users, UserCog, Banknote, TrendingDown,
  ClipboardList, DollarSign, BookOpen, BarChart2, UserPlus,
} from "lucide-react";
import Link from "next/link";

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 32;
  const allZero = data.every(v => v === 0);
  if (allZero) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <line x1="2" y1={h / 2} x2={w - 2} y2={h / 2}
          stroke={color} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="5 3" strokeLinecap="round" />
      </svg>
    );
  }
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = ((i / (data.length - 1)) * (w - 4) + 2).toFixed(1);
    const y = (h - 4 - ((v - min) / range) * (h - 8)).toFixed(1);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── KPI Card (dark) ──────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, href,
  icon: Icon, accent,
  sparkData, sparkColor,
}: {
  label: string; value: string | number; sub?: string; href?: string;
  icon: React.ElementType; accent: string; // tailwind text color for dot + icon
  sparkData?: number[]; sparkColor?: string;
}) {
  const inner = (
    <div className="relative bg-slate-900 rounded-2xl p-4 md:p-6 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.18)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-shadow duration-200 group h-full flex flex-col justify-between gap-4">
      {/* Ghost icon watermark */}
      <Icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white opacity-[0.04] pointer-events-none" />

      <div>
        <div className="flex items-center gap-1.5 mb-2.5">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${accent.replace("text-", "bg-")}`} />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 truncate">{label}</p>
        </div>
        <p className="text-3xl md:text-[40px] font-bold text-white leading-none tabular-nums tracking-tight truncate">{value}</p>
        {sub && <p className="text-[11px] text-slate-500 mt-1.5">{sub}</p>}
      </div>

      <div className="flex items-end justify-between gap-2">
        {sparkData && sparkColor
          ? <Sparkline data={sparkData} color={sparkColor} />
          : <span />}
        {href && (
          <ArrowRight className="h-4 w-4 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0 mb-1" />
        )}
      </div>
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : <div className="h-full">{inner}</div>;
}

// ─── Arc Gauge ────────────────────────────────────────────────────────────────
function ArcGauge({ pct, size = 140, empty = false }: { pct: number; size?: number; empty?: boolean }) {
  const stroke = 12, r = (size - stroke) / 2, cx = size / 2, cy = size / 2;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const startDeg = 135, totalDeg = 270;

  function arcPath(from: number, to: number) {
    const sx = cx + r * Math.cos(toRad(from)), sy = cy + r * Math.sin(toRad(from));
    const ex = cx + r * Math.cos(toRad(to)),   ey = cy + r * Math.sin(toRad(to));
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  }

  const trackEnd = startDeg + totalDeg;
  const fillEnd  = startDeg + Math.max((pct / 100) * totalDeg, pct > 0 ? 5 : 0);
  const color = pct >= 90 ? "#16a34a" : pct >= 75 ? "#2563eb" : pct >= 50 ? "#d97706" : "#dc2626";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={arcPath(startDeg, trackEnd)} fill="none" stroke="#f1f5f9" strokeWidth={stroke} strokeLinecap="round" />
        {!empty && pct > 0 && (
          <path d={arcPath(startDeg, fillEnd)} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-3">
        {empty ? (
          <>
            <span className="text-2xl font-bold leading-none text-gray-200">—</span>
            <span className="text-[10px] text-gray-300 mt-1">no data</span>
          </>
        ) : (
          <>
            <span className="text-[32px] font-bold leading-none tabular-nums" style={{ color }}>{pct}%</span>
            <span className="text-[10px] text-gray-400 mt-1 font-medium">present</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await auth();
  const role    = (session?.user as any)?.role;
  if (role === "STUDENT") redirect("/my-results");
  if (role === "PARENT")  redirect("/parent/results");

  const stats   = await getDashboardStats().catch(() => null);
  const db      = await getDb().catch(() => null);
  const profile = db ? await (db as any).schoolProfile
    .findFirst({ select: { name: true, currency: true } })
    .catch(() => null) : null;

  const schoolName  = profile?.name ?? "Your School";
  const currency    = profile?.currency ?? "";
  const totalStaff  = Object.values(stats?.staffByRole ?? {}).reduce((a: number, b) => a + (b as number), 0);
  const teacherCount = stats?.staffByRole?.["TEACHER"] ?? 0;

  const attTotal    = stats?.studentAttendance?.total ?? 0;
  const attPct      = (v: number) => attTotal > 0 ? Math.round((v / attTotal) * 100) : 0;
  const presentPct  = attPct(stats?.studentAttendance?.present ?? 0);
  const feesPaidPct = (stats?.feesTotal ?? 0) > 0 ? Math.round(((stats?.feesPaid ?? 0) / stats!.feesTotal) * 100) : 0;

  const now      = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dayLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col flex-1 bg-[#f4f6fb] min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 px-4 py-5 md:p-6 max-w-[1400px] mx-auto w-full space-y-4 md:space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{schoolName}</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <p className="text-sm text-gray-400">{greeting}</p>
              {stats?.currentSession && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {stats.currentSession}
                  </span>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-400 hidden md:block shrink-0">{dayLabel}</p>
        </div>

        {!stats ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center shadow-sm">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No data yet</p>
            <p className="text-sm text-gray-400 mt-1">Create an active academic session to populate the dashboard.</p>
            <Link href="/settings" className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 font-medium hover:underline">
              Go to Settings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
              <KpiCard
                label="Students enrolled" value={stats.totalStudents}
                sub="current session" href="/students"
                icon={Users} accent="text-blue-400"
              />
              <KpiCard
                label="Teachers / Staff" value={`${teacherCount} / ${totalStaff}`}
                sub="active employees" href="/staff"
                icon={UserCog} accent="text-violet-400"
              />
              <KpiCard
                label="Fees collected" value={`${currency}${(stats.monthCollection ?? 0).toLocaleString()}`}
                sub="this month" href="/fees/collect"
                icon={Banknote} accent="text-emerald-400"
                sparkData={stats.sparklines.fees} sparkColor="#34d399"
              />
              <KpiCard
                label="Expenses" value={`${currency}${(stats.monthExpense ?? 0).toLocaleString()}`}
                sub="this month" href="/finance"
                icon={TrendingDown} accent="text-rose-400"
                sparkData={stats.sparklines.expenses} sparkColor="#fb7185"
              />
            </div>

            {/* ── Attendance + Fees (7/12 + 5/12) ── */}
            <div className="grid grid-cols-12 gap-4">

              {/* Attendance */}
              <div className="col-span-12 lg:col-span-7 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] p-4 md:p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Student Attendance</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Today's summary</p>
                  </div>
                  <Link href="/attendance" className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors">
                    Mark <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {attTotal === 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <ArcGauge pct={0} empty />
                    <div className="text-center sm:text-left">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Not marked today</p>
                      <p className="text-xs text-gray-400 mb-4">Take attendance to see the breakdown.</p>
                      <Link href="/attendance" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-full transition-colors">
                        <ClipboardList className="h-3.5 w-3.5" /> Mark now
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <ArcGauge pct={presentPct} />
                    <div className="flex-1 space-y-1 min-w-0">
                      {[
                        { label: "Present",  v: stats.studentAttendance.present,  p: attPct(stats.studentAttendance.present),  bar: "bg-green-500" },
                        { label: "Absent",   v: stats.studentAttendance.absent,   p: attPct(stats.studentAttendance.absent),   bar: "bg-red-400" },
                        { label: "Late",     v: stats.studentAttendance.late,     p: attPct(stats.studentAttendance.late),     bar: "bg-amber-400" },
                        { label: "Half day", v: stats.studentAttendance.halfDay,  p: attPct(stats.studentAttendance.halfDay),  bar: "bg-blue-400" },
                      ].map(({ label, v, p, bar }) => (
                        <div key={label} className="flex items-center gap-2 py-1.5">
                          <span className="text-sm text-gray-500 w-14 shrink-0">{label}</span>
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-0">
                            <div className={`h-full rounded-full ${bar}`} style={{ width: `${p}%` }} />
                          </div>
                          <span className="text-sm font-semibold text-gray-900 tabular-nums w-7 text-right shrink-0">{v}</span>
                          <span className="text-[11px] text-gray-400 tabular-nums w-7 text-right shrink-0">{p}%</span>
                        </div>
                      ))}
                      <div className="pt-2.5 border-t border-gray-50 mt-1 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Total</span>
                        <span className="text-sm font-bold text-gray-900 tabular-nums">{attTotal}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fee Collection */}
              <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] p-4 md:p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Fee Collection</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Current session</p>
                  </div>
                  <Link href="/fees/collect" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors">
                    Collect <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Big % + bar */}
                <div className="mb-6">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-[40px] font-bold text-gray-900 leading-none tabular-nums">{feesPaidPct}%</span>
                    <span className="text-xs text-gray-400 mb-1">{stats.feesPaid + stats.feesUnpaid} invoices</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${feesPaidPct}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">collected this session</p>
                </div>

                <div className="space-y-0 divide-y divide-gray-50">
                  {[
                    { label: "Paid",          value: String(stats.feesPaid),   cl: "text-gray-900" },
                    { label: "Outstanding",   value: String(stats.feesUnpaid), cl: stats.feesUnpaid > 0 ? "text-red-600 font-semibold" : "text-gray-900" },
                    { label: "Month receipts",value: `${currency}${(stats.monthCollection ?? 0).toLocaleString()}`, cl: "text-gray-900" },
                    { label: "Month expenses",value: `${currency}${(stats.monthExpense ?? 0).toLocaleString()}`,    cl: "text-gray-900" },
                  ].map(({ label, value, cl }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-500">{label}</span>
                      <span className={`text-sm tabular-nums ${cl}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Payments + Right column (8/12 + 4/12) ── */}
            <div className="grid grid-cols-12 gap-4">

              {/* Payments table */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] p-4 md:p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Today's Payments</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {stats.todayPayments.length} transaction{stats.todayPayments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href="/fees/collect" className="text-xs text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-0.5">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {stats.todayPayments.length === 0 ? (
                  <div className="py-10 flex flex-col items-center text-center">
                    <DollarSign className="h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400 font-medium">No payments yet today</p>
                    <Link href="/fees/collect" className="mt-2 text-xs text-blue-600 font-semibold hover:underline">Collect a fee →</Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_80px_80px] text-[11px] text-gray-400 font-semibold uppercase tracking-wider pb-2 border-b border-gray-100 gap-4">
                      <span>Student</span>
                      <span className="text-right">Time</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {stats.todayPayments.slice(0, 8).map((p: any, i: number) => (
                        <div key={i} className="grid grid-cols-[1fr_80px_80px] items-center py-3 gap-4 hover:bg-gray-50/60 -mx-2 px-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 text-[10px] font-bold text-indigo-600">
                              {(p.studentName || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-800 font-medium truncate">{p.studentName || "—"}</span>
                          </div>
                          <span className="text-xs text-gray-400 tabular-nums text-right">
                            {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 tabular-nums text-right">
                            {currency}{(p.amount ?? 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {stats.todayPayments.length > 8 && (
                      <div className="pt-3 text-center">
                        <Link href="/fees/collect" className="text-xs text-gray-400 hover:text-blue-600 transition-colors font-medium">
                          + {stats.todayPayments.length - 8} more payments today
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Right column */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">

                {/* Quick actions */}
                <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] p-5">
                  <h2 className="text-sm font-bold text-gray-900 mb-3">Quick actions</h2>
                  <div className="space-y-0.5">
                    {[
                      { href: "/attendance",  label: "Mark attendance",  show: ["ADMIN","SUPER_ADMIN","TEACHER"],     icon: ClipboardList },
                      { href: "/fees/collect",label: "Collect fees",     show: ["ADMIN","SUPER_ADMIN","ACCOUNTANT"],  icon: DollarSign },
                      { href: "/students/new",label: "Add student",      show: ["ADMIN","SUPER_ADMIN"],               icon: UserPlus },
                      { href: "/exam-groups", label: "Enter marks",      show: ["ADMIN","SUPER_ADMIN","TEACHER"],     icon: BookOpen },
                      { href: "/staff/new",   label: "Add staff",        show: ["ADMIN","SUPER_ADMIN"],               icon: UserCog },
                      { href: "/reports",     label: "Reports",          show: [],                                    icon: BarChart2 },
                    ].filter(a => a.show.length === 0 || a.show.includes(role)).map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}
                        className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0 group-hover:text-gray-600" />
                        <span className="text-sm text-gray-700 flex-1">{label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-200 group-hover:text-gray-400 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Staff + Library */}
                <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.07)] p-5 flex-1">
                  <div className="mb-4">
                    <h2 className="text-sm font-bold text-gray-900 mb-2">Staff today</h2>
                    <div className="space-y-1">
                      {[
                        { label: "Present", v: stats.staffAttendance.present, cl: "text-gray-900" },
                        { label: "Absent",  v: stats.staffAttendance.absent,  cl: stats.staffAttendance.absent > 0 ? "text-red-600 font-semibold" : "text-gray-900" },
                      ].map(({ label, v, cl }) => (
                        <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                          <span className="text-sm text-gray-500">{label}</span>
                          <span className={`text-sm tabular-nums ${cl}`}>{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-2">Library</h2>
                    <div className="space-y-1">
                      {[
                        { label: "Available", v: stats.books.available, cl: "text-gray-900" },
                        { label: "Issued",    v: stats.books.issued,    cl: "text-gray-900" },
                        ...(stats.books.dueForReturn > 0
                          ? [{ label: "Overdue", v: stats.books.dueForReturn, cl: "text-red-600 font-semibold" }]
                          : []),
                      ].map(({ label, v, cl }) => (
                        <div key={label} className="flex justify-between items-center py-1.5 border-b border-gray-50 last:border-0">
                          <span className={`text-sm ${label === "Overdue" ? "text-red-500" : "text-gray-500"}`}>{label}</span>
                          <span className={`text-sm tabular-nums ${cl}`}>{v}</span>
                        </div>
                      ))}
                    </div>
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
