import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ClipboardList, Calendar } from "lucide-react";

function NoProfile() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Attendance" />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-500">No student profile linked</p>
          <p className="text-sm text-slate-400 mt-1">This demo account is not connected to a student record.</p>
        </div>
      </main>
    </div>
  );
}

export default async function MyAttendancePage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;

  let student: any = null;
  let attendanceRecords: any[] = [];

  try {
    const db = await getDb();
    student = await (db as any).student.findUnique({
      where: { userId },
      include: {
        studentSessions: {
          include: { session: true, classSection: { include: { class: true, section: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }).catch(() => null);

    if (!student) return <NoProfile />;

    const currentSession = student.studentSessions[0];
    if (currentSession) {
      attendanceRecords = await (db as any).studentAttendance.findMany({
        where: { studentSessionId: currentSession.id },
        include: { attendanceDay: true, attendanceType: true },
        orderBy: { attendanceDay: { date: "desc" } },
      }).catch(() => []);
    }
  } catch {
    return <NoProfile />;
  }

  if (!student) return <NoProfile />;

  const currentSession = student.studentSessions[0];

  const stats = { P: 0, A: 0, L: 0, H: 0, F: 0 };
  for (const r of attendanceRecords) {
    const key = r.attendanceType?.keyValue as keyof typeof stats;
    if (key && key in stats) stats[key]++;
  }
  const total = stats.P + stats.A + stats.L + stats.H + stats.F;
  const presentPct = total > 0 ? Math.round(((stats.P + stats.L) / (total - stats.H || 1)) * 100) : 0;

  const byMonth: Record<string, typeof attendanceRecords> = {};
  for (const r of attendanceRecords) {
    const month = new Date(r.attendanceDay.date).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(r);
  }

  const typeStyle: Record<string, string> = {
    P: "bg-emerald-50 text-emerald-700", A: "bg-rose-50 text-rose-700",
    L: "bg-amber-50 text-amber-700", H: "bg-slate-100 text-slate-600", F: "bg-indigo-50 text-indigo-700",
  };
  const typeLabel: Record<string, string> = { P: "Present", A: "Absent", L: "Late", H: "Holiday", F: "Half Day" };

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Attendance" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-4xl mx-auto w-full">

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-[17px] text-slate-900">{student.firstName} {student.lastName}</p>
              <p className="text-slate-500 text-sm mt-0.5">
                {currentSession?.classSection?.class?.name} {currentSession?.classSection?.section?.name} · {currentSession?.session?.session}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {Object.entries(stats).map(([key, val]) => (
              <div key={key} className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-semibold text-slate-900 tabular-nums">{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{typeLabel[key]}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-slate-800">Overall attendance</p>
            <p className={`text-2xl font-semibold tabular-nums ${presentPct >= 75 ? "text-emerald-600" : "text-rose-600"}`}>{presentPct}%</p>
          </div>
          <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${presentPct >= 75 ? "bg-emerald-500" : "bg-rose-500"}`} style={{ width: `${presentPct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {presentPct >= 75 ? "Good attendance. Keep it up!" : "⚠️ Attendance below 75% minimum requirement."}
          </p>
        </div>

        {Object.entries(byMonth).map(([month, records]) => (
          <div key={month} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <Calendar className="h-4 w-4 text-slate-400" />
              <p className="font-semibold text-slate-800 text-sm">{month}</p>
              <span className="ml-auto text-xs text-slate-400">{records.length} days</span>
            </div>
            <div className="divide-y divide-slate-100">
              {records.map((r: any) => {
                const kv = r.attendanceType?.keyValue ?? "P";
                return (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-600">
                        {new Date(r.attendanceDay.date).getDate()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {new Date(r.attendanceDay.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                        </p>
                        {r.remark && <p className="text-xs text-slate-400">{r.remark}</p>}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${typeStyle[kv] ?? "bg-slate-100 text-slate-600"}`}>
                      {typeLabel[kv] ?? kv}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {attendanceRecords.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <ClipboardList className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No attendance records yet</p>
          </div>
        )}
      </main>
    </div>
  );
}
