import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Exam roster (Smart School Examgroup::examstudent / entrystudents): pick the
// subset of a class that sits this exam group. No roster saved → every active
// student of the class is included by default.

// GET ?classSectionId= — all class students with an `assigned` flag; if no
// roster rows exist yet, hasRoster=false (UI shows everyone included).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: examGroupId } = await params;
  const classSectionId = req.nextUrl.searchParams.get("classSectionId");
  if (!classSectionId) return NextResponse.json({ error: "classSectionId is required" }, { status: 422 });

  const db = (await getDb()) as any;
  const schedule = await db.examSchedule.findFirst({
    where: { examGroupId, classSectionId },
    select: { sessionId: true },
  });
  if (!schedule) return NextResponse.json({ error: "No schedules for this exam group / class" }, { status: 404 });

  const [enrollments, roster] = await Promise.all([
    db.studentSession.findMany({
      where: { classSectionId, sessionId: schedule.sessionId, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true, gender: true } },
      },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    }),
    db.examGroupStudent.findMany({
      where: { examGroupId, classSectionId },
      select: { studentId: true },
    }),
  ]);

  const assigned = new Set(roster.map((r: any) => r.studentId));
  return NextResponse.json({
    hasRoster: roster.length > 0,
    students: enrollments.map((e: any) => ({
      ...e.student,
      rollNo: e.rollNo,
      assigned: assigned.has(e.student.id),
    })),
  });
}

// POST { classSectionId, studentIds: [] } — replace the roster for this
// (examGroup, classSection): insert checked, delete unchecked (SS
// Examstudent_model::add_student). Empty studentIds clears the roster,
// which restores the whole-class default.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: examGroupId } = await params;
  try {
    const { classSectionId, studentIds } = await req.json();
    if (!classSectionId || !Array.isArray(studentIds))
      return NextResponse.json({ error: "classSectionId and studentIds are required" }, { status: 422 });

    const db = (await getDb()) as any;
    const existing = await db.examGroupStudent.findMany({
      where: { examGroupId, classSectionId },
      select: { id: true, studentId: true },
    });
    const existingIds = new Set(existing.map((r: any) => r.studentId));
    const wanted = new Set(studentIds as string[]);

    const toDelete = existing.filter((r: any) => !wanted.has(r.studentId)).map((r: any) => r.id);
    const toCreate = (studentIds as string[]).filter(id => !existingIds.has(id));

    await db.$transaction(async (tx: any) => {
      if (toDelete.length) await tx.examGroupStudent.deleteMany({ where: { id: { in: toDelete } } });
      if (toCreate.length)
        await tx.examGroupStudent.createMany({
          data: toCreate.map(studentId => ({ examGroupId, classSectionId, studentId })),
          skipDuplicates: true,
        });
    });

    return NextResponse.json({ ok: true, assigned: wanted.size, hasRoster: wanted.size > 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to save roster" }, { status: 500 });
  }
}
