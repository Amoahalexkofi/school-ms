import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET — students enrolled in this exam's classSection + existing marks
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: scheduleId } = await params;

  const schedule = await ((await getDb()) as any).examSchedule.findUnique({
    where: { id: scheduleId },
    include: { subject: true, classSection: { include: { class: true, section: true } } },
  });
  if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

  const [enrollments, existingMarks, gradingScales] = await Promise.all([
    ((await getDb()) as any).studentSession.findMany({
      where: { classSectionId: schedule.classSectionId, sessionId: schedule.sessionId, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
      },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    }),
    ((await getDb()) as any).markEntry.findMany({
      where: { examScheduleId: scheduleId },
    }),
    ((await getDb()) as any).gradingScale.findFirst({
      orderBy: { createdAt: "asc" }, // canonical scale = first created (deterministic)
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

    const db = await getDb();
    const schedule = await (db as any).examSchedule.findUnique({
      where: { id: scheduleId },
      select: { fullMarks: true, passingMarks: true, subjectId: true },
    });
    if (!schedule) return NextResponse.json({ error: "Schedule not found" }, { status: 404 });

    // Fetch grading scale for grade computation (canonical = first created)
    const gradingScale = await (db as any).gradingScale.findFirst({
      orderBy: { createdAt: "asc" },
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

        return (db as any).markEntry.upsert({
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
