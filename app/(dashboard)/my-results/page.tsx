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
          <TrendingUp className="h-10 w-10 mx-auto text-slate-300 mb-3" />
          <p className="font-semibold text-slate-500">No student profile linked</p>
          <p className="text-sm text-slate-400 mt-1">This demo account is not connected to a student record.</p>
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
  let gradeRanges: any[] = [];

  try {
    const db = await getDb();
    student = await (db as any).student.findUnique({
      where: { userId },
      include: {
        sessions: {
          include: { session: true, classSection: { include: { class: true, section: true } } },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }).catch(() => null);

    if (!student) return <NoProfile title="My Results" />;

    const cs = student.sessions[0];
    if (cs) {
      const allGroups = await (db as any).examGroup.findMany({
        where: { isPublished: true },
        include: {
          schedules: {
            where: { sessionId: cs.sessionId, isPublished: true },
            include: { subject: true },
            orderBy: { dateOfExam: "asc" },
          },
        },
        orderBy: { createdAt: "asc" },
      }).catch(() => []);

      // Keep schedules that apply to this student's class-section (or class-wide)
      examGroups = allGroups
        .map((eg: any) => ({
          ...eg,
          schedules: eg.schedules.filter((s: any) => !s.classSectionId || s.classSectionId === cs.classSectionId),
        }))
        .filter((eg: any) => eg.schedules.length > 0);

      const marks = await (db as any).markEntry.findMany({ where: { studentId: student.id } }).catch(() => []);
      markMap = new Map(marks.map((m: any) => [m.examScheduleId, m]));

      gradeRanges = await (db as any).gradeRange.findMany({ orderBy: { markFrom: "desc" } }).catch(() => []);
    }
  } catch {
    return <NoProfile title="My Results" />;
  }

  const currentSession = student.sessions[0];

  function getGrade(obtained: number, full: number) {
    if (!full) return "—";
    const pct = (obtained / full) * 100;
    const r = gradeRanges.find((g: any) => pct >= Number(g.markFrom) && pct <= Number(g.markTo));
    return r?.grade ?? "—";
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="My Results" />
      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-5xl mx-auto w-full">

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-slate-500" />
            </div>
            <div>
              <p className="font-semibold text-[17px] text-slate-900">{student.firstName} {student.lastName}</p>
              <p className="text-slate-500 text-sm mt-0.5">
                {currentSession?.classSection?.class?.name} {currentSession?.classSection?.section?.name} · {currentSession?.session?.session}
              </p>
            </div>
          </div>
        </div>

        {examGroups.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
            <BookOpen className="h-10 w-10 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">No published results yet</p>
            <p className="text-sm text-slate-400 mt-1">Results will appear here once your teacher publishes them.</p>
          </div>
        ) : (
          examGroups.map((eg: any) => {
            const schedules = eg.schedules;
            let totalObtained = 0, totalFull = 0, passed = 0, failed = 0;
            schedules.forEach((s: any) => {
              const m = markMap.get(s.id) as any;
              if (m && m.marksObtained != null) {
                totalObtained += Number(m.marksObtained);
                totalFull     += Number(s.fullMarks ?? 0);
                if (m.isPassing) passed++; else failed++;
              }
            });
            const overallPct = totalFull > 0 ? Math.round((totalObtained / totalFull) * 100) : 0;
            const overallGrade = getGrade(totalObtained, totalFull);

            return (
              <div key={eg.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                      <Award className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{eg.name}</p>
                      <p className="text-xs text-slate-400">{schedules.length} subjects</p>
                    </div>
                  </div>
                  {totalFull > 0 && (
                    <div className="flex items-center gap-5 text-sm">
                      <div className="text-center">
                        <p className="font-semibold text-2xl text-slate-900 tabular-nums">{overallPct}%</p>
                        <p className="text-xs text-slate-400">Overall</p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-2xl text-slate-900">{overallGrade}</p>
                        <p className="text-xs text-slate-400">Grade</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> {passed} passed
                        </span>
                        {failed > 0 && (
                          <span className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full font-semibold">
                            <XCircle className="h-3 w-3" /> {failed} failed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-medium text-slate-500">Subject</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Full Marks</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Obtained</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">%</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Grade</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-slate-500">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schedules.map((s: any) => {
                        const m = markMap.get(s.id) as any;
                        const obt = m?.marksObtained != null ? Number(m.marksObtained) : null;
                        const pct = obt != null && s.fullMarks ? Math.round((obt / s.fullMarks) * 100) : null;
                        const grade = obt != null ? getGrade(obt, s.fullMarks) : "—";
                        return (
                          <tr key={s.id} className="hover:bg-slate-50">
                            <td className="px-6 py-3 font-medium text-slate-800">{s.subject?.name}</td>
                            <td className="text-center px-4 py-3 text-slate-600">{s.fullMarks ?? "—"}</td>
                            <td className="text-center px-4 py-3 font-semibold text-slate-900">{obt ?? "—"}</td>
                            <td className="text-center px-4 py-3 text-slate-600">{pct != null ? `${pct}%` : "—"}</td>
                            <td className="text-center px-4 py-3">
                              {obt != null ? <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${pct! >= 60 ? "bg-emerald-50 text-emerald-700" : pct! >= 40 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"}`}>{grade}</span> : <span className="text-slate-300">—</span>}
                            </td>
                            <td className="text-center px-4 py-3">
                              {m ? (
                                m.isPassing
                                  ? <span className="flex items-center justify-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-3.5 w-3.5" />Pass</span>
                                  : <span className="flex items-center justify-center gap-1 text-xs font-medium text-rose-600"><XCircle className="h-3.5 w-3.5" />Fail</span>
                              ) : <span className="text-slate-300 text-xs">Not entered</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {totalFull > 0 && (
                      <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                          <td className="px-6 py-3 font-semibold text-slate-900">Total</td>
                          <td className="text-center px-4 py-3 font-semibold text-slate-900">{totalFull}</td>
                          <td className="text-center px-4 py-3 font-semibold text-slate-900">{totalObtained}</td>
                          <td className="text-center px-4 py-3 font-semibold text-slate-900">{overallPct}%</td>
                          <td className="text-center px-4 py-3 font-semibold text-slate-900">{overallGrade}</td>
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
