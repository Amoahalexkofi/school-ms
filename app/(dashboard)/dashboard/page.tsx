import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { Topbar } from "@/components/Topbar";
import { Users, ClipboardList, DollarSign, BookOpen, TrendingUp, AlertCircle, UserCog, Receipt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

function StatCard({ title, value, sub, icon: Icon, color, alert }: {
  title: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; alert?: boolean;
}) {
  return (
    <Card className={alert ? "border-red-200 bg-red-50" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {sub && <p className={`text-xs mt-1 ${alert ? "text-red-600" : "text-gray-500"}`}>{sub}</p>}
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  const stats = await getDashboardStats().catch(() => null);

  const attendancePct = stats && (stats.presentToday + stats.absentToday) > 0
    ? Math.round((stats.presentToday / (stats.presentToday + stats.absentToday)) * 100)
    : null;

  const highAbsence = attendancePct !== null && attendancePct < 75;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Welcome back{session?.user?.email ? `, ${session.user.email.split("@")[0]}` : ""}
          </h2>
          <p className="text-sm text-gray-500">
            {stats ? `Session: ${stats.currentSession}` : "Here's what's happening today"}
          </p>
        </div>

        {stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Active Students"
                value={stats.totalStudents}
                icon={Users}
                color="bg-blue-600"
              />
              <StatCard
                title="Active Staff"
                value={stats.totalStaff}
                icon={UserCog}
                color="bg-indigo-600"
              />
              <StatCard
                title="Today's Attendance"
                value={attendancePct !== null ? `${attendancePct}%` : "Not marked"}
                sub={attendancePct !== null ? `${stats.presentToday} present · ${stats.absentToday} absent` : "No attendance data yet"}
                icon={ClipboardList}
                color={highAbsence ? "bg-red-500" : "bg-green-600"}
                alert={highAbsence}
              />
              <StatCard
                title="Upcoming Exams"
                value={stats.upcomingExams}
                sub="scheduled from today"
                icon={BookOpen}
                color="bg-purple-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                title="Fees Assigned (This Session)"
                value={`₵${stats.totalFeeAssigned.toLocaleString()}`}
                sub={`${stats.totalFeeDeposits} payment records`}
                icon={DollarSign}
                color="bg-yellow-500"
              />
              <StatCard
                title="Fee Payments Recorded"
                value={stats.totalFeeDeposits}
                sub="deposits this session"
                icon={Receipt}
                color="bg-emerald-600"
              />
            </div>

            {highAbsence && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Attendance is below 75% today. Consider sending absence notifications to parents.
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                  <Link href="/attendance" className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2.5 rounded-lg transition-colors">
                    <ClipboardList className="h-4 w-4 shrink-0" /> Mark Today's Attendance
                  </Link>
                )}
                {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "ACCOUNTANT") && (
                  <Link href="/fees/collect" className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 hover:bg-yellow-100 px-3 py-2.5 rounded-lg transition-colors">
                    <DollarSign className="h-4 w-4 shrink-0" /> Collect Fees
                  </Link>
                )}
                {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                  <Link href="/students/new" className="flex items-center gap-2 text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2.5 rounded-lg transition-colors">
                    <Users className="h-4 w-4 shrink-0" /> Add New Student
                  </Link>
                )}
                {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                  <Link href="/exam-groups" className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-2.5 rounded-lg transition-colors">
                    <BookOpen className="h-4 w-4 shrink-0" /> Enter Exam Marks
                  </Link>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-16 text-gray-400 border-2 border-dashed rounded-xl">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No data available</p>
            <p className="text-sm mt-1">Make sure an active academic session exists in Settings.</p>
            <Link href="/settings" className="inline-block mt-4 text-sm text-blue-600 hover:underline">Go to Settings →</Link>
          </div>
        )}
      </main>
    </div>
  );
}
