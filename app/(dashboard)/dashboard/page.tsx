import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/services/dashboard";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import {
  ArrowRight, ArrowUpRight, AlertCircle, Users, UserCog, Banknote, TrendingDown,
  ClipboardList, DollarSign, BookOpen, BarChart2, UserPlus, Check,
} from "lucide-react";
import Link from "next/link";

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 72, h = 28;
  const allZero = data.every(v => v === 0);
  if (allZero) return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <line x1="2" y1={h / 2} x2={w - 2} y2={h / 2}
        stroke={color} strokeWidth="1.5" strokeOpacity="0.3" strokeDasharray="4 3" strokeLinecap="round" />
    </svg>
  );
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

// ─── KPI Card — clean white, premium ─────────────────────────────────────────
function KpiCard({
  label, value, sub, href,
  icon: Icon, iconBg, iconColor, borderAccent,
  sparkData, sparkColor,
}: {
  label: string; value: string | number; sub?: string; href?: string;
  icon: React.ElementType; iconBg: string; iconColor: string; borderAccent: string;
  sparkData?: number[]; sparkColor?: string;
}) {
  const inner = (
    <div className={`group relative bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col gap-4
      shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]
      hover:-translate-y-px transition-all duration-200 overflow-hidden`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[3px] rounded-t-xl ${borderAccent}`} />

      <div className="flex items-start justify-between pt-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {href && (
          <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        )}
      </div>

      <div>
        <p className="text-[36px] font-black text-slate-900 leading-none tabular-nums tracking-tight">{value}</p>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-2">{label}</p>
        {sub && <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>}
      </div>

      {sparkData && sparkColor && (
        <div className="mt-auto">
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href} className="block h-full">{inner}</Link> : <div className="h-full">{inner}</div>;
}

// ─── Stat Row ─────────────────────────────────────────────────────────────────
function StatRow({ label, value, valueClass = "text-slate-900", bar, barPct }: {
  label: string; value: string | number; valueClass?: string; bar?: string; barPct?: number;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
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

  const stats   = await getDashboardStats().catch(() => null);
  const db      = await getDb().catch(() => null);
  const profile = db ? await (db as any).schoolProfile
    .findFirst({ select: { name: true, currency: true } })
    .catch(() => null) : null;

  const schoolName  = profile?.name ?? "Your School";
  const currency    = profile?.currency ?? "";
  const totalStaff  = Object.values(stats?.staffByRole ?? {}).reduce((a: number, b) => a + (b as number), 0);
  const teacherCount = stats?.staffByRole?.["TEACHER"] ?? 0;

  const attTotal   = stats?.studentAttendance?.total ?? 0;
  const attPct     = (v: number) => attTotal > 0 ? Math.round((v / attTotal) * 100) : 0;
  const presentPct = attPct(stats?.studentAttendance?.present ?? 0);
  const feesPaidPct = (stats?.feesTotal ?? 0) > 0
    ? Math.round(((stats?.feesPaid ?? 0) / stats!.feesTotal) * 100) : 0;

  const now      = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dayLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const userName = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "";

  return (
    <div className="flex flex-col flex-1 bg-slate-50 min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 px-4 py-6 md:p-7 max-w-[1440px] mx-auto w-full space-y-6">

        {/* ── Welcome ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight">
              {greeting}{userName ? `, ${userName.split(" ")[0]}` : ""}.
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <p className="text-[14px] text-slate-500 font-medium">{schoolName}</p>
              {stats?.currentSession && (
                <>
                  <span className="text-slate-300">·</span>
                  <span className="text-[12px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                    {stats.currentSession}
                  </span>
                </>
              )}
            </div>
          </div>
          <p className="text-[13px] text-slate-400 hidden md:block shrink-0 mt-1">{dayLabel}</p>
        </div>

        {!stats ? (
          <div className="bg-white rounded-2xl border border-slate-200 border-dashed py-20 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-3 text-slate-300" />
            <p className="font-semibold text-slate-600">No data yet</p>
            <p className="text-sm text-slate-400 mt-1">Create an active academic session to populate the dashboard.</p>
            <Link href="/settings" className="inline-flex items-center gap-1 mt-4 text-sm text-indigo-600 font-semibold hover:underline">
              Go to Settings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                label="Students enrolled" value={stats.totalStudents}
                sub="current session" href="/students"
                icon={Users}
                iconBg="bg-indigo-50" iconColor="text-indigo-600"
                borderAccent="bg-indigo-500"
              />
              <KpiCard
                label="Teachers / Staff" value={`${teacherCount} / ${totalStaff}`}
                sub="active employees" href="/staff"
                icon={UserCog}
                iconBg="bg-violet-50" iconColor="text-violet-600"
                borderAccent="bg-violet-500"
              />
              <KpiCard
                label="Fees collected" value={`${currency}${(stats.monthCollection ?? 0).toLocaleString()}`}
                sub="this month" href="/fees/collect"
                icon={Banknote}
                iconBg="bg-emerald-50" iconColor="text-emerald-600"
                borderAccent="bg-emerald-500"
                sparkData={stats.sparklines.fees} sparkColor="#10b981"
              />
              <KpiCard
                label="Expenses" value={`${currency}${(stats.monthExpense ?? 0).toLocaleString()}`}
                sub="this month" href="/finance"
                icon={TrendingDown}
                iconBg="bg-rose-50" iconColor="text-rose-600"
                borderAccent="bg-rose-500"
                sparkData={stats.sparklines.expenses} sparkColor="#f43f5e"
              />
            </div>

            {/* ── Attendance + Fees ── */}
            <div className="grid grid-cols-12 gap-4">

              {/* Attendance */}
              <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Student Attendance</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">Today's summary</p>
                  </div>
                  <Link href="/attendance"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-3 py-1.5 rounded-full transition-colors">
                    <ClipboardList className="h-3.5 w-3.5" /> Mark
                  </Link>
                </div>

                {attTotal === 0 ? (
                  <div className="flex flex-col sm:flex-row items-center gap-6 py-6">
                    <div className="w-28 h-28 rounded-full border-[10px] border-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-2xl font-bold text-slate-300">—</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-[14px] font-semibold text-slate-700">Not marked today</p>
                      <p className="text-[13px] text-slate-400 mt-1 mb-4">Take attendance to see today's breakdown.</p>
                      <Link href="/attendance"
                        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg transition-colors">
                        <ClipboardList className="h-3.5 w-3.5" /> Mark now
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    {/* Progress ring */}
                    <div className="relative shrink-0" style={{ width: 110, height: 110 }}>
                      <svg width={110} height={110}>
                        <circle cx={55} cy={55} r={44} fill="none" stroke="#f1f5f9" strokeWidth={10} />
                        <circle cx={55} cy={55} r={44} fill="none"
                          stroke={presentPct >= 90 ? "#10b981" : presentPct >= 75 ? "#6366f1" : presentPct >= 50 ? "#f59e0b" : "#ef4444"}
                          strokeWidth={10} strokeLinecap="round" strokeDasharray={`${(presentPct / 100) * 276.46} 276.46`}
                          transform="rotate(-90 55 55)" />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[22px] font-black tabular-nums text-slate-900">{presentPct}%</span>
                        <span className="text-[10px] text-slate-400 font-medium">present</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      {[
                        { label: "Present",  v: stats.studentAttendance.present,  bar: "bg-emerald-500" },
                        { label: "Absent",   v: stats.studentAttendance.absent,   bar: "bg-red-400" },
                        { label: "Late",     v: stats.studentAttendance.late,     bar: "bg-amber-400" },
                        { label: "Half day", v: stats.studentAttendance.halfDay,  bar: "bg-indigo-400" },
                      ].map(({ label, v, bar }) => (
                        <StatRow key={label} label={label} value={v}
                          bar={bar} barPct={attPct(v)} />
                      ))}
                      <div className="flex justify-between items-center pt-2.5 mt-1">
                        <span className="text-[12px] text-slate-400">Total today</span>
                        <span className="text-[14px] font-bold text-slate-900 tabular-nums">{attTotal}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fee Collection */}
              <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Fee Collection</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">Current session</p>
                  </div>
                  <Link href="/fees/collect"
                    className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-3 py-1.5 rounded-full transition-colors">
                    <DollarSign className="h-3.5 w-3.5" /> Collect
                  </Link>
                </div>

                <div className="mb-5">
                  <div className="flex items-end justify-between mb-2">
                    <span className="text-[42px] font-black text-slate-900 leading-none tabular-nums">{feesPaidPct}%</span>
                    <span className="text-[12px] text-slate-400 mb-1">{stats.feesPaid + stats.feesUnpaid} invoices</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${feesPaidPct}%` }} />
                  </div>
                  <p className="text-[12px] text-slate-400 mt-1.5">collected this session</p>
                </div>

                <div className="space-y-0 flex-1">
                  {[
                    { label: "Paid",           value: String(stats.feesPaid),   vc: "text-slate-900" },
                    { label: "Outstanding",    value: String(stats.feesUnpaid), vc: stats.feesUnpaid > 0 ? "text-rose-600" : "text-slate-900" },
                    { label: "Month receipts", value: `${currency}${(stats.monthCollection ?? 0).toLocaleString()}`, vc: "text-slate-900" },
                    { label: "Month expenses", value: `${currency}${(stats.monthExpense ?? 0).toLocaleString()}`,    vc: "text-slate-900" },
                  ].map(({ label, value, vc }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <span className="text-[13px] text-slate-500">{label}</span>
                      <span className={`text-[13px] font-semibold tabular-nums ${vc}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Payments + Side column ── */}
            <div className="grid grid-cols-12 gap-4">

              {/* Recent payments */}
              <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[15px] font-bold text-slate-900">Today's Payments</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      {stats.todayPayments.length} transaction{stats.todayPayments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href="/fees/collect"
                    className="text-[12px] text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-0.5">
                    View all <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {stats.todayPayments.length === 0 ? (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-3">
                      <DollarSign className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-500">No payments yet today</p>
                    <Link href="/fees/collect" className="mt-2 text-[13px] text-indigo-600 font-semibold hover:underline">
                      Collect a fee →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_72px_80px] text-[11px] text-slate-400 font-semibold uppercase tracking-wider pb-2 border-b border-slate-100 gap-4">
                      <span>Student</span>
                      <span className="text-right">Time</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {stats.todayPayments.slice(0, 8).map((p: any, i: number) => (
                        <div key={i} className="grid grid-cols-[1fr_72px_80px] items-center py-3 gap-4 hover:bg-slate-50/60 -mx-2 px-2 rounded-lg transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center shrink-0 text-[10px] font-bold text-indigo-600">
                              {(p.studentName || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[13px] text-slate-800 font-medium truncate">{p.studentName || "—"}</span>
                          </div>
                          <span className="text-[12px] text-slate-400 tabular-nums text-right">
                            {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-[13px] font-bold text-slate-900 tabular-nums text-right">
                            {currency}{(p.amount ?? 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                    {stats.todayPayments.length > 8 && (
                      <div className="pt-3 text-center">
                        <Link href="/fees/collect" className="text-[12px] text-slate-400 hover:text-indigo-600 transition-colors font-medium">
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
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                  <h2 className="text-[13px] font-bold text-slate-900 mb-3">Quick actions</h2>
                  <div className="space-y-0.5">
                    {[
                      { href: "/attendance",   label: "Mark attendance",  show: ["ADMIN","SUPER_ADMIN","TEACHER"],    icon: ClipboardList },
                      { href: "/fees/collect", label: "Collect fees",     show: ["ADMIN","SUPER_ADMIN","ACCOUNTANT"], icon: DollarSign },
                      { href: "/students/new", label: "Add student",      show: ["ADMIN","SUPER_ADMIN"],              icon: UserPlus },
                      { href: "/exam-groups",  label: "Enter marks",      show: ["ADMIN","SUPER_ADMIN","TEACHER"],    icon: BookOpen },
                      { href: "/staff/new",    label: "Add staff",        show: ["ADMIN","SUPER_ADMIN"],              icon: UserCog },
                      { href: "/reports",      label: "Reports",          show: [],                                   icon: BarChart2 },
                    ].filter(a => a.show.length === 0 || a.show.includes(role)).map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href}
                        className="flex items-center gap-2.5 py-2 px-2 rounded-lg hover:bg-slate-50 transition-colors group">
                        <div className="w-6 h-6 rounded-md bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <span className="text-[13px] text-slate-700 flex-1">{label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Staff + Library */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex-1">
                  <div className="mb-4">
                    <h2 className="text-[13px] font-bold text-slate-900 mb-3">Staff today</h2>
                    {[
                      { label: "Present", v: stats.staffAttendance.present, vc: "text-slate-900" },
                      { label: "Absent",  v: stats.staffAttendance.absent,  vc: stats.staffAttendance.absent > 0 ? "text-rose-600" : "text-slate-900" },
                    ].map(({ label, v, vc }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <span className="text-[13px] text-slate-500">{label}</span>
                        <span className={`text-[13px] font-semibold tabular-nums ${vc}`}>{v}</span>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h2 className="text-[13px] font-bold text-slate-900 mb-3">Library</h2>
                    {[
                      { label: "Available", v: stats.books.available, vc: "text-slate-900" },
                      { label: "Issued",    v: stats.books.issued,    vc: "text-slate-900" },
                      ...(stats.books.dueForReturn > 0
                        ? [{ label: "Overdue", v: stats.books.dueForReturn, vc: "text-rose-600" }]
                        : []),
                    ].map(({ label, v, vc }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
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
