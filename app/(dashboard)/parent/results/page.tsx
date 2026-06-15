import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { TrendingUp, CheckCircle2, XCircle, Users } from "lucide-react";
import Link from "next/link";

async function getStudentResults(db: any, studentId: string) {
  const student = await (db as any).student.findUnique({
    where: { id: studentId },
    include: {
      studentSessions: {
        include: { session: true, classSection: { include: { class: true, section: true } } },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!student) return null;
  const cs = student.studentSessions[0];

  const examGroups = await (db as any).examGroup.findMany({
    where: { sessionId: cs?.sessionId, isPublished: true },
    include: {
      examSchedules: {
        where: { classId: cs?.classSection?.classId },
        include: { subject: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const marks = await (db as any).studentMark.findMany({
    where: { studentId },
  });
  const markMap = new Map(marks.map((m: any) => [m.examScheduleId, m]));

  const gradeScales = await (db as any).gradingScale.findMany({ orderBy: { percentageFrom: "desc" } });
  function getGrade(obt: number, full: number) {
    if (!full) return "—";
    const pct = (obt / full) * 100;
    const scale = gradeScales.find((g: any) => pct >= g.percentageFrom && pct <= g.percentageTo);
    return scale?.grade ?? "—";
  }

  return { student, cs, examGroups, markMap, getGrade };
}

export default async function ParentResultsPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");
  const user = session.user as any;
  const db = await getDb();

  const parentUser = await (db as any).user.findUnique({ where: { id: user.id } });
  const childIds = (parentUser?.childs ?? "").split(",").map((s: string) => s.trim()).filter(Boolean);

  if (childIds.length === 0) {
    return (
      <div className="flex flex-col flex-1">
        <Topbar title="Results" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="text-center">
            <Users className="h-10 w-10 mx-auto text-white/30 mb-3" />
            <p className="text-white/40 font-medium">No children linked to your account.</p>
            <p className="text-sm text-white/30 mt-1">Contact the school administrator to link your children.</p>
          </div>
        </main>
      </div>
    );
  }

  const childResults = await Promise.all(childIds.map((id: string) => getStudentResults(db, id)));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Results" />
      <main className="flex-1 p-4 md:p-6 space-y-8 max-w-5xl mx-auto w-full">
        {childResults.map((data, idx) => {
          if (!data) return null;
          const { student, cs, examGroups, markMap, getGrade } = data;

          return (
            <div key={childIds[idx]}>
              {/* Child header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#111318]/20 rounded-xl flex items-center justify-center font-black text-sm">
                    {student.firstName[0]}{student.lastName?.[0]}
                  </div>
                  <div>
                    <p className="font-black text-lg">{student.firstName} {student.lastName}</p>
                    <p className="text-indigo-200 text-sm">
                      {cs?.classSection?.class?.name} {cs?.classSection?.section?.name} · {cs?.session?.session}
                    </p>
                  </div>
                </div>
              </div>

              {examGroups.length === 0 ? (
                <div className="text-center py-8 bg-[#111318] rounded-2xl border border-white/[0.04]">
                  <p className="text-white/30 text-sm">No published results yet for this child.</p>
                </div>
              ) : (
                examGroups.map((eg: any) => {
                  let totalObt = 0, totalFull = 0, passed = 0, failed = 0;
                  eg.examSchedules.forEach((s: any) => {
                    const m = markMap.get(s.id) as any;
                    if (m) { totalObt += m.obtainedMark ?? 0; totalFull += s.fullMark ?? 0; m.isPassed ? passed++ : failed++; }
                  });
                  const pct = totalFull > 0 ? Math.round((totalObt / totalFull) * 100) : 0;

                  return (
                    <div key={eg.id} className="bg-[#111318] rounded-2xl border border-white/[0.04] overflow-hidden shadow-sm mb-4">
                      <div className="bg-[#0f1015] border-b px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
                        <p className="font-bold text-white/80">{eg.name}</p>
                        {totalFull > 0 && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-black text-blue-400">{pct}%</span>
                            <span className="font-black text-indigo-400">{getGrade(totalObt, totalFull)}</span>
                            <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">{passed} passed</span>
                            {failed > 0 && <span className="text-xs text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full">{failed} failed</span>}
                          </div>
                        )}
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-[#0f1015] border-b">
                          <tr>
                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-white/40">Subject</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/40">Marks</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/40">Grade</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-white/40">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {eg.examSchedules.map((s: any) => {
                            const m = markMap.get(s.id) as any;
                            const p = m && s.fullMark ? Math.round((m.obtainedMark / s.fullMark) * 100) : null;
                            return (
                              <tr key={s.id} className="hover:bg-[#0f1015]">
                                <td className="px-5 py-2.5 font-medium text-white/70">{s.subject?.name}</td>
                                <td className="text-center px-3 py-2.5 text-white/60">{m ? `${m.obtainedMark}/${s.fullMark}` : "—"}</td>
                                <td className="text-center px-3 py-2.5">
                                  {m ? <span className={`text-xs font-black px-2 py-0.5 rounded-full ${p! >= 60 ? "bg-emerald-500/10 text-emerald-400" : p! >= 40 ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"}`}>{getGrade(m.obtainedMark, s.fullMark)}</span> : <span className="text-white/30">—</span>}
                                </td>
                                <td className="text-center px-3 py-2.5">
                                  {m ? (m.isPassed ? <CheckCircle2 className="h-4 w-4 text-emerald-400 mx-auto" /> : <XCircle className="h-4 w-4 text-rose-400 mx-auto" />) : null}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
