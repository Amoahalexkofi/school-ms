import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sendSms } from "@/lib/services/sms";
import { sendWhatsApp } from "@/lib/services/whatsapp";

// Mirrors Smart School's Studentsubjectattendence_model — student_subject_attendances table
// Each record ties a student's session enrollment to a specific timetable slot on a date.

// Notify guardians of students absent from a period (Smart School fires
// 'student_absent_attendence' with the subject_timetable row so the message
// names the period). Fire-and-forget; no-ops without a provider.
async function notifyPeriodAbsent(db: any, records: any[], timetableSlotId: string, date: string) {
  const absentType = await db.attendanceType.findFirst({ where: { keyValue: "A" } }).catch(() => null);
  if (!absentType) return;
  const absentSsIds = records
    .filter((r) => r.attendanceTypeId === absentType.id)
    .map((r) => r.studentSessionId);
  if (!absentSsIds.length) return;

  const [slot, enrollments, profile] = await Promise.all([
    db.timetableSlot.findUnique({
      where: { id: timetableSlotId },
      include: { subject: { select: { name: true } } },
    }),
    db.studentSession.findMany({
      where: { id: { in: absentSsIds } },
      include: { student: { select: { firstName: true, lastName: true, mobileNo: true, guardianPhone: true, fatherPhone: true } } },
    }),
    db.schoolProfile.findFirst({ select: { name: true } }),
  ]);
  const schoolName = profile?.name ?? "School";
  const subjectName = slot?.subject?.name ?? "class";
  const period = slot?.timeFrom && slot?.timeTo ? ` (${slot.timeFrom}–${slot.timeTo})` : "";

  for (const e of enrollments) {
    const s = e.student;
    if (!s) continue;
    const phones = [s.mobileNo, s.guardianPhone, s.fatherPhone].filter(Boolean) as string[];
    if (!phones.length) continue;
    const msg = `${schoolName}: ${s.firstName} ${s.lastName ?? ""} was marked Absent in ${subjectName}${period} on ${date}.`;
    sendSms(phones, msg, db).catch(() => null);
    sendWhatsApp(phones, msg, db).catch(() => null);
  }
}

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
    const { records, notify } = await req.json();
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

    if (notify && records[0]?.timetableSlotId && records[0]?.date) {
      await notifyPeriodAbsent(db, records, records[0].timetableSlotId, records[0].date).catch(() => null);
    }

    return NextResponse.json(results, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
