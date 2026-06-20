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

// ─── KPI Card — calm, neutral ─────────────────────────────────────────────────
function KpiCard({
  label, value, sub, href, icon: Icon,
}: {
  label: string; value: string | number; sub?: string; href?: string; icon: React.ElementType;
}) {
  const inner = (
    <div className="group bg-white rounded-xl border border-slate-200 p-5 h-full flex flex-col
      hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-[12.5px] font-medium text-slate-500">{label}</span>
        <Icon className="h-4 w-4 text-slate-300 group-hover:text-slate-400 transition-colors" />
      </div>
      <p className="text-[30px] font-semibold text-slate-900 leading-none tabular-nums tracking-tight mt-4">{value}</p>
      {sub && <p className="text-[12px] text-slate-400 mt-2">{sub}</p>}
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

  const stats   = await getDashboardStats().catch(() => null);

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
    <div className="flex flex-col flex-1 min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 px-4 py-7 md:p-8 max-w-[1400px] mx-auto w-full space-y-7">

        {/* ── Welcome ── */}
        <div className="flex items-end justify-between gap-4">
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
            </div>
          </div>
          <p className="text-[13px] text-slate-400 hidden md:block shrink-0">{dayLabel}</p>
        </div>

        {!stats ? (
          <div className="bg-white rounded-xl border border-slate-200 border-dashed py-20 text-center">
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
                sub="Current session" href="/students" icon={Users}
              />
              <KpiCard
                label="Teachers / Staff" value={`${teacherCount} / ${totalStaff}`}
                sub="Active employees" href="/staff" icon={UserCog}
              />
              <KpiCard
                label="Fees collected" value={`${currency}${(stats.monthCollection ?? 0).toLocaleString()}`}
                sub="This month" href="/fees/collect" icon={Banknote}
              />
              <KpiCard
                label="Expenses" value={`${currency}${(stats.monthExpense ?? 0).toLocaleString()}`}
                sub="This month" href="/finance" icon={TrendingDown}
              />
            </div>

            {/* ── Attendance + Fees ── */}
            <div className="grid grid-cols-12 gap-4">

              {/* Attendance */}
              <div className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">Student attendance</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">Today's summary</p>
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
                    <p className="text-[13px] text-slate-400 mt-1 mb-4">Take attendance to see today's breakdown.</p>
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
                      <p className="text-[12px] text-slate-400 mt-2">present today</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">{attTotal} students marked</p>
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
              </div>

              {/* Fee Collection */}
              <div className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 flex flex-col">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">Fee collection</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">Current session</p>
                  </div>
                  <Link href="/fees/collect"
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                    <DollarSign className="h-3.5 w-3.5" /> Collect
                  </Link>
                </div>

                <div className="mb-5">
                  <div className="flex items-end justify-between mb-2.5">
                    <span className="text-[40px] font-semibold text-slate-900 leading-none tabular-nums tracking-tight">{feesPaidPct}%</span>
                    <span className="text-[12px] text-slate-400 mb-1">{stats.feesPaid + stats.feesUnpaid} invoices</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${feesPaidPct}%` }} />
                  </div>
                  <p className="text-[12px] text-slate-400 mt-2">collected this session</p>
                </div>

                <div className="flex-1">
                  {[
                    { label: "Paid",           value: String(stats.feesPaid),   vc: "text-slate-900" },
                    { label: "Outstanding",    value: String(stats.feesUnpaid), vc: stats.feesUnpaid > 0 ? "text-rose-600" : "text-slate-900" },
                    { label: "Month receipts", value: `${currency}${(stats.monthCollection ?? 0).toLocaleString()}`, vc: "text-slate-900" },
                    { label: "Month expenses", value: `${currency}${(stats.monthExpense ?? 0).toLocaleString()}`,    vc: "text-slate-900" },
                  ].map(({ label, value, vc }) => (
                    <div key={label} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
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
              <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-[15px] font-semibold text-slate-900">Today's payments</h2>
                    <p className="text-[12px] text-slate-400 mt-0.5">
                      {stats.todayPayments.length} transaction{stats.todayPayments.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href="/fees/collect"
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
                    <Link href="/fees/collect" className="mt-2 text-[13px] text-indigo-600 font-medium hover:underline">
                      Collect a fee →
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[1fr_72px_80px] text-[11px] text-slate-400 font-medium uppercase tracking-wider pb-2 border-b border-slate-100 gap-4">
                      <span>Student</span>
                      <span className="text-right">Time</span>
                      <span className="text-right">Amount</span>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {stats.todayPayments.slice(0, 8).map((p: any, i: number) => (
                        <div key={i} className="grid grid-cols-[1fr_72px_80px] items-center py-3 gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-[10px] font-semibold text-slate-500">
                              {(p.studentName || "?").slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[13px] text-slate-800 font-medium truncate">{p.studentName || "—"}</span>
                          </div>
                          <span className="text-[12px] text-slate-400 tabular-nums text-right">
                            {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="text-[13px] font-semibold text-slate-900 tabular-nums text-right">
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
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                  <h2 className="text-[13px] font-semibold text-slate-900 mb-3">Quick actions</h2>
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
                        className="flex items-center gap-2.5 py-2 px-2 -mx-2 rounded-lg hover:bg-slate-50 transition-colors group">
                        <Icon className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 shrink-0 transition-colors" />
                        <span className="text-[13px] text-slate-700 flex-1">{label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>

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
