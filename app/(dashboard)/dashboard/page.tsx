import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { Topbar } from "@/components/Topbar";
import {
  Users, UserCog, DollarSign, TrendingDown, BookOpen,
  ClipboardList, Library, MessageSquare, Calendar, CheckCircle2,
  XCircle, Clock, AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color, href }: {
  label: string; value: string | number; icon: React.ElementType; color: string; href?: string;
}) {
  const inner = (
    <div className={`rounded-xl p-4 text-white flex items-center gap-4 ${color} hover:opacity-90 transition-opacity`}>
      <div className="p-3 bg-white/20 rounded-lg shrink-0">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-2xl font-bold leading-none">{value}</p>
        <p className="text-xs mt-1 text-white/80">{label}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>;
}

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const stats = await getDashboardStats().catch(() => null);

  const teacherCount  = stats?.staffByRole?.["TEACHER"]    ?? 0;
  const accountCount  = stats?.staffByRole?.["ACCOUNTANT"] ?? 0;
  const totalStaff    = Object.values(stats?.staffByRole ?? {}).reduce((a, b) => a + b, 0);

  const attTotal  = stats?.studentAttendance.total ?? 0;
  const attPct    = (v: number) => attTotal > 0 ? Math.round((v / attTotal) * 100) : 0;
  const staffTotal = stats?.staffAttendance.total ?? 1;
  const staffPct   = (v: number) => staffTotal > 0 ? Math.round((v / staffTotal) * 100) : 0;

  const feesTotal   = stats?.feesTotal ?? 1;
  const feesPaidPct = feesTotal > 0 ? Math.round(((stats?.feesPaid ?? 0) / feesTotal) * 100) : 0;
  const feesUnpaidPct = feesTotal > 0 ? Math.round(((stats?.feesUnpaid ?? 0) / feesTotal) * 100) : 0;

  const enquiryTotal    = Math.max(stats?.enquiries.total ?? 0, 1);
  const enqConvertedPct = Math.round(((stats?.enquiries.converted ?? 0) / enquiryTotal) * 100);
  const enqContactedPct = Math.round(((stats?.enquiries.contacted ?? 0) / enquiryTotal) * 100);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dashboard" />
      <main className="flex-1 p-4 md:p-6 space-y-5">

        {/* Session label */}
        <p className="text-sm text-gray-500 font-medium">
          Session: <span className="text-gray-800">{stats?.currentSession ?? "—"}</span>
        </p>

        {!stats ? (
          <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
            <AlertCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No data available</p>
            <p className="text-sm mt-1">Make sure an active academic session exists in Settings.</p>
            <Link href="/settings" className="inline-block mt-4 text-sm text-blue-600 hover:underline">Go to Settings →</Link>
          </div>
        ) : (
          <>
            {/* ── Row 1: Top stats (matches Smart School top 4 counters) ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Students" value={stats.totalStudents} icon={Users} color="bg-blue-600" href="/students" />
              <StatCard label={`Staff (${teacherCount} Teachers)`} value={totalStaff} icon={UserCog} color="bg-indigo-600" href="/staff" />
              <StatCard label="Fee Payments This Month" value={stats.monthCollection} icon={DollarSign} color="bg-emerald-600" href="/fees/collect" />
              <StatCard label="Expenses This Month" value={`₵${stats.monthExpense.toLocaleString()}`} icon={TrendingDown} color="bg-rose-500" href="/finance" />
            </div>

            {/* ── Row 2: Overview cards (matches Smart School middle section) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

              {/* Fees Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" /> Fees Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>Paid</span><span>{stats.feesPaid} / {stats.feesTotal}</span></div>
                    <ProgressBar value={feesPaidPct} color="bg-emerald-500" />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>Unpaid</span><span>{stats.feesUnpaid} / {stats.feesTotal}</span></div>
                    <ProgressBar value={feesUnpaidPct} color="bg-red-400" />
                  </div>
                  <Link href="/fees/collect" className="block text-xs text-blue-600 hover:underline mt-1">View Fee Collection →</Link>
                </CardContent>
              </Card>

              {/* Student Attendance Today */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-blue-600" /> Student Attendance Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {attTotal === 0 ? (
                    <p className="text-xs text-gray-400">Not marked yet today</p>
                  ) : (
                    <>
                      {[
                        { label: "Present", value: stats.studentAttendance.present, color: "bg-green-500" },
                        { label: "Absent",  value: stats.studentAttendance.absent,  color: "bg-red-400"   },
                        { label: "Late",    value: stats.studentAttendance.late,    color: "bg-yellow-400" },
                        { label: "Half Day",value: stats.studentAttendance.halfDay, color: "bg-blue-400"  },
                      ].map(({ label, value, color }) => (
                        <div key={label}>
                          <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>{label}</span><span>{value} ({attPct(value)}%)</span></div>
                          <ProgressBar value={attPct(value)} color={color} />
                        </div>
                      ))}
                    </>
                  )}
                  <Link href="/attendance" className="block text-xs text-blue-600 hover:underline mt-1">Mark Attendance →</Link>
                </CardContent>
              </Card>

              {/* Staff Attendance Today */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-indigo-600" /> Staff Attendance Today
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    { label: "Present", value: stats.staffAttendance.present, color: "bg-green-500" },
                    { label: "Absent",  value: stats.staffAttendance.absent,  color: "bg-red-400"   },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>{label}</span><span>{value} / {staffTotal} ({staffPct(value)}%)</span></div>
                      <ProgressBar value={staffPct(value)} color={color} />
                    </div>
                  ))}
                  <Link href="/attendance/staff" className="block text-xs text-blue-600 hover:underline mt-1">Mark Staff Attendance →</Link>
                </CardContent>
              </Card>

              {/* Book Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Library className="h-4 w-4 text-purple-600" /> Library Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {[
                    { label: "Total Books",  value: stats.books.total   },
                    { label: "Issued",       value: stats.books.issued  },
                    { label: "Available",    value: stats.books.available },
                    { label: "Overdue",      value: stats.books.dueForReturn },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-800">{value}</span>
                    </div>
                  ))}
                  <Link href="/library" className="block text-xs text-blue-600 hover:underline mt-1">Go to Library →</Link>
                </CardContent>
              </Card>
            </div>

            {/* ── Row 3: Enquiries + Leave + Quick Actions ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Enquiry Overview */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-orange-500" /> Enquiries This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {stats.enquiries.total === 0 ? (
                    <p className="text-xs text-gray-400">No enquiries this month</p>
                  ) : (
                    <>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>Converted</span><span>{stats.enquiries.converted}</span></div>
                        <ProgressBar value={enqConvertedPct} color="bg-emerald-500" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-0.5"><span>Contacted</span><span>{stats.enquiries.contacted}</span></div>
                        <ProgressBar value={enqContactedPct} color="bg-blue-400" />
                      </div>
                      <p className="text-xs text-gray-400">Total: {stats.enquiries.total}</p>
                    </>
                  )}
                  <Link href="/front-office/enquiries" className="block text-xs text-blue-600 hover:underline">View Enquiries →</Link>
                </CardContent>
              </Card>

              {/* Leave This Month */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-teal-600" /> Leave This Month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Students</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {stats.studentLeave.approved} approved</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-yellow-500" /> {stats.studentLeave.total - stats.studentLeave.approved} pending</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Staff</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {stats.staffLeave.approved} approved</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-yellow-500" /> {stats.staffLeave.total - stats.staffLeave.approved} pending</span>
                    </div>
                  </div>
                  <Link href="/leave" className="block text-xs text-blue-600 hover:underline">Manage Leave →</Link>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                    <Link href="/attendance" className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors">
                      <ClipboardList className="h-3.5 w-3.5 shrink-0" /> Mark today's student attendance
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "ACCOUNTANT") && (
                    <Link href="/fees/collect" className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors">
                      <DollarSign className="h-3.5 w-3.5 shrink-0" /> Collect student fees
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <Link href="/students/new" className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors">
                      <Users className="h-3.5 w-3.5 shrink-0" /> Add new student
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                    <Link href="/exam-groups" className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors">
                      <BookOpen className="h-3.5 w-3.5 shrink-0" /> Enter exam marks
                    </Link>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <Link href="/front-office/enquiries" className="flex items-center gap-2 text-xs text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" /> View new enquiries
                    </Link>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Row 4: Today's fee payments ── */}
            {stats.todayPayments.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-600" /> Today's Fee Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">#</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Student</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Time</th>
                        <th className="text-right px-4 py-2.5 text-xs font-medium text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {stats.todayPayments.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{i + 1}</td>
                          <td className="px-4 py-2.5 text-gray-700 text-xs font-medium">{p.studentName || "—"}</td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleTimeString()}</td>
                          <td className="px-4 py-2.5 text-right">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="h-3 w-3" /> Paid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}
