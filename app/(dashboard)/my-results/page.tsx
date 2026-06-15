import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { TrendingUp, Award, BookOpen, CheckCircle2, XCircle } from "lucide-react";

export default async function MyResultsPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const userId = (session.user as any).id;

  const db = await getDb();

  // Get student record
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

  if (!student) redirect("/dashboard");

  const currentSession = student.studentSessions[0];
  const classId    = currentSession?.classSection?.classId;
  const sectionId  = currentSession?.classSection?.sectionId;
  const sessionId  = currentSession?.sessionId;

  // Get all exam groups for this session
  const examGroups = await (db as any).examGroup.findMany({
    where: { sessionId, isPublished: true },
    include: {
      examSchedules: {
        where: { classId },
        include: { subject: true },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Get all marks for this student
  const marks = await (db as any).studentMark.findMany({
    where: { studentId: student.id },
    include: { examSchedule: { include: { examGroup: true, subject: true } } },
  });
  const markMap = new Map(marks.map((m: any) => [m.examScheduleId, m]));

  // Get grade scale
  const gradeScales = await (db as any).gradingScale.findMany({ orderBy: { percentageFrom: "desc" } });
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
            <div className="w-12 h-12 bg-[#111318]/20 rounded-xl flex items-center justify-center">
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
          <div className="text-center py-16 bg-[#111318] rounded-2xl border border-white/[0.04]">
            <BookOpen className="h-10 w-10 mx-auto text-white/30 mb-3" />
            <p className="text-white/40 font-medium">No published results yet</p>
            <p className="text-sm text-white/30 mt-1">Results will appear here once your teacher publishes them.</p>
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
              <div key={eg.id} className="bg-[#111318] rounded-2xl border border-white/[0.04] overflow-hidden shadow-sm">
                {/* Exam group header */}
                <div className="bg-[#0f1015] border-b px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
                      <Award className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white/80">{eg.name}</p>
                      <p className="text-xs text-white/30">{schedules.length} subjects</p>
                    </div>
                  </div>
                  {totalFull > 0 && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-black text-2xl text-blue-400">{overallPct}%</p>
                        <p className="text-xs text-white/30">Overall</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-2xl text-indigo-400">{overallGrade}</p>
                        <p className="text-xs text-white/30">Grade</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold">
                          <CheckCircle2 className="h-3 w-3" /> {passed} passed
                        </span>
                        {failed > 0 && (
                          <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full font-bold">
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
                    <thead className="bg-[#0f1015] border-b">
                      <tr>
                        <th className="text-left px-6 py-3 text-xs font-semibold text-white/40">Subject</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-white/40">Full Marks</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-white/40">Obtained</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-white/40">%</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-white/40">Grade</th>
                        <th className="text-center px-4 py-3 text-xs font-semibold text-white/40">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {schedules.map((s: any) => {
                        const m = markMap.get(s.id) as any;
                        const pct = m && s.fullMark ? Math.round((m.obtainedMark / s.fullMark) * 100) : null;
                        const grade = m ? getGrade(m.obtainedMark, s.fullMark) : "—";
                        return (
                          <tr key={s.id} className="hover:bg-[#0f1015]">
                            <td className="px-6 py-3 font-medium text-white/70">{s.subject?.name}</td>
                            <td className="text-center px-4 py-3 text-white/50">{s.fullMark ?? "—"}</td>
                            <td className="text-center px-4 py-3 font-bold text-white/80">{m?.obtainedMark ?? "—"}</td>
                            <td className="text-center px-4 py-3 text-white/50">{pct != null ? `${pct}%` : "—"}</td>
                            <td className="text-center px-4 py-3">
                              {m ? <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${pct! >= 60 ? "bg-emerald-500/10 text-emerald-400" : pct! >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>{grade}</span> : <span className="text-white/30">—</span>}
                            </td>
                            <td className="text-center px-4 py-3">
                              {m ? (
                                m.isPassed
                                  ? <span className="flex items-center justify-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5" />Pass</span>
                                  : <span className="flex items-center justify-center gap-1 text-xs font-bold text-rose-400"><XCircle className="h-3.5 w-3.5" />Fail</span>
                              ) : <span className="text-white/30 text-xs">Not entered</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    {totalFull > 0 && (
                      <tfoot className="bg-[#0f1015] border-t">
                        <tr>
                          <td className="px-6 py-3 font-bold text-white/80">Total</td>
                          <td className="text-center px-4 py-3 font-bold text-white/80">{totalFull}</td>
                          <td className="text-center px-4 py-3 font-black text-blue-400">{totalObtained}</td>
                          <td className="text-center px-4 py-3 font-black text-blue-400">{overallPct}%</td>
                          <td className="text-center px-4 py-3 font-black text-indigo-400">{overallGrade}</td>
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
