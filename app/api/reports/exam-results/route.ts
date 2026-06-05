import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const examGroupId = searchParams.get("examGroupId");
  const sessionId = searchParams.get("sessionId");
  const classSectionId = searchParams.get("classSectionId");

  if (!examGroupId) {
    return NextResponse.json({ error: "examGroupId required" }, { status: 400 });
  }

  const scheduleWhere: any = { examGroupId, isActive: true };
  if (sessionId) scheduleWhere.sessionId = sessionId;
  if (classSectionId) scheduleWhere.classSectionId = classSectionId;

  const schedules = await ((await getDb()) as any).examSchedule.findMany({
    where: scheduleWhere,
    include: {
      subject: { select: { name: true } },
      markEntries: {
        include: {
          student: {
            select: {
              id: true, firstName: true, lastName: true, admissionNo: true,
            },
          },
        },
      },
    },
    orderBy: { dateOfExam: "asc" },
  });

  // Build student-centric view
  const studentMap: Record<string, any> = {};
  for (const sched of schedules) {
    for (const me of sched.markEntries) {
      const sid = me.student.id;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          student: me.student,
          subjects: {},
          totalMarks: 0,
          obtainedMarks: 0,
          absent: 0,
        };
      }
      const obtained = Number(me.marksObtained ?? 0);
      const full = sched.fullMarks;
      studentMap[sid].subjects[sched.subject.name] = {
        obtained,
        full,
        passing: sched.passingMarks,
        grade: me.grade,
        isPassing: me.isPassing,
        attendance: me.attendance,
      };
      studentMap[sid].totalMarks += full;
      if (me.attendance === "P") {
        studentMap[sid].obtainedMarks += obtained;
      } else {
        studentMap[sid].absent++;
      }
    }
  }

  const rows = Object.values(studentMap).map((r: any) => ({
    ...r,
    percentage: r.totalMarks > 0
      ? Math.round((r.obtainedMarks / r.totalMarks) * 100 * 10) / 10
      : 0,
    passed: Object.values(r.subjects).every(
      (s: any) => s.attendance !== "P" || s.isPassing
    ),
  }));

  // Rank by percentage descending
  rows.sort((a: any, b: any) => b.percentage - a.percentage);
  rows.forEach((r: any, i: number) => { r.rank = i + 1; });

  const subjectNames = schedules.map((s: any) => s.subject.name);

  return NextResponse.json({ rows, subjectNames });
}
