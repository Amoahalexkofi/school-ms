import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/lib/services/dashboard";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import {
  Users, UserCog, DollarSign, BookOpen, ClipboardList, Library,
  TrendingUp, TrendingDown, ArrowRight, AlertCircle, CheckCircle2,
  Clock, UserPlus, BarChart3, Banknote, MessageSquare,
} from "lucide-react";
import Link from "next/link";

// ── SVG Ring Chart ────────────────────────────────────────────────────────────
function RingChart({
  segments,
  size = 120,
  thickness = 14,
  label,
  sub,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  thickness?: number;
  label: string;
  sub: string;
}) {
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, sg) => s + sg.value, 0) || 1;
  let offset = 0;

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={thickness} />
        {segments.map((seg, i) => {
          const dash = (seg.value / total) * circumference;
          const gap = circumference - dash;
          const el = (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              strokeLinecap="round"
            />
          );
          offset += dash;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-gray-900 leading-none">{label}</span>
        <span className="text-[10px] text-gray-400 mt-0.5">{sub}</span>
      </div>
    </div>
  );
}

// ── Mini bar ─────────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({
  label, value, sub, icon: Icon, iconBg, iconColor, href, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; iconBg: string; iconColor: string;
  href?: string; trend?: "up" | "down" | "neutral";
}) {
  const inner = (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === "up" ? "bg-emerald-50 text-emerald-600" :
            trend === "down" ? "bg-red-50 text-red-500" :
            "bg-gray-50 text-gray-500"
          }`}>
            {trend === "up" ? <TrendingUp className="h-3 w-3" /> :
             trend === "down" ? <TrendingDown className="h-3 w-3" /> : null}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
      <p className="text-sm text-gray-500 mt-1.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      {href && (
        <div className="flex items-center gap-1 text-xs text-blue-600 mt-3 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
          View all <ArrowRight className="h-3 w-3" />
        </div>
      )}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (role === "STUDENT") redirect("/my-results");
  if (role === "PARENT")  redirect("/parent/results");

  const stats = await getDashboardStats();
  const db = await getDb();
  const profile = await (db as any).schoolProfile.findFirst({ select: { name: true, currency: true } }).catch(() => null);
  const schoolName = profile?.name ?? "Your School";
  const currency = profile?.currency ?? "";

  const totalStaff = Object.values(stats?.staffByRole ?? {}).reduce((a: number, b) => a + (b as number), 0);
  const teacherCount = stats?.staffByRole?.["TEACHER"] ?? 0;

  const attTotal = stats?.studentAttendance.total ?? 0;
  const attPct = (v: number) => attTotal > 0 ? Math.round((v / attTotal) * 100) : 0;

  const feesPaidPct = stats?.feesTotal > 0 ? Math.round((stats.feesPaid / stats.feesTotal) * 100) : 0;

  const now = new Date();
  const timeGreeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col flex-1 bg-gray-50 min-h-screen">
      <Topbar title="Dashboard" />

      <main className="flex-1 p-5 md:p-7 space-y-6 max-w-[1400px] mx-auto w-full">

        {/* ── Welcome Banner ── */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-blue-200 text-sm font-medium">{timeGreeting} 👋</p>
              <h2 className="text-xl md:text-2xl font-bold mt-1">{schoolName}</h2>
              <p className="text-blue-300 text-sm mt-1.5">
                Session: <span className="text-white font-medium">{stats?.currentSession ?? "No active session"}</span>
                <span className="mx-2 text-blue-700">·</span>
                <span className="text-blue-200">{now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</span>
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4 shrink-0">
              <div className="text-right">
                <p className="text-3xl font-bold">{stats?.totalStudents ?? 0}</p>
                <p className="text-blue-300 text-xs">Enrolled Students</p>
              </div>
              <div className="w-px h-10 bg-blue-700" />
              <div className="text-right">
                <p className="text-3xl font-bold">{totalStaff}</p>
                <p className="text-blue-300 text-xs">Total Staff</p>
              </div>
            </div>
          </div>
        </div>

        {!stats ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 py-20 text-center">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold text-gray-500">No data available</p>
            <p className="text-sm text-gray-400 mt-1">Set up an active academic session first.</p>
            <Link href="/settings" className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 hover:underline font-medium">
              Go to Settings <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <>
            {/* ── Row 1: KPI Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                label="Total Students" value={stats.totalStudents}
                sub={`Session enrolment`}
                icon={Users} iconBg="bg-blue-50" iconColor="text-blue-600"
                href="/students" trend="up"
              />
              <KpiCard
                label="Teaching Staff" value={teacherCount}
                sub={`${totalStaff} total staff`}
                icon={UserCog} iconBg="bg-violet-50" iconColor="text-violet-600"
                href="/staff" trend="neutral"
              />
              <KpiCard
                label="Fees Collected" value={`${currency}${stats.monthCollection}`}
                sub="This month"
                icon={DollarSign} iconBg="bg-emerald-50" iconColor="text-emerald-600"
                href="/fees/collect" trend="up"
              />
              <KpiCard
                label="Expenses" value={`${currency}${stats.monthExpense.toLocaleString()}`}
                sub="This month"
                icon={TrendingDown} iconBg="bg-rose-50" iconColor="text-rose-500"
                href="/finance" trend="down"
              />
            </div>

            {/* ── Row 2: Attendance + Fees ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Attendance */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">Student Attendance</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Today's overview</p>
                  </div>
                  <Link href="/attendance" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    Mark attendance <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                {attTotal === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ClipboardList className="h-8 w-8 text-gray-200 mb-2" />
                    <p className="text-sm text-gray-400 font-medium">Not marked yet today</p>
                    <Link href="/attendance" className="mt-3 text-xs text-blue-600 hover:underline font-medium">Mark now →</Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-6">
                    <RingChart
                      size={120} thickness={14}
                      segments={[
                        { value: stats.studentAttendance.present, color: "#22c55e" },
                        { value: stats.studentAttendance.absent,  color: "#f87171" },
                        { value: stats.studentAttendance.late,    color: "#fbbf24" },
                        { value: stats.studentAttendance.halfDay, color: "#60a5fa" },
                      ]}
                      label={`${attPct(stats.studentAttendance.present)}%`}
                      sub="present"
                    />
                    <div className="flex-1 space-y-3">
                      {[
                        { label: "Present",  value: stats.studentAttendance.present,  color: "bg-green-500",  dot: "bg-green-500" },
                        { label: "Absent",   value: stats.studentAttendance.absent,   color: "bg-red-400",    dot: "bg-red-400" },
                        { label: "Late",     value: stats.studentAttendance.late,     color: "bg-amber-400",  dot: "bg-amber-400" },
                        { label: "Half Day", value: stats.studentAttendance.halfDay,  color: "bg-blue-400",   dot: "bg-blue-400" },
                      ].map(({ label, value, color, dot }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="flex items-center gap-1.5 text-gray-600 font-medium">
                              <span className={`w-2 h-2 rounded-full ${dot}`} />{label}
                            </span>
                            <span className="text-gray-900 font-semibold">{value} <span className="text-gray-400 font-normal">({attPct(value)}%)</span></span>
                          </div>
                          <MiniBar value={value} max={attTotal} color={color} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fees Overview */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="font-semibold text-gray-900">Fee Collection</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Current session</p>
                  </div>
                  <Link href="/fees/collect" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    Collect fees <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
                <div className="flex items-center gap-6">
                  <RingChart
                    size={120} thickness={14}
                    segments={[
                      { value: stats.feesPaid,   color: "#22c55e" },
                      { value: stats.feesUnpaid, color: "#f87171" },
                    ]}
                    label={`${feesPaidPct}%`}
                    sub="collected"
                  />
                  <div className="flex-1 space-y-4">
                    <div className="bg-emerald-50 rounded-xl p-3">
                      <p className="text-xs text-emerald-600 font-medium">Paid</p>
                      <p className="text-2xl font-bold text-emerald-700 mt-0.5">{stats.feesPaid}</p>
                      <p className="text-xs text-emerald-500">{feesPaidPct}% of total invoices</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-xs text-red-500 font-medium">Outstanding</p>
                      <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.feesUnpaid}</p>
                      <p className="text-xs text-red-400">{100 - feesPaidPct}% unpaid</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Row 3: Staff Attendance + Library + Leave + Enquiries ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

              {/* Staff Attendance */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
                    <UserCog className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Staff Today</p>
                    <p className="text-xs text-gray-400">{stats.staffAttendance.total} total</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Present", value: stats.staffAttendance.present, color: "bg-green-500", textColor: "text-green-700", bg: "bg-green-50" },
                    { label: "Absent",  value: stats.staffAttendance.absent,  color: "bg-red-400",   textColor: "text-red-600",   bg: "bg-red-50" },
                  ].map(({ label, value, color, textColor, bg }) => (
                    <div key={label} className={`${bg} rounded-lg px-3 py-2 flex justify-between items-center`}>
                      <span className={`text-xs font-medium ${textColor}`}>{label}</span>
                      <span className={`text-sm font-bold ${textColor}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/attendance/staff" className="block text-xs text-blue-600 hover:underline mt-3 font-medium">Mark staff attendance →</Link>
              </div>

              {/* Library */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Library className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Library</p>
                    <p className="text-xs text-gray-400">{stats.books.total} books total</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Available", value: stats.books.available, color: "text-gray-900" },
                    { label: "Issued",    value: stats.books.issued,    color: "text-amber-600" },
                    { label: "Overdue",   value: stats.books.dueForReturn, color: stats.books.dueForReturn > 0 ? "text-red-600 font-bold" : "text-gray-900" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className={`text-sm font-semibold ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
                <Link href="/library" className="block text-xs text-blue-600 hover:underline mt-3 font-medium">Manage library →</Link>
              </div>

              {/* Leave */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Leave This Month</p>
                    <p className="text-xs text-gray-400">Requests & approvals</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { type: "Students", approved: stats.studentLeave.approved, pending: stats.studentLeave.total - stats.studentLeave.approved },
                    { type: "Staff",    approved: stats.staffLeave.approved,   pending: stats.staffLeave.total - stats.staffLeave.approved },
                  ].map(({ type, approved, pending }) => (
                    <div key={type}>
                      <p className="text-xs text-gray-400 font-medium mb-1">{type}</p>
                      <div className="flex gap-2">
                        <div className="flex-1 bg-emerald-50 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-sm font-bold text-emerald-700">{approved}</p>
                          <p className="text-[10px] text-emerald-500">approved</p>
                        </div>
                        <div className="flex-1 bg-amber-50 rounded-lg px-2 py-1.5 text-center">
                          <p className="text-sm font-bold text-amber-700">{pending}</p>
                          <p className="text-[10px] text-amber-500">pending</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/leave" className="block text-xs text-blue-600 hover:underline mt-3 font-medium">Manage leave →</Link>
              </div>

              {/* Enquiries */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Enquiries</p>
                    <p className="text-xs text-gray-400">{stats.enquiries.total} this month</p>
                  </div>
                </div>
                {stats.enquiries.total === 0 ? (
                  <div className="py-4 text-center">
                    <p className="text-xs text-gray-400">No enquiries this month</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[
                      { label: "Converted", value: stats.enquiries.converted, color: "bg-emerald-500", textColor: "text-emerald-700", bg: "bg-emerald-50" },
                      { label: "Contacted", value: stats.enquiries.contacted, color: "bg-blue-400",   textColor: "text-blue-700",   bg: "bg-blue-50" },
                      { label: "Pending",   value: stats.enquiries.total - stats.enquiries.contacted - stats.enquiries.converted,
                        color: "bg-gray-300", textColor: "text-gray-600", bg: "bg-gray-50" },
                    ].map(({ label, value, bg, textColor }) => (
                      <div key={label} className={`${bg} rounded-lg px-3 py-1.5 flex justify-between items-center`}>
                        <span className={`text-xs font-medium ${textColor}`}>{label}</span>
                        <span className={`text-sm font-bold ${textColor}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Link href="/front-office/enquiries" className="block text-xs text-blue-600 hover:underline mt-3 font-medium">View enquiries →</Link>
              </div>
            </div>

            {/* ── Row 4: Quick Actions + Today's Payments ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                    <Link href="/attendance" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors text-center group">
                      <ClipboardList className="h-5 w-5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 leading-tight">Mark Attendance</span>
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "ACCOUNTANT") && (
                    <Link href="/fees/collect" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors text-center">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <span className="text-xs font-medium text-emerald-700 leading-tight">Collect Fees</span>
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <Link href="/students/new" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-violet-50 hover:bg-violet-100 transition-colors text-center">
                      <UserPlus className="h-5 w-5 text-violet-600" />
                      <span className="text-xs font-medium text-violet-700 leading-tight">Add Student</span>
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                    <Link href="/exam-groups" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors text-center">
                      <BookOpen className="h-5 w-5 text-amber-600" />
                      <span className="text-xs font-medium text-amber-700 leading-tight">Enter Marks</span>
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <Link href="/reports" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors text-center">
                      <BarChart3 className="h-5 w-5 text-sky-600" />
                      <span className="text-xs font-medium text-sky-700 leading-tight">View Reports</span>
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "ACCOUNTANT") && (
                    <Link href="/finance" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors text-center">
                      <Banknote className="h-5 w-5 text-rose-500" />
                      <span className="text-xs font-medium text-rose-600 leading-tight">Finance</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Today's Payments */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">Today's Fee Payments</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{stats.todayPayments.length} transaction{stats.todayPayments.length !== 1 ? "s" : ""} today</p>
                  </div>
                  <Link href="/fees/collect" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    View all <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {stats.todayPayments.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                      <DollarSign className="h-6 w-6 text-gray-300" />
                    </div>
                    <p className="text-sm font-medium text-gray-400">No payments yet today</p>
                    <Link href="/fees/collect" className="mt-2 text-xs text-blue-600 hover:underline font-medium">Collect a fee →</Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {stats.todayPayments.slice(0, 6).map((p, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-emerald-700">
                            {(p.studentName || "?").slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">{p.studentName || "Unknown student"}</p>
                          <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </span>
                      </div>
                    ))}
                    {stats.todayPayments.length > 6 && (
                      <p className="text-xs text-center text-gray-400 pt-1">+{stats.todayPayments.length - 6} more</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
