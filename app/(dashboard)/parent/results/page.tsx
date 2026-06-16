import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { CheckCircle2, XCircle, Users } from "lucide-react";

async function getStudentResults(db: any, studentId: string) {
  const student = await (db as any).student.findUnique({
    where: { id: studentId },
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
  if (!cs) return { student, cs: null, examGroups: [], markMap: new Map(), getGrade: () => "—" };

  console.log("[results] student:", studentId, "sessionId:", cs.sessionId, "classSectionId:", cs.classSectionId);

  // Step 1: exam groups
  let allGroups: any[] = [];
  try {
    allGroups = await (db as any).examGroup.findMany({
      where: { isPublished: true },
      include: {
        schedules: {
          where: { sessionId: cs.sessionId },
          include: { subject: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    console.log("[results] examGroups fetched:", allGroups.length);
  } catch (e: any) {
    console.error("[results] examGroup query FAILED:", e?.message ?? e);
    throw e;
  }

  const examGroups = allGroups
    .map((eg: any) => ({
      ...eg,
      schedules: eg.schedules.filter(
        (s: any) => !s.classSectionId || s.classSectionId === cs.classSectionId
      ),
    }))
    .filter((eg: any) => eg.schedules.length > 0);

  // Step 2: marks
  let marks: any[] = [];
  try {
    marks = await (db as any).markEntry.findMany({ where: { studentId } });
    console.log("[results] markEntries fetched:", marks.length);
  } catch (e: any) {
    console.error("[results] markEntry query FAILED:", e?.message ?? e);
    throw e;
  }
  const markMap = new Map(marks.map((m: any) => [m.examScheduleId, m]));

  // Step 3: grade ranges (non-fatal)
  let gradeRanges: any[] = [];
  try {
    gradeRanges = await (db as any).gradeRange.findMany({ orderBy: { markFrom: "desc" } });
  } catch (e: any) {
    console.error("[results] gradeRange query FAILED (non-fatal):", e?.message ?? e);
  }

  function getGrade(obt: number, full: number): string {
    if (!full) return "—";
    const pct = (obt / full) * 100;
    const range = gradeRanges.find(
      (g: any) => pct >= Number(g.markFrom) && pct <= Number(g.markTo)
    );
    return range?.grade ?? "—";
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
            <Users className="h-10 w-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No children linked to your account.</p>
            <p className="text-sm text-gray-400 mt-1">Contact the school administrator to link your children.</p>
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
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-5 text-white mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-sm">
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

              {!cs || examGroups.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-400 text-sm">No published results yet for this child.</p>
                </div>
              ) : (
                examGroups.map((eg: any) => {
                  let totalObt = 0, totalFull = 0, passed = 0, failed = 0;
                  eg.schedules.forEach((s: any) => {
                    const m = markMap.get(s.id) as any;
                    if (m) {
                      totalObt  += Number(m.marksObtained ?? 0);
                      totalFull += Number(s.fullMarks ?? 0);
                      m.isPassing ? passed++ : failed++;
                    }
                  });
                  const pct = totalFull > 0 ? Math.round((totalObt / totalFull) * 100) : 0;

                  return (
                    <div key={eg.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-4">
                      <div className="bg-gray-50 border-b px-5 py-3.5 flex items-center justify-between flex-wrap gap-2">
                        <p className="font-bold text-gray-900">{eg.name}</p>
                        {totalFull > 0 && (
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-black text-blue-600">{pct}%</span>
                            <span className="font-black text-indigo-600">{getGrade(totalObt, totalFull)}</span>
                            <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">{passed} passed</span>
                            {failed > 0 && <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">{failed} failed</span>}
                          </div>
                        )}
                      </div>
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500">Subject</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500">Marks</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500">Grade</th>
                            <th className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {eg.schedules.map((s: any) => {
                            const m = markMap.get(s.id) as any;
                            const obt = Number(m?.marksObtained ?? 0);
                            const p = m && s.fullMarks ? Math.round((obt / s.fullMarks) * 100) : null;
                            return (
                              <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-5 py-2.5 font-medium text-gray-800">{s.subject?.name}</td>
                                <td className="text-center px-3 py-2.5 text-gray-700">{m ? `${obt}/${s.fullMarks}` : "—"}</td>
                                <td className="text-center px-3 py-2.5">
                                  {m ? (
                                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${p! >= 60 ? "bg-emerald-100 text-emerald-700" : p! >= 40 ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                                      {getGrade(obt, s.fullMarks)}
                                    </span>
                                  ) : <span className="text-gray-300">—</span>}
                                </td>
                                <td className="text-center px-3 py-2.5">
                                  {m ? (m.isPassing
                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600 mx-auto" />
                                    : <XCircle className="h-4 w-4 text-rose-600 mx-auto" />
                                  ) : null}
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
