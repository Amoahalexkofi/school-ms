import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";

// Multi-class students (Smart School Student::multiclass / savemulticlass):
// a student can sit in several class-sections within the same session, as
// multiple StudentSession rows. defaultLogin marks the primary class.

// GET ?classId=&sectionId= — students of that class (current session) with ALL
// their current-session memberships.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const sectionId = searchParams.get("sectionId");
  if (!classId) return NextResponse.json({ error: "classId is required" }, { status: 422 });

  const db = await getDb();
  const session = await (db as any).academicSession.findFirst({ where: { isActive: true } });
  if (!session) return NextResponse.json({ error: "No active academic session" }, { status: 422 });

  const branchId = await getActiveBranchId();
  const students = await (db as any).student.findMany({
    where: {
      isActive: true,
      ...(branchId ? { branchId } : {}),
      sessions: {
        some: {
          sessionId: session.id,
          classSection: { classId, ...(sectionId ? { sectionId } : {}) },
        },
      },
    },
    select: {
      id: true, admissionNo: true, firstName: true, middleName: true, lastName: true,
      sessions: {
        where: { sessionId: session.id },
        select: {
          id: true, classSectionId: true, defaultLogin: true, rollNo: true,
          classSection: { include: { class: true, section: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { firstName: "asc" },
  });

  return NextResponse.json({ sessionId: session.id, session: session.session, students });
}

// POST { studentId, entries: [{ classSectionId, defaultLogin? }] } — replace the
// student's full set of current-session memberships (insert missing, delete
// removed), mirroring Studentsession_model::add.
export async function POST(req: NextRequest) {
  try {
    const { studentId, entries } = await req.json();
    if (!studentId || !Array.isArray(entries) || entries.length === 0)
      return NextResponse.json({ error: "studentId and at least one class are required" }, { status: 422 });

    const ids = entries.map((e: any) => e.classSectionId).filter(Boolean);
    if (ids.length !== entries.length)
      return NextResponse.json({ error: "Every row needs a class and section" }, { status: 422 });
    if (new Set(ids).size !== ids.length)
      return NextResponse.json({ error: "Duplicate class-section rows are not allowed" }, { status: 422 });

    const db = await getDb();
    const session = await (db as any).academicSession.findFirst({ where: { isActive: true } });
    if (!session) return NextResponse.json({ error: "No active academic session" }, { status: 422 });

    // Exactly one primary (defaultLogin) membership.
    let defaultId = entries.find((e: any) => e.defaultLogin)?.classSectionId ?? ids[0];

    const existing = await (db as any).studentSession.findMany({
      where: { studentId, sessionId: session.id },
      include: {
        classSection: { include: { class: true, section: true } },
        _count: { select: { attendances: true, feesMasters: true, subjectAttendances: true, studentTransportFees: true } },
      },
    });

    // Memberships being removed must not carry records (attendance, fees…).
    const toDelete = existing.filter((r: any) => !ids.includes(r.classSectionId));
    for (const r of toDelete) {
      const c = r._count;
      if (c.attendances || c.feesMasters || c.subjectAttendances || c.studentTransportFees) {
        return NextResponse.json({
          error: `Cannot remove ${r.classSection.class.name} – ${r.classSection.section.name}: it has attendance or fee records. Disable instead.`,
        }, { status: 409 });
      }
    }

    const existingIds = existing.map((r: any) => r.classSectionId);
    const toCreate = ids.filter((id: string) => !existingIds.includes(id));

    await (db as any).$transaction(async (tx: any) => {
      if (toDelete.length)
        await tx.studentSession.deleteMany({ where: { id: { in: toDelete.map((r: any) => r.id) } } });
      for (const classSectionId of toCreate) {
        await tx.studentSession.create({
          data: { studentId, sessionId: session.id, classSectionId, defaultLogin: classSectionId === defaultId },
        });
      }
      // Sync the primary flag on kept rows.
      await tx.studentSession.updateMany({
        where: { studentId, sessionId: session.id, classSectionId: { not: defaultId } },
        data: { defaultLogin: false },
      });
      await tx.studentSession.updateMany({
        where: { studentId, sessionId: session.id, classSectionId: defaultId },
        data: { defaultLogin: true },
      });
    });

    return NextResponse.json({ ok: true, created: toCreate.length, removed: toDelete.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to save" }, { status: 500 });
  }
}
