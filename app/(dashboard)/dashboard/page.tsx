import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/services/dashboard";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

// ── Thin horizontal bar ───────────────────────────────────────────────────────
function Bar({ pct, color = "bg-blue-600" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  );
}

// ── Stat row item ─────────────────────────────────────────────────────────────
function Stat({
  value, label, sub, href, alert,
}: {
  value: string | number; label: string; sub?: string; href?: string; alert?: boolean;
}) {
  const inner = (
    <div className={`group ${href ? "cursor-pointer" : ""}`}>
      <p className={`text-3xl font-semibold tracking-tight ${alert ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {href && (
        <span className="inline-flex items-center gap-0.5 text-xs text-blue-600 font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          View <ArrowRight className="h-3 w-3" />
        </span>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role === "STUDENT") redirect("/my-results");
  if (role === "PARENT")  redirect("/parent/results");

  const stats = await getDashboardStats();
  const db = await getDb();
  const profile = await (db as any).schoolProfile
    .findFirst({ select: { name: true, currency: true } })
    .catch(() => null);

  const schoolName = profile?.name ?? "Your School";
  const currency   = profile?.currency ?? "";

  const totalStaff    = Object.values(stats?.staffByRole ?? {}).reduce((a: number, b) => a + (b as number), 0);
  const teacherCount  = stats?.staffByRole?.["TEACHER"] ?? 0;

  const attTotal  = stats?.studentAttendance.total ?? 0;
  const attPct    = (v: number) => attTotal > 0 ? Math.round((v / attTotal) * 100) : 0;
  const presentPct = attPct(stats?.studentAttendance.present ?? 0);

  const feesTotal    = stats?.feesTotal ?? 0;
  const feesPaidPct  = feesTotal > 0 ? Math.round(((stats?.feesPaid ?? 0) / feesTotal) * 100) : 0;

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";
  const dayLabel = now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 px-6 py-6 max-w-[1400px] mx-auto w-full space-y-6">

        {/* ── Identity row ── */}
        <div className="flex items-end justify-between gap-4 pb-5 border-b border-gray-200">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-widest mb-1">{greeting}</p>
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
            {/* ── KPI strip ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 rounded-xl overflow-hidden border border-gray-200">
              {[
                { value: stats.totalStudents, label: "Students enrolled", sub: "current session", href: "/students" },
                { value: `${teacherCount} / ${totalStaff}`, label: "Teachers / Staff", href: "/staff" },
                { value: `${currency}${(stats.monthCollection ?? 0).toLocaleString()}`, label: "Collected this month", href: "/fees/collect" },
                { value: `${currency}${(stats.monthExpense ?? 0).toLocaleString()}`, label: "Expenses this month", href: "/finance" },
              ].map((s) => (
                <div key={s.label} className="bg-white px-6 py-5">
                  <Stat {...s} />
                </div>
              ))}
            </div>

            {/* ── Attendance + Fees ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Attendance */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                  <>
                    {/* Single summary bar */}
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                        <span>{presentPct}% present</span>
                        <span>{attTotal} total</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex gap-px">
                        {[
                          { v: stats.studentAttendance.present, c: "bg-green-500" },
                          { v: stats.studentAttendance.late,    c: "bg-amber-400" },
                          { v: stats.studentAttendance.halfDay, c: "bg-blue-400" },
                          { v: stats.studentAttendance.absent,  c: "bg-red-400" },
                        ].filter(s => s.v > 0).map(({ v, c }, i) => (
                          <div key={i} className={`h-full ${c}`} style={{ width: `${(v / attTotal) * 100}%` }} />
                        ))}
                      </div>
                    </div>

                    {/* Data rows */}
                    <div className="space-y-0 divide-y divide-gray-50">
                      {[
                        { label: "Present",  value: stats.studentAttendance.present,  pct: attPct(stats.studentAttendance.present),  className: "" },
                        { label: "Absent",   value: stats.studentAttendance.absent,   pct: attPct(stats.studentAttendance.absent),   className: stats.studentAttendance.absent > 0 ? "text-red-600 font-semibold" : "" },
                        { label: "Late",     value: stats.studentAttendance.late,     pct: attPct(stats.studentAttendance.late),     className: "" },
                        { label: "Half day", value: stats.studentAttendance.halfDay,  pct: attPct(stats.studentAttendance.halfDay),  className: "" },
                      ].map(({ label, value, pct, className }) => (
                        <div key={label} className="flex items-center justify-between py-2.5">
                          <span className="text-sm text-gray-600">{label}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                            <span className={`text-sm w-8 text-right tabular-nums ${className || "text-gray-900"}`}>{value}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Fee collection */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{feesPaidPct}% collected</span>
                    <span>{stats.feesPaid + stats.feesUnpaid} invoices</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden flex gap-px">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${feesPaidPct}%` }} />
                  </div>
                </div>

                <div className="space-y-0 divide-y divide-gray-50">
                  {[
                    { label: "Paid invoices",    value: stats.feesPaid,                                                     className: "text-gray-900" },
                    { label: "Outstanding",      value: stats.feesUnpaid,                                                   className: stats.feesUnpaid > 0 ? "text-red-600 font-semibold" : "text-gray-900" },
                    { label: "Collected (month)",value: `${currency}${(stats.monthCollection ?? 0).toLocaleString()}`,      className: "text-gray-900" },
                    { label: "Expenses (month)", value: `${currency}${(stats.monthExpense ?? 0).toLocaleString()}`,         className: "text-gray-900" },
                  ].map(({ label, value, className }) => (
                    <div key={label} className="flex items-center justify-between py-2.5">
                      <span className="text-sm text-gray-600">{label}</span>
                      <span className={`text-sm tabular-nums ${className}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Payments + Utility strip ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Today's payments — wide */}
              <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Today's Payments</h2>
                    <p className="text-xs text-gray-400 mt-0.5">{stats.todayPayments.length} transaction{stats.todayPayments.length !== 1 ? "s" : ""}</p>
                  </div>
                  <Link href="/fees/collect" className="text-xs text-blue-600 font-medium hover:text-blue-700 flex items-center gap-0.5">
                    All <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {stats.todayPayments.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-gray-400">No payments recorded today.</p>
                    <Link href="/fees/collect" className="text-xs text-blue-600 font-medium mt-2 inline-block hover:underline">Collect a fee →</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    <div className="grid grid-cols-[1fr_auto_auto] text-xs text-gray-400 font-medium pb-2 gap-4">
                      <span>Student</span>
                      <span className="text-right">Time</span>
                      <span className="text-right w-16">Amount</span>
                    </div>
                    {stats.todayPayments.slice(0, 7).map((p: any, i: number) => (
                      <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center py-2.5 gap-4 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-[10px] font-semibold text-gray-500">
                            {(p.studentName || "?").slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-800 truncate">{p.studentName || "—"}</span>
                        </div>
                        <span className="text-xs text-gray-400 tabular-nums">
                          {new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="text-sm text-gray-900 font-medium tabular-nums text-right w-16">
                          {currency}{(p.amount ?? 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    {stats.todayPayments.length > 7 && (
                      <div className="pt-3 text-center">
                        <Link href="/fees/collect" className="text-xs text-gray-400 hover:text-blue-600 transition-colors">
                          +{stats.todayPayments.length - 7} more transactions
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right utility column */}
              <div className="flex flex-col gap-4">

                {/* Quick actions */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
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

                {/* Staff + Library compact */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="text-sm font-semibold text-gray-900 mb-3">Staff today</h2>
                  <div className="divide-y divide-gray-50">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Present</span>
                      <span className="text-sm text-gray-900 tabular-nums">{stats.staffAttendance.present}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Absent</span>
                      <span className={`text-sm tabular-nums ${stats.staffAttendance.absent > 0 ? "text-red-600" : "text-gray-900"}`}>
                        {stats.staffAttendance.absent}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-sm font-semibold text-gray-900 mt-4 mb-3">Library</h2>
                  <div className="divide-y divide-gray-50">
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Books available</span>
                      <span className="text-sm text-gray-900 tabular-nums">{stats.books.available}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm text-gray-600">Issued</span>
                      <span className="text-sm text-gray-900 tabular-nums">{stats.books.issued}</span>
                    </div>
                    {stats.books.dueForReturn > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-red-600">Overdue</span>
                        <span className="text-sm text-red-600 font-semibold tabular-nums">{stats.books.dueForReturn}</span>
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
