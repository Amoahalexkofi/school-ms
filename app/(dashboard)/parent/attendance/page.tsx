import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { ClipboardList, Users } from "lucide-react";

export default async function ParentAttendancePage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const user = session.user as any;
  const db = await getDb();

  const parentUser = await (db as any).user.findUnique({ where: { id: user.id } });
  const childIds = (parentUser?.childs ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);

  if (childIds.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="Attendance" />
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No children linked to your account.</p>
          </div>
        </main>
      </div>
    );
  }

  const typeStyle: Record<string, string> = { P:"bg-emerald-100 text-emerald-700", A:"bg-rose-100 text-rose-700", L:"bg-amber-100 text-amber-700", H:"bg-blue-100 text-blue-700", F:"bg-purple-100 text-purple-700" };
  const typeLabel: Record<string, string> = { P:"Present", A:"Absent", L:"Late", H:"Holiday", F:"Half Day" };

  const children = await Promise.all(childIds.map(async (id: string) => {
    const student = await (db as any).student.findUnique({
      where: { id },
      include: {
        sessions: {
          include: { session: true, classSection: { include: { class: true, section: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
    if (!student) return null;
    const cs = student.sessions[0];
    const records = await (db as any).studentAttendance.findMany({
      where: { studentSessionId: cs?.id },
      include: { attendanceDay: true, attendanceType: true },
      orderBy: { attendanceDay: { date: "desc" } },
      take: 30,
    });
    const stats = { P:0, A:0, L:0, H:0, F:0 };
    for (const r of records) { const k = r.attendanceType?.keyValue as keyof typeof stats; if (k in stats) stats[k]++; }
    const total = stats.P + stats.A + stats.L + stats.H + stats.F;
    const pct = total > 0 ? Math.round(((stats.P + stats.L) / (total - stats.H || 1)) * 100) : 0;
    return { student, cs, records, stats, pct };
  }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Attendance" />
      <main className="flex-1 p-4 md:p-6 space-y-8 max-w-4xl mx-auto w-full">
        {children.map((data, idx) => {
          if (!data) return null;
          const { student, cs, records, stats, pct } = data;
          return (
            <div key={childIds[idx]}>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-sm">{student.firstName[0]}{student.lastName?.[0]}</div>
                  <div>
                    <p className="font-black text-lg">{student.firstName} {student.lastName}</p>
                    <p className="text-emerald-200 text-sm">{cs?.classSection?.class?.name} {cs?.classSection?.section?.name}</p>
                  </div>
                  <div className={`ml-auto text-right`}>
                    <p className={`text-3xl font-black ${pct >= 75 ? "text-white" : "text-rose-300"}`}>{pct}%</p>
                    <p className="text-emerald-200 text-xs">Attendance</p>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {(["P","A","L","H","F"] as const).map(k => (
                    <div key={k} className="bg-white/15 rounded-lg p-2 text-center">
                      <p className="font-black text-lg">{stats[k]}</p>
                      <p className="text-[10px] text-white/70">{typeLabel[k]}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <p className="px-5 py-3 text-sm font-bold text-gray-700 border-b bg-gray-50">Last 30 days</p>
                <div className="divide-y max-h-80 overflow-y-auto">
                  {records.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-gray-400">No records found.</p>
                  ) : records.map((r: any) => {
                    const kv = r.attendanceType?.keyValue ?? "P";
                    return (
                      <div key={r.id} className="flex items-center justify-between px-5 py-3">
                        <p className="text-sm text-gray-700">
                          {new Date(r.attendanceDay.date).toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" })}
                        </p>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${typeStyle[kv] ?? "bg-gray-100 text-gray-600"}`}>{typeLabel[kv] ?? kv}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
