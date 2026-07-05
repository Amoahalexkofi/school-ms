import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Stdtransfer (Promote Student):
//  pass + continue → student_session row in the DESTINATION session + class
//  fail + continue → row in the destination session but the SOURCE class (repeats the year)
//  leave (result ignored) → NO new row; the current-session row gets is_leave + is_alumni
// Fees, roll numbers and default_login are untouched (fee assignment is its own module).

// GET — promotable roster (SS searchNonPromotedStudents): students of the
// source session/class who have not left and have no row in the destination session.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const fromSessionId = sp.get("fromSessionId");
  const fromClassSectionId = sp.get("fromClassSectionId");
  const toSessionId = sp.get("toSessionId");
  if (!fromSessionId || !fromClassSectionId || !toSessionId)
    return NextResponse.json({ error: "fromSessionId, fromClassSectionId, toSessionId required" }, { status: 422 });

  const db = (await getDb()) as any;
  const enrollments = await db.studentSession.findMany({
    where: {
      sessionId: fromSessionId,
      classSectionId: fromClassSectionId,
      isActive: true,
      isLeave: false,
      student: { isActive: true },
    },
    include: {
      student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true, fatherName: true, dateOfBirth: true } },
    },
    orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
  });

  const already = await db.studentSession.findMany({
    where: { sessionId: toSessionId, studentId: { in: enrollments.map((e: any) => e.studentId) } },
    select: { studentId: true },
  });
  const promotedIds = new Set(already.map((r: any) => r.studentId));

  return NextResponse.json({
    students: enrollments
      .filter((e: any) => !promotedIds.has(e.studentId))
      .map((e: any) => ({ ...e.student, rollNo: e.rollNo, studentSessionId: e.id })),
    alreadyPromoted: promotedIds.size,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { fromSessionId, fromClassSectionId, toSessionId, toClassSectionId, students } = await req.json();
    if (!fromSessionId || !fromClassSectionId || !toSessionId || !toClassSectionId || !Array.isArray(students) || students.length === 0)
      return NextResponse.json({ error: "source, destination and students[] are required" }, { status: 422 });
    if (fromSessionId === toSessionId)
      return NextResponse.json({ error: "Destination session must differ from the current session" }, { status: 422 });

    const db = (await getDb()) as any;
    let promoted = 0, retained = 0, left = 0, skipped = 0;

    for (const s of students) {
      const result = s.result === "fail" ? "fail" : "pass";
      const status = s.status === "leave" ? "leave" : "continue";

      if (status === "leave") {
        // SS updatePromote + alumni_student_status: flag the CURRENT session row.
        const updated = await db.studentSession.updateMany({
          where: { studentId: s.studentId, sessionId: fromSessionId, classSectionId: fromClassSectionId },
          data: { isLeave: true, isAlumni: true },
        });
        if (updated.count > 0) left++; else skipped++;
        continue;
      }

      // continue → destination class on pass, same class on fail
      const targetClassSectionId = result === "pass" ? toClassSectionId : fromClassSectionId;

      // SS add_student_session: upsert by (studentId, sessionId)
      const existing = await db.studentSession.findFirst({
        where: { studentId: s.studentId, sessionId: toSessionId },
      });
      if (existing) {
        if (existing.classSectionId !== targetClassSectionId || !existing.isActive) {
          await db.studentSession.update({
            where: { id: existing.id },
            data: { classSectionId: targetClassSectionId, isActive: true, isLeave: false, isAlumni: false },
          });
        } else { skipped++; continue; }
      } else {
        await db.studentSession.create({
          data: { studentId: s.studentId, sessionId: toSessionId, classSectionId: targetClassSectionId, isActive: true },
        });
      }
      if (result === "pass") promoted++; else retained++;
    }

    return NextResponse.json({ promoted, retained, left, skipped });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
