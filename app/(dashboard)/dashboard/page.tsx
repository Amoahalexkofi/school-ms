import { auth } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/dashboard";
import { Topbar } from "@/components/Topbar";
import { Users, ClipboardList, DollarSign, BookOpen, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StatCard({
  title, value, sub, icon: Icon, color, alert,
}: {
  title: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  alert?: boolean;
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
  const stats = await getDashboardStats("session-2026").catch(() => null);

  const attendancePct = stats && (stats.presentToday + stats.absentToday) > 0
    ? Math.round((stats.presentToday / (stats.presentToday + stats.absentToday)) * 100)
    : 0;

  const highAbsence = attendancePct < 75 && (stats?.presentToday ?? 0) + (stats?.absentToday ?? 0) > 0;

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dashboard" />
      <main className="flex-1 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-1">
            Welcome back{session?.user?.email ? `, ${session.user.email.split("@")[0]}` : ""}
          </h2>
          <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening today</p>
        </div>

        {stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={Users}
                color="bg-blue-600"
              />
              <StatCard
                title="Today's Attendance"
                value={`${attendancePct}%`}
                sub={`${stats.presentToday} present · ${stats.absentToday} absent`}
                icon={ClipboardList}
                color={highAbsence ? "bg-red-500" : "bg-green-600"}
                alert={highAbsence}
              />
              <StatCard
                title="Fees Collected"
                value={`₵${stats.collectedFees.toLocaleString()}`}
                sub={`₵${stats.pendingFees.toLocaleString()} pending`}
                icon={DollarSign}
                color="bg-yellow-500"
              />
              <StatCard
                title="Upcoming Exams"
                value={stats.upcomingExams}
                icon={BookOpen}
                color="bg-purple-600"
              />
            </div>

            {highAbsence && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                Attendance is below 75% today. Consider sending absence notifications to parents.
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                    <a href="/attendance" className="block text-sm text-blue-600 hover:underline">→ Mark today&apos;s attendance</a>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "ACCOUNTANT") && (
                    <a href="/fees" className="block text-sm text-blue-600 hover:underline">→ View outstanding invoices</a>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN") && (
                    <a href="/students" className="block text-sm text-blue-600 hover:underline">→ Manage students</a>
                  )}
                  {(role === "ADMIN" || role === "SUPER_ADMIN" || role === "TEACHER") && (
                    <a href="/exam-groups" className="block text-sm text-blue-600 hover:underline">→ Enter exam marks</a>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-gray-600">Staff Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalStaff}</div>
                  <p className="text-xs text-gray-500 mt-1">Total staff members</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">No data available for this session.</div>
        )}
      </main>
    </div>
  );
}
