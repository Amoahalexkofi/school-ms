import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ClipboardList, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";

export default async function MyAttendancePage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;
  const db = await getDb();

  const student = await (db as any).student.findUnique({
    where: { userId },
    include: {
      studentSessions: {
        include: { session: true, classSection: { include: { class: true, section: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!student) return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Attendance" />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-500">No student profile linked</p>
          <p className="text-sm text-gray-400 mt-1">This account is not connected to a student record yet.</p>
        </div>
      </main>
    </div>
  );

  const currentSession = student.studentSessions[0];
  if (!currentSession) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="My Attendance" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <p className="text-gray-400">No active session found.</p>
        </main>
      </div>
    );
  }

  // Get all attendance records for this student session
  const attendanceRecords = await (db as any).studentAttendance.findMany({
    where: { studentSessionId: currentSession.id },
    include: { attendanceDay: true, attendanceType: true },
    orderBy: { attendanceDay: { date: "desc" } },
  });

  // Stats
  const stats = { P: 0, A: 0, L: 0, H: 0, F: 0 };
  for (const r of attendanceRecords) {
    const key = r.attendanceType?.keyValue as keyof typeof stats;
    if (key && key in stats) stats[key]++;
  }
  const total = stats.P + stats.A + stats.L + stats.H + stats.F;
  const presentPct = total > 0 ? Math.round(((stats.P + stats.L) / (total - stats.H)) * 100) : 0;

  // Group by month
  const byMonth: Record<string, typeof attendanceRecords> = {};
  for (const r of attendanceRecords) {
    const month = new Date(r.attendanceDay.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(r);
  }

  const typeStyle: Record<string, string> = {
    P: "bg-emerald-100 text-emerald-700",
    A: "bg-rose-100 text-rose-700",
    L: "bg-amber-100 text-amber-700",
    H: "bg-blue-100 text-blue-700",
    F: "bg-purple-100 text-purple-700",
  };
  const typeLabel: Record<string, string> = { P: "Present", A: "Absent", L: "Late", H: "Holiday", F: "Half Day" };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Attendance" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* Header card */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-xl">{student.firstName} {student.lastName}</p>
              <p className="text-emerald-200 text-sm">
                {currentSession.classSection?.class?.name} {currentSession.classSection?.section?.name} · {currentSession.session?.session}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(stats).map(([key, val]) => (
              <div key={key} className="bg-white/15 rounded-xl p-3 text-center">
                <p className="text-2xl font-black">{val}</p>
                <p className="text-xs text-white/70 mt-0.5">{typeLabel[key]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attendance % bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-bold text-gray-800">Overall Attendance</p>
            <p className={`text-2xl font-black ${presentPct >= 75 ? "text-emerald-600" : "text-rose-600"}`}>{presentPct}%</p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${presentPct >= 75 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${presentPct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {presentPct >= 75
              ? "Good attendance. Keep it up!"
              : "⚠️ Attendance below 75% minimum requirement."}
          </p>
        </div>

        {/* Monthly breakdown */}
        {Object.entries(byMonth).map(([month, records]) => (
          <div key={month} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b bg-gray-50">
              <Calendar className="h-4 w-4 text-gray-400" />
              <p className="font-bold text-gray-800 text-sm">{month}</p>
              <span className="ml-auto text-xs text-gray-400">{records.length} days</span>
            </div>
            <div className="divide-y">
              {records.map((r: any) => {
                const kv = r.attendanceType?.keyValue ?? "P";
                return (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center text-xs font-bold text-gray-600">
                        {new Date(r.attendanceDay.date).getDate()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {new Date(r.attendanceDay.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        {r.remark && <p className="text-xs text-gray-400">{r.remark}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeStyle[kv] ?? "bg-gray-100 text-gray-600"}`}>
                      {typeLabel[kv] ?? kv}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {attendanceRecords.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <ClipboardList className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No attendance records yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
