import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { TrendingUp, Award, BookOpen, CheckCircle2, XCircle } from "lucide-react";

function NoProfile({ title }: { title: string }) {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title={title} />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <TrendingUp className="h-10 w-10 mx-auto text-gray-300 mb-3" />
          <p className="font-semibold text-gray-500">No student profile linked</p>
          <p className="text-sm text-gray-400 mt-1">This demo account is not connected to a student record.</p>
        </div>
      </main>
    </div>
  );
}

export default async function MyResultsPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;

  let student: any = null;
  let examGroups: any[] = [];
  let markMap = new Map<string, any>();
  let gradeScales: any[] = [];

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

    if (!student) return <NoProfile title="My Results" />;

    const currentSession = student.studentSessions[0];
    const classId   = currentSession?.classSection?.classId;
    const sessionId = currentSession?.sessionId;

    [examGroups, gradeScales] = await Promise.all([
      (db as any).examGroup.findMany({
        where: { sessionId, isPublished: true },
        include: { examSchedules: { where: { classId }, include: { subject: true }, orderBy: { date: "asc" } } },
        orderBy: { createdAt: "asc" },
      }).catch(() => []),
      (db as any).gradingScale.findMany({ orderBy: { percentageFrom: "desc" } }).catch(() => []),
    ]);

    const marks = await (db as any).studentMark.findMany({
      where: { studentId: student.id },
      include: { examSchedule: { include: { examGroup: true, subject: true } } },
    }).catch(() => []);
    markMap = new Map(marks.map((m: any) => [m.examScheduleId, m]));
  } catch {
    return <NoProfile title="My Results" />;
  }

  const currentSession = student.studentSessions[0];

  function getGrade(obtained: number, full: number) {
    if (!full) return "—";
    const pct = (obtained / full) * 100;
    const scale = gradeScales.find((g: any) => pct >= g.percentageFrom && pct <= g.percentageTo);
    return scale?.grade ?? "—";
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Results" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black text-xl">{student.firstName} {student.lastName}</p>
              <p className="text-blue-200 text-sm">
                {currentSession?.classSection?.class?.name} {currentSession?.classSection?.section?.name} · {currentSession?.session?.session}
              </p>
            </div>
          </div>
        </div>

        {examGroups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <BookOpen className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No published results yet</p>
            <p className="text-sm text-gray-400 mt-1">Results will appear here once your teacher publishes them.</p>
          </div>
        ) : (
          examGroups.map((eg: any) => {
            const schedules = eg.examSchedules;
            let totalObtained = 0, totalFull = 0, passed = 0, failed = 0;
            schedules.forEach((s: any) => {
              const m = markMap.get(s.id) as any;
              if (m) {
                totalObtained += m.obtainedMark ?? 0;
                totalFull     += s.fullMark ?? 0;
                if (m.isPassed) passed++; else failed++;
              }
            });
            const overallPct = totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : 0;
            const overallGrade = getGrade(totalObtained, totalFull);

            return (
              <div key={eg.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Exam group header */}
                <div className="bg-gray-50 border-b px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{eg.name}</p>
                      <p className="text-xs text-gray-400">{schedules.length} subjects</p>
                    </div>
                  </div>
                  {totalFull > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-black text-2xl text-blue-600">{overallPct}%</p>
                        <p className="text-xs text-gray-400">Overall</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-2xl text-indigo-600">{overallGrade}</p>
                        <p className="text-xs text-gray-400">Grade</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 className="h-3 w-3" /> {passed} passed
                        </span>
                        {failed > 0 && (
                          <span className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full font-bold">
                            <XCircle className="h-3 w-3" /> {failed} failed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Marks table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500">Subject</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Full Marks</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Obtained</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">%</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Grade</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {schedules.map((s: any) => {
                        const m = markMap.get(s.id) as any;
                        const pct = m && s.fullMark ? Math.round((m.obtainedMark / s.fullMark) * 100) : null;
                        const grade = m ? getGrade(m.obtainedMark, s.fullMark) : "—";
                        return (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-6 py-3 font-medium text-gray-800">{s.subject?.name}</td>
                            <td className="text-center px-4 py-3 text-gray-600">{s.fullMark ?? "—"}</td>
                            <td className="text-center px-4 py-3 font-bold text-gray-900">{m?.obtainedMark ?? "—"}</td>
                            <td className="text-center px-4 py-3 text-gray-600">{pct != null ? `${pct}%` : "—"}</td>
                            <td className="text-center px-4 py-3">
                              {m ? <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${pct! >= 60 ? "bg-emerald-100 text-emerald-700" : pct! >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{grade}</span> : <span className="text-gray-300">—</span>}
                            </td>
                            <td className="text-center px-4 py-3">
                              {m ? (
                                m.isPassed
                                  ? <span className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Pass</span>
                                  : <span className="flex items-center justify-center gap-1 text-xs font-bold text-rose-600"><XCircle className="h-3.5 w-3.5" />Fail</span>
                              ) : <span className="text-gray-300 text-xs">Not entered</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {totalFull > 0 && (
                      <tfoot className="bg-gray-50 border-t">
                        <tr>
                          <td className="px-6 py-3 font-bold text-gray-900">Total</td>
                          <td className="text-center px-4 py-3 font-bold text-gray-900">{totalFull}</td>
                          <td className="text-center px-4 py-3 font-black text-blue-600">{totalObtained}</td>
                          <td className="text-center px-4 py-3 font-black text-blue-600">{overallPct}%</td>
                          <td className="text-center px-4 py-3 font-black text-indigo-600">{overallGrade}</td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
