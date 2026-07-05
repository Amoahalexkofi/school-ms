import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const DAYS = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

// Period attendance by-date matrix (Smart School Subjectattendence::reportbydate):
// rows = students of the class, columns = every timetable period that weekday,
// cells = the attendance-type letter.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classSectionId = searchParams.get("classSectionId");
  const date = searchParams.get("date");
  if (!classSectionId || !date)
    return NextResponse.json({ error: "classSectionId and date are required" }, { status: 422 });

  const db = (await getDb()) as any;
  const day = DAYS[new Date(date + "T00:00:00").getDay()];

  const session = await db.academicSession.findFirst({ where: { isActive: true }, select: { id: true } });
  if (!session) return NextResponse.json({ error: "No active academic session" }, { status: 422 });

  const [slots, enrollments] = await Promise.all([
    db.timetableSlot.findMany({
      where: { classSectionId, day, isActive: true },
      include: {
        subject: { select: { name: true, code: true } },
        staff:   { select: { firstName: true, lastName: true } },
      },
      orderBy: { timeFrom: "asc" },
    }),
    db.studentSession.findMany({
      where: { classSectionId, sessionId: session.id, isActive: true },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true } },
      },
      orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
    }),
  ]);

  const marks = slots.length
    ? await db.studentSubjectAttendance.findMany({
        where: { timetableSlotId: { in: slots.map((s: any) => s.id) }, date: new Date(date) },
        include: { attendanceType: { select: { keyValue: true } } },
      })
    : [];

  // matrix[studentSessionId][slotId] = keyValue
  const matrix: Record<string, Record<string, string>> = {};
  for (const m of marks) {
    (matrix[m.studentSessionId] ??= {})[m.timetableSlotId] = m.attendanceType?.keyValue ?? "?";
  }

  return NextResponse.json({
    day,
    periods: slots.map((s: any) => ({
      id: s.id,
      subject: s.subject?.name ?? "—",
      code: s.subject?.code ?? "",
      timeFrom: s.timeFrom,
      timeTo: s.timeTo,
      teacher: s.staff ? `${s.staff.firstName} ${s.staff.lastName ?? ""}`.trim() : null,
    })),
    rows: enrollments.map((e: any) => ({
      studentSessionId: e.id,
      rollNo: e.rollNo,
      student: e.student,
      marks: matrix[e.id] ?? {},
    })),
  });
}
