"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Clock, CheckCircle, ListChecks, Trophy, CalendarClock, XCircle } from "lucide-react";

type Attempt = { id: string; score: number | null; total: number | null; submittedAt: string | null };

type Exam = {
  id: string;
  title: string;
  instructions?: string;
  duration: number;
  passingPercentage?: number;
  startTime: string;
  endTime: string;
  class?: { name: string };
  _count: { questions: number };
  attempts?: Attempt[];
};

function phase(exam: Exam): "upcoming" | "live" | "ended" {
  const now = new Date();
  if (now < new Date(exam.startTime)) return "upcoming";
  if (now > new Date(exam.endTime)) return "ended";
  return "live";
}

export function StudentExamsClient({
  exams,
  hasProfile,
}: {
  exams: Exam[];
  hasProfile: boolean;
}) {
  const stats = useMemo(() => {
    let live = 0,
      upcoming = 0,
      completed = 0;
    for (const e of exams) {
      const submitted = e.attempts?.some((a) => a.submittedAt);
      if (submitted) completed++;
      else if (phase(e) === "live") live++;
      else if (phase(e) === "upcoming") upcoming++;
    }
    return { total: exams.length, live, upcoming, completed };
  }, [exams]);

  return (
    <main className="flex-1 p-4 md:p-6 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Available Exams", value: stats.total, extra: "" },
          { label: "Live Now", value: stats.live, extra: stats.live > 0 ? "text-green-600" : "" },
          { label: "Upcoming", value: stats.upcoming, extra: "" },
          { label: "Completed", value: stats.completed, extra: "" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-4">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.extra}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {!hasProfile && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This account isn&apos;t linked to a student record yet, so your results
          won&apos;t be tracked. Contact your school office.
        </div>
      )}

      {/* Exam list */}
      {exams.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-gray-500">
            No exams are available for you right now. Check back when your teacher
            publishes one.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {exams.map((exam) => {
            const p = phase(exam);
            const attempt = exam.attempts?.find((a) => a.submittedAt) ?? exam.attempts?.[0];
            const submitted = !!attempt?.submittedAt;
            const pct =
              submitted && attempt && attempt.total
                ? Math.round(((attempt.score ?? 0) / attempt.total) * 100)
                : null;
            const passed =
              pct !== null && exam.passingPercentage != null
                ? pct >= exam.passingPercentage
                : null;

            return (
              <Card key={exam.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Monitor className="h-4 w-4 text-blue-600 shrink-0" />
                        <p className="font-semibold">{exam.title}</p>
                        {submitted ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-100 text-indigo-700">
                            Completed
                          </span>
                        ) : p === "live" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                            Live
                          </span>
                        ) : p === "upcoming" ? (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                            Upcoming
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                            Ended
                          </span>
                        )}
                        {exam.class && <span className="text-xs text-gray-500">· {exam.class.name}</span>}
                      </div>
                      {exam.instructions && (
                        <p className="text-sm text-gray-500 mb-2 line-clamp-1">{exam.instructions}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {exam.duration} min
                        </span>
                        <span className="flex items-center gap-1">
                          <ListChecks className="h-3 w-3" /> {exam._count.questions} questions
                        </span>
                        {p === "upcoming" ? (
                          <span className="flex items-center gap-1">
                            <CalendarClock className="h-3 w-3" /> Starts {new Date(exam.startTime).toLocaleString()}
                          </span>
                        ) : (
                          <span>Closes {new Date(exam.endTime).toLocaleString()}</span>
                        )}
                      </div>
                    </div>

                    {pct !== null && (
                      <div className="text-right shrink-0">
                        <p className={`text-2xl font-bold ${passed === false ? "text-red-500" : "text-green-600"}`}>
                          {pct}%
                        </p>
                        <p className="text-xs text-gray-400">your score</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3 pt-3 border-t flex-wrap">
                    {submitted ? (
                      <Link href={`/online-exams/take/${exam.id}`}>
                        <Button size="sm" variant="outline">
                          <Trophy className="h-3 w-3 mr-1" /> View Result
                        </Button>
                      </Link>
                    ) : p === "live" ? (
                      <Link href={`/online-exams/take/${exam.id}`}>
                        <Button size="sm">
                          <CheckCircle className="h-3 w-3 mr-1" /> Start Exam
                        </Button>
                      </Link>
                    ) : p === "upcoming" ? (
                      <Button size="sm" variant="outline" disabled>
                        <CalendarClock className="h-3 w-3 mr-1" /> Not started yet
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="text-gray-400">
                        <XCircle className="h-3 w-3 mr-1" /> Missed
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
