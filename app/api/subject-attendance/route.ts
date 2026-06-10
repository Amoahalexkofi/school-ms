import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Mirrors Smart School's Studentsubjectattendence_model — student_subject_attendances table
// Each record ties a student's session enrollment to a specific timetable slot on a date.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentSessionId = searchParams.get("studentSessionId");
  const timetableSlotId  = searchParams.get("timetableSlotId");
  const date             = searchParams.get("date");

  if (!studentSessionId) {
    return NextResponse.json({ error: "studentSessionId is required" }, { status: 422 });
  }
  const db = await getDb();
  const where: any = { studentSessionId };
  if (timetableSlotId) where.timetableSlotId = timetableSlotId;
  if (date)            where.date = new Date(date);

  const records = await (db as any).studentSubjectAttendance.findMany({
    where,
    include: { attendanceType: true, timetableSlot: { include: { subject: true } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(records);
}

export async function POST(req: NextRequest) {
  try {
    const { records } = await req.json();
    // records: [{ studentSessionId, timetableSlotId, attendanceTypeId, date, remark? }]
    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ error: "records[] is required" }, { status: 422 });
    }
    const db = await getDb();
    const results = await (db as any).$transaction(
      records.map((r: any) =>
        (db as any).studentSubjectAttendance.upsert({
          where: {
            studentSessionId_timetableSlotId_date: {
              studentSessionId: r.studentSessionId,
              timetableSlotId:  r.timetableSlotId,
              date:             new Date(r.date),
            },
          },
          create: {
            studentSessionId: r.studentSessionId,
            timetableSlotId:  r.timetableSlotId,
            attendanceTypeId: r.attendanceTypeId,
            date:             new Date(r.date),
            remark:           r.remark || null,
          },
          update: {
            attendanceTypeId: r.attendanceTypeId,
            remark:           r.remark || null,
          },
        })
      )
    );
    return NextResponse.json(results, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
