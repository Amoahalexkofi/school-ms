import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/services/dashboard";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

// ── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const allZero = data.every(v => v === 0);
  const w = 72, h = 28;

  if (allZero) {
    return (
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
        <line x1="0" y1="14" x2={w} y2="14" stroke={color} strokeWidth="1.5"
          strokeOpacity="0.35" strokeDasharray="4 3" strokeLinecap="round" />
      </svg>
    );
  }
  const max   = Math.max(...data);
  const min   = Math.min(...data);
  const range = max - min || 1;
  const pts   = data.map((v, i) => {
    const x = ((i / (data.length - 1)) * (w - 2) + 1).toFixed(1);
    const y = (h - 4 - ((v - min) / range) * (h - 10)).toFixed(1);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.75"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, href,
  accentColor,      // tailwind bg class for the left bar
  labelColor,       // tailwind text class for the label
  sparkData,
  sparkColor,
}: {
  label: string; value: string | number; sub?: string; href?: string;
  accentColor: string; labelColor: string;
  sparkData?: number[]; sparkColor?: string;
}) {
  const inner = (
    <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden p-5 hover:shadow-[0_2px_8px_rgba(0,0,0,0.07)] transition-shadow duration-200 group h-full">
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${accentColor} rounded-l-xl`} />

      <div className="flex items-start justify-between gap-2">
        <p className={`text-[11px] font-semibold uppercase tracking-wide ${labelColor}`}>{label}</p>
        {sparkData && sparkColor && (
          <Sparkline data={sparkData} color={sparkColor} />
        )}
      </div>

      <p className="text-[32px] font-semibold text-gray-900 leading-none mt-3 tracking-tight tabular-nums">
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-2">{sub}</p>}

      {href && (
        <div className="flex items-center gap-0.5 text-xs text-gray-400 mt-3 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          View all <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : <div className="h-full">{inner}</div>;
}

// ── Arc Gauge (270° sweep) ────────────────────────────────────────────────────
function ArcGauge({ pct, color = "#2563eb" }: { pct: number; color?: string }) {
  const size = 108, stroke = 9;
  const r = (size - stroke) / 2;
  const cx = size / 2, cy = size / 2;
  const toRad = (d: number) => (d * Math.PI) / 180;

  function arc(startD: number, endD: number) {
    const s  = { x: cx + r * Math.cos(toRad(startD)), y: cy + r * Math.sin(toRad(startD)) };
    const e  = { x: cx + r * Math.cos(toRad(endD)),   y: cy + r * Math.sin(toRad(endD)) };
    const lg = endD - startD > 180 ? 1 : 0;
    return `M ${s.x.toFixed(2)} ${s.y.toFixed(2)} A ${r} ${r} 0 ${lg} 1 ${e.x.toFixed(2)} ${e.y.toFixed(2)}`;
  }

  const startDeg = 135;
  const totalDeg = 270;
  const fillDeg  = startDeg + Math.max((pct / 100) * totalDeg, pct > 0 ? 4 : 0);
  const trackEnd = startDeg + totalDeg;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <path d={arc(startDeg, trackEnd)} fill="none" stroke="#f1f5f9" strokeWidth={stroke} strokeLinecap="round" />
        {pct > 0 && (
          <path d={arc(startDeg, fillDeg)} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-2">
        <span className="text-2xl font-semibold text-gray-900 leading-none tabular-nums">{pct}%</span>
        <span className="text-[10px] text-gray-400 mt-1">present</span>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await auth();
  const role    = (session?.user as any)?.role;
  if (role === "STUDENT") redirect("/my-results");
  if (role === "PARENT")  redirect("/parent/results");

  const stats  = await getDashboardStats();
  const db     = await getDb();
  const profile = await (db as any).schoolProfile
    .findFirst({ select: { name: true, currency: true } })
    .catch(() => null);

  const schoolName  = profile?.name ?? "Your School";
  const currency    = profile?.currency ?? "";
  const totalStaff  = Object.values(stats?.staffByRole ?? {}).reduce((a: number, b) => a + (b as number), 0);
  const teacherCount = stats?.staffByRole?.["TEACHER"] ?? 0;

  const attTotal   = stats?.studentAttendance.total ?? 0;
  const attPct     = (v: number) => attTotal > 0 ? Math.round((v / attTotal) * 100) : 0;
  const presentPct = attPct(stats?.studentAttendance.present ?? 0);

  const feesTotal   = stats?.feesTotal ?? 0;
  const feesPaidPct = feesTotal > 0 ? Math.round(((stats?.feesPaid ?? 0) / feesTotal) * 100) : 0;

  const now      = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dayLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 px-6 py-6 max-w-[1400px] mx-auto w-full space-y-5">

        {/* ── Identity row ── */}
        <div className="flex items-end justify-between gap-4 pb-5 border-b border-gray-200">
          <div>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-widest mb-1">{greeting}</p>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{schoolName}</h1>
            {stats?.currentSession && (
              <p className="text-sm text-gray-500 mt-0.5">
                Session: <span className="text-gray-700 font-medium">{stats.currentSession}</span>
              </p>
            )}
          </div>
          <p className="text-sm text-gray-400 shrink-0 hidden md:block">{dayLabel}</p>
        </div>

        {!stats ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-20 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-500">No data available</p>
            <p className="text-sm text-gray-400 mt-1">Set up an active academic session to see your dashboard.</p>
            <Link href="/settings" className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 font-medium hover:underline">
              Go to Settings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {/* ── KPI Strip ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                label="Students enrolled"
                value={stats.totalStudents}
                sub="current session"
                href="/students"
                accentColor="bg-blue-600"
                labelColor="text-blue-600"
              />
              <KpiCard
                label="Teachers / Staff"
                value={`${teacherCount} / ${totalStaff}`}
                sub="active employees"
                href="/staff"
                accentColor="bg-violet-500"
                labelColor="text-violet-600"
              />
              <KpiCard
                label="Fees collected"
                value={`${currency}${(stats.monthCollection ?? 0).toLocaleString()}`}
                sub="this month"
                href="/fees/collect"
                accentColor="bg-emerald-500"
                labelColor="text-emerald-600"
                sparkData={stats.sparklines.fees}
                sparkColor="#10b981"
              />
              <KpiCard
                label="Expenses"
                value={`${currency}${(stats.monthExpense ?? 0).toLocaleString()}`}
                sub="this month"
                href="/finance"
                accentColor="bg-rose-500"
                labelColor="text-rose-500"
                sparkData={stats.sparklines.expenses}
                sparkColor="#f43f5e"
              />
            </div>

            {/* ── Attendance + Fees ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Attendance */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Student Attendance</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Today</p>
                  </div>
                  <Link href="/attendance" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-0.5">
                    Mark <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {attTotal === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-400">Not marked yet today.</p>
                    <Link href="/attendance" className="text-xs text-blue-600 font-medium mt-2 inline-block hover:underline">Mark now →</Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-8">
                    {/* Arc gauge */}
                    <ArcGauge pct={presentPct} />

                    {/* Data rows */}
                    <div className="flex-1 divide-y divide-gray-50">
                      {[
                        { label: "Present",  value: stats.studentAttendance.present,  pct: attPct(stats.studentAttendance.present),  alert: false },
                        { label: "Absent",   value: stats.studentAttendance.absent,   pct: attPct(stats.studentAttendance.absent),   alert: stats.studentAttendance.absent > 0 },
                        { label: "Late",     value: stats.studentAttendance.late,     pct: attPct(stats.studentAttendance.late),     alert: false },
                        { label: "Half day", value: stats.studentAttendance.halfDay,  pct: attPct(stats.studentAttendance.halfDay),  alert: false },
                      ].map(({ label, value, pct, alert }) => (
                        <div key={label} className="flex items-center justify-between py-2.5">
                          <span className="text-sm text-gray-600">{label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-8 text-right tabular-nums">{pct}%</span>
                            <span className={`text-sm font-medium w-8 text-right tabular-nums ${alert ? "text-red-600" : "text-gray-900"}`}>
                              {value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fee collection */}
              <div className="bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Fee Collection</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Current session</p>
                  </div>
                  <Link href="/fees/collect" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-0.5">
                    Collect <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span>{feesPaidPct}% collected</span>
                    <span>{stats.feesPaid + stats.feesUnpaid} invoices</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${feesPaidPct}%` }} />
                  </div>
                </div>

                <div className="divide-y divide-gray-50">
                  {[
                    { label: "Paid invoices",    value: String(stats.feesPaid),   alert: false },
                    { label: "Outstanding",      value: String(stats.feesUnpaid), alert: stats.feesUnpaid > 0 },
                    { label: "Collected (month)",value: `${currency}${(stats.monthCollection ?? 0).toLocaleString()}`, alert: false },
                    { label: "Expenses (month)", value: `${currency}${(stats.monthExpense ?? 0).toLocaleString()}`,    alert: false },
                  ].map(({ label, value, alert }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={`text-sm tabular-nums font-medium ${alert ? "text-red-600" : "text-gray-900"}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Payments + Utility ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Today's payments */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Today's Payments</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {stats.todayPayments.length} transaction{stats.todayPayments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href="/fees/collect" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-0.5">
                    All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {stats.todayPayments.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-gray-400">No payments recorded today.</p>
                    <Link href="/fees/collect" className="text-xs text-blue-600 font-medium mt-2 inline-block hover:underline">
                      Collect a fee →
                    </Link>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-[1fr_auto_auto] text-[11px] text-gray-400 font-medium pb-2 gap-4 border-b border-gray-50">
                      <span>Student</span>
                      <span className="text-right">Time</span>
                      <span className="text-right w-20">Amount</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {stats.todayPayments.slice(0, 7).map((p: any, i: number) => (
                        <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center py-2.5 gap-4 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-[9px] font-semibold text-gray-500">
                              {(p.studentName || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-800 truncate">{p.studentName || "—"}</span>
                          </div>
                          <span className="text-xs text-gray-400 tabular-nums">
                            {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-sm text-gray-900 font-medium tabular-nums text-right w-20">
                            {currency}{(p.amount ?? 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {stats.todayPayments.length > 7 && (
                      <div className="pt-3 text-center">
                        <Link href="/fees/collect" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
                          +{stats.todayPayments.length - 7} more
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-4">

                {/* Quick actions */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick actions</h2>
                  <div className="space-y-0.5">
                    {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                      <Link href="/attendance" className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <span className="text-sm text-gray-700">Mark attendance</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </Link>
                    )}
                    {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "ACCOUNTANT") && (
                      <Link href="/fees/collect" className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <span className="text-sm text-gray-700">Collect fees</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </Link>
                    )}
                    {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                      <Link href="/students/new" className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <span className="text-sm text-gray-700">Add student</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </Link>
                    )}
                    {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                      <Link href="/exam-groups" className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <span className="text-sm text-gray-700">Enter exam marks</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </Link>
                    )}
                    {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                      <Link href="/staff/new" className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group">
                        <span className="text-sm text-gray-700">Add staff</span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </Link>
                    )}
                    <Link href="/reports" className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-gray-50 transition-colors group">
                      <span className="text-sm text-gray-700">Reports</span>
                      <ArrowRight className="h-3.5 w-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                    </Link>
                  </div>
                </div>

                {/* Staff + Library */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Staff today</h2>
                  <div className="divide-y divide-gray-50 mb-4">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Present</span>
                      <span className="text-sm font-medium text-gray-900 tabular-nums">{stats.staffAttendance.present}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Absent</span>
                      <span className={`text-sm font-medium tabular-nums ${stats.staffAttendance.absent > 0 ? "text-red-600" : "text-gray-900"}`}>
                        {stats.staffAttendance.absent}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Library</h2>
                  <div className="divide-y divide-gray-50">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Available</span>
                      <span className="text-sm font-medium text-gray-900 tabular-nums">{stats.books.available}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Issued</span>
                      <span className="text-sm font-medium text-gray-900 tabular-nums">{stats.books.issued}</span>
                    </div>
                    {stats.books.dueForReturn > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-red-500">Overdue</span>
                        <span className="text-sm font-semibold text-red-600 tabular-nums">{stats.books.dueForReturn}</span>
                      </div>
                    )}
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
