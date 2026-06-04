import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — students enrolled in this exam's classSection + existing marks
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: scheduleId } = await params;

  const schedule = await (prisma as any).examSchedule.findUnique({
    where: { id: scheduleId },
    include: { subject: true, classSection: { include: { class: true, section: true } } },
  });
  if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

  const [enrollments, existingMarks, gradingScales] = await Promise.all([
    (prisma as any).studentSession.findMany({
      where: { classSectionId: schedule.classSectionId, sessionId: schedule.sessionId, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
      },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    }),
    (prisma as any).markEntry.findMany({
      where: { examScheduleId: scheduleId },
    }),
    (prisma as any).gradingScale.findFirst({
      include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
    }),
  ]);

  const marksMap: Record<string, any> = {};
  for (const m of existingMarks) marksMap[m.studentId] = m;

  return NextResponse.json({ schedule, enrollments, marksMap, gradingScale: gradingScales });
}

// POST — save/upsert mark entries
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: scheduleId } = await params;
  try {
    const { records } = await req.json();
    if (!Array.isArray(records)) return NextResponse.json({ error: "records required" }, { status: 422 });

    const schedule = await (prisma as any).examSchedule.findUnique({
      where: { id: scheduleId },
      select: { fullMarks: true, passingMarks: true, subjectId: true },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    // Fetch grading scale for grade computation
    const gradingScale = await (prisma as any).gradingScale.findFirst({
      include: { ranges: { where: { isActive: true }, orderBy: { markFrom: "desc" } } },
    });

    function computeGrade(marks: number | null): string | null {
      if (marks === null || !gradingScale) return null;
      const pct = (marks / schedule.fullMarks) * 100;
      for (const r of gradingScale.ranges) {
        if (pct >= Number(r.markFrom) && pct <= Number(r.markTo)) return r.grade;
      }
      return null;
    }

    await Promise.all(
      records.map((r: any) => {
        const marks   = r.attendance === "A" ? null : (r.marksObtained !== "" ? parseFloat(r.marksObtained) : null);
        const isPassing = marks !== null && marks >= schedule.passingMarks;
        const grade   = computeGrade(marks);

        return (prisma as any).markEntry.upsert({
          where: { examScheduleId_studentId: { examScheduleId: scheduleId, studentId: r.studentId } },
          create: {
            examScheduleId: scheduleId,
            studentId:      r.studentId,
            subjectId:      schedule.subjectId,
            marksObtained:  marks,
            attendance:     r.attendance || "P",
            grade,
            isPassing,
            note: r.note || null,
          },
          update: {
            marksObtained: marks,
            attendance:    r.attendance || "P",
            grade,
            isPassing,
            note: r.note || null,
          },
        });
      })
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
