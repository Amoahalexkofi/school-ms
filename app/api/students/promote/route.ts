import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Studentsession_model::updatePromote() + add():
// For each student, upsert a student_session row in the destination session/class.
// If a record already exists for that (studentId, sessionId, classSectionId) it is kept as-is.
// New records are created for students not yet enrolled in the destination.
export async function POST(req: NextRequest) {
  try {
    const { studentIds, toSessionId, toClassSectionId } = await req.json();
    if (!studentIds?.length || !toSessionId || !toClassSectionId)
      return NextResponse.json({ error: "studentIds, toSessionId and toClassSectionId required" }, { status: 422 });

    const db = await getDb();
    let promoted = 0;
    let already  = 0;

    for (const studentId of studentIds) {
      const existing = await (db as any).studentSession.findFirst({
        where: { studentId, sessionId: toSessionId, classSectionId: toClassSectionId },
      });

      if (existing) {
        // Smart School updatePromote — if record exists, ensure it's active
        if (!existing.isActive) {
          await (db as any).studentSession.update({
            where: { id: existing.id },
            data: { isActive: true, isAlumni: false },
          });
          promoted++;
        } else {
          already++;
        }
        continue;
      }

      // Smart School add() — insert new student_session for destination
      await (db as any).studentSession.create({
        data: { studentId, sessionId: toSessionId, classSectionId: toClassSectionId, isActive: true },
      });
      promoted++;
    }

    return NextResponse.json({ promoted, already });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
