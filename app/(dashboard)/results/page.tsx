import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, TrendingUp } from "lucide-react";

async function getResults(userId: string) {
  const student = await ((await getDb()) as any).student.findFirst({
    where: { userId },
  });
  if (!student) return { student: null, groups: [] };

  const markEntries = await ((await getDb()) as any).markEntry.findMany({
    where: {
      studentId: student.id,
      examSchedule: { examGroup: { isPublished: true } },
    },
    include: {
      subject: { select: { name: true, code: true } },
      examSchedule: {
        include: {
          examGroup: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Group by exam group
  const groupMap: Record<string, { name: string; entries: any[] }> = {};
  for (const entry of markEntries) {
    const gId = entry.examSchedule.examGroup.id;
    const gName = entry.examSchedule.examGroup.name;
    if (!groupMap[gId]) groupMap[gId] = { name: gName, entries: [] };
    groupMap[gId].entries.push(entry);
  }

  return { student, groups: Object.values(groupMap) };
}

export default async function ResultsPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id ?? "";
  const role = (session?.user as any)?.role;

  // Admins and teachers see all students; students see their own
  let groups: any[] = [];
  let studentName = "";

  if (role === "STUDENT") {
    const data = await getResults(userId);
    groups = data.groups;
    studentName = data.student
      ? `${data.student.firstName} ${data.student.lastName}`
      : "";
  } else {
    // For admin/teacher: show all published results grouped by exam group
    const allGroups = await ((await getDb()) as any).examGroup.findMany({
      where: { isPublished: true },
      include: {
        schedules: {
          include: {
            markEntries: {
              include: {
                student: { select: { firstName: true, lastName: true, admissionNo: true } },
                subject: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    groups = allGroups.map((g: any) => ({
      name: g.name,
      id: g.id,
      isAdminView: true,
      schedules: g.schedules,
    }));
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Results" />
      <main className="flex-1 p-6 space-y-6">
        {role === "STUDENT" && studentName && (
          <p className="text-sm text-white/40">Showing results for <strong>{studentName}</strong></p>
        )}

        {groups.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No published results yet.</p>
          </div>
        ) : role === "STUDENT" ? (
          // Student view — marksheet per exam group
          <div className="space-y-6">
            {groups.map((g: any) => {
              const total = g.entries.reduce((s: number, e: any) => s + Number(e.marksObtained ?? 0), 0);
              const maxTotal = g.entries.reduce((s: number, e: any) => s + (e.examSchedule?.fullMarks ?? 0), 0);
              const pct = maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0;
              const passed = g.entries.every((e: any) => e.isPassing);

              return (
                <Card key={g.name}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base">{g.name}</CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white/40">{pct}% overall</span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${passed ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                        {passed ? "PASSED" : "FAILED"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <table className="w-full text-sm">
                      <thead className="bg-[#0f1015]">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-white/50">Subject</th>
                          <th className="text-left px-3 py-2 font-medium text-white/50">Marks</th>
                          <th className="text-left px-3 py-2 font-medium text-white/50">%</th>
                          <th className="text-left px-3 py-2 font-medium text-white/50">Grade</th>
                          <th className="text-left px-3 py-2 font-medium text-white/50">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {g.entries.map((e: any) => {
                          const subjectPct = e.examSchedule?.fullMarks > 0
                            ? Math.round((Number(e.marksObtained) / e.examSchedule.fullMarks) * 100)
                            : 0;
                          return (
                            <tr key={e.id} className="hover:bg-[#0f1015]">
                              <td className="px-3 py-2.5 font-medium">{e.subject?.name}</td>
                              <td className="px-3 py-2.5">
                                <span className="font-semibold">{Number(e.marksObtained)}</span>
                                <span className="text-white/30"> / {e.examSchedule?.fullMarks}</span>
                              </td>
                              <td className="px-3 py-2.5 text-white/50">{subjectPct}%</td>
                              <td className="px-3 py-2.5">
                                <span className="font-bold text-blue-400 text-base">{e.grade ?? "—"}</span>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.isPassing ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                  {e.isPassing ? "PASS" : "FAIL"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-[#0f1015] font-semibold">
                          <td className="px-3 py-2.5 text-white/60">Total</td>
                          <td className="px-3 py-2.5">{total} / {maxTotal}</td>
                          <td className="px-3 py-2.5">{pct}%</td>
                          <td />
                          <td />
                        </tr>
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          // Admin/Teacher view — all published results
          <div className="space-y-6">
            {groups.map((g: any) => (
              <Card key={g.id ?? g.name}>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-indigo-400" />
                    {g.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {g.schedules?.map((s: any) => (
                    <div key={s.id} className="mb-4">
                      <p className="text-sm font-medium text-white/60 mb-2">{s.subject?.name ?? s.subjectId}</p>
                      <table className="w-full text-sm">
                        <thead className="bg-[#0f1015]">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-white/50">Student</th>
                            <th className="text-left px-3 py-2 font-medium text-white/50">Admission</th>
                            <th className="text-left px-3 py-2 font-medium text-white/50">Marks</th>
                            <th className="text-left px-3 py-2 font-medium text-white/50">Grade</th>
                            <th className="text-left px-3 py-2 font-medium text-white/50">Result</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {s.markEntries?.map((m: any) => (
                            <tr key={m.id} className="hover:bg-[#0f1015]">
                              <td className="px-3 py-2">{m.student?.firstName} {m.student?.lastName}</td>
                              <td className="px-3 py-2 font-mono text-xs text-white/40">{m.student?.admissionNo}</td>
                              <td className="px-3 py-2">{Number(m.marksObtained)} / {s.fullMarks}</td>
                              <td className="px-3 py-2 font-bold text-blue-400">{m.grade ?? "—"}</td>
                              <td className="px-3 py-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.isPassing ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                                  {m.isPassing ? "PASS" : "FAIL"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
