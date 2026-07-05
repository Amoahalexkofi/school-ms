import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Roster loader for period attendance marking (Smart School
// Subjectattendence::index search): one timetable period + date → the class
// roster with any existing period marks.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const timetableSlotId = searchParams.get("timetableSlotId");
  const date = searchParams.get("date");
  if (!timetableSlotId || !date)
    return NextResponse.json({ error: "timetableSlotId and date are required" }, { status: 422 });

  const db = (await getDb()) as any;
  const slot = await db.timetableSlot.findUnique({
    where: { id: timetableSlotId },
    include: {
      subject: { select: { id: true, name: true, code: true } },
      staff:   { select: { id: true, firstName: true, lastName: true } },
      classSection: { include: { class: true, section: true } },
    },
  });
  if (!slot) return NextResponse.json({ error: "Timetable period not found" }, { status: 404 });

  const session = slot.sessionId
    ? { id: slot.sessionId }
    : await db.academicSession.findFirst({ where: { isActive: true }, select: { id: true } });
  if (!session) return NextResponse.json({ error: "No active academic session" }, { status: 422 });

  const [enrollments, existing] = await Promise.all([
    db.studentSession.findMany({
      where: { classSectionId: slot.classSectionId, sessionId: session.id, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
      },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    }),
    db.studentSubjectAttendance.findMany({
      where: { timetableSlotId, date: new Date(date) },
    }),
  ]);

  // keyed by studentSessionId for pre-fill
  const existingMap: Record<string, any> = {};
  for (const r of existing) existingMap[r.studentSessionId] = r;

  return NextResponse.json({ slot, enrollments, existing: existingMap });
}
