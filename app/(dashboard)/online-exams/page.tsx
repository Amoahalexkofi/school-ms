import { prisma } from "@/lib/prisma";
import { Topbar } from "@/components/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, CheckCircle, Clock, Users } from "lucide-react";

async function getExamsData() {
  const exams = await (prisma as any).onlineExam.findMany({
    include: {
      class: true,
      _count: { select: { questions: true, attempts: true } },
      attempts: { where: { submittedAt: { not: null } }, select: { score: true, total: true } },
    },
    orderBy: { startTime: "desc" },
  });
  return exams;
}

function statusLabel(exam: any) {
  const now = new Date();
  if (!exam.isPublished) return { label: "Draft", color: "bg-gray-100 text-gray-600" };
  if (now < new Date(exam.startTime)) return { label: "Upcoming", color: "bg-blue-100 text-blue-700" };
  if (now > new Date(exam.endTime)) return { label: "Ended", color: "bg-gray-100 text-gray-600" };
  return { label: "Live", color: "bg-green-100 text-green-700" };
}

export default async function OnlineExamsPage() {
  const exams = await getExamsData();

  const live = exams.filter((e: any) => {
    const now = new Date();
    return e.isPublished && now >= new Date(e.startTime) && now <= new Date(e.endTime);
  }).length;
  const totalAttempts = exams.reduce((s: number, e: any) => s + e._count.attempts, 0);

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Online Exams" />
      <main className="flex-1 p-6 space-y-8">

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Exams</p>
              <p className="text-3xl font-bold">{exams.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Live Now</p>
              <p className={`text-3xl font-bold ${live > 0 ? "text-green-600" : "text-gray-800"}`}>{live}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Total Attempts</p>
              <p className="text-3xl font-bold">{totalAttempts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">Published</p>
              <p className="text-3xl font-bold">{exams.filter((e: any) => e.isPublished).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Exams list */}
        {exams.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-gray-500">
              No online exams created yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {exams.map((exam: any) => {
              const { label, color } = statusLabel(exam);
              const submitted = exam.attempts.length;
              const avgScore = submitted > 0
                ? Math.round(exam.attempts.reduce((s: number, a: any) => s + ((a.score ?? 0) / (a.total || 1)) * 100, 0) / submitted)
                : null;

              return (
                <Card key={exam.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Monitor className="h-4 w-4 text-blue-600" />
                          <p className="font-semibold">{exam.title}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>
                        </div>
                        {exam.class && (
                          <p className="text-xs text-gray-500 mb-2">Class: {exam.class.name}</p>
                        )}
                        {exam.instructions && (
                          <p className="text-sm text-gray-600 mb-2">{exam.instructions}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {exam.duration} min
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> {exam._count.questions} questions
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" /> {exam._count.attempts} attempts
                          </span>
                          <span>Start: {new Date(exam.startTime).toLocaleString()}</span>
                          <span>End: {new Date(exam.endTime).toLocaleString()}</span>
                        </div>
                      </div>
                      {submitted > 0 && avgScore !== null && (
                        <div className="text-right shrink-0">
                          <p className="text-2xl font-bold text-blue-600">{avgScore}%</p>
                          <p className="text-xs text-gray-500">avg score</p>
                          <p className="text-xs text-gray-400">{submitted} submitted</p>
                        </div>
                      )}
                    </div>

                    {/* Per-student results if ended */}
                    {label === "Ended" && exam.attempts.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs font-medium text-gray-600 mb-2">Results</p>
                        <div className="flex flex-wrap gap-2">
                          {exam.attempts.map((a: any, i: number) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded font-medium ${
                              ((a.score ?? 0) / (a.total || 1)) >= 0.5 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}>
                              {a.score ?? 0}/{a.total ?? 0}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
