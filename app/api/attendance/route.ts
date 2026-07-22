import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { markAttendance } from "@/lib/services/attendance";
import { getActiveBranchId } from "@/lib/branch";
import { sendSms, attendanceSms } from "@/lib/services/sms";
import { sendWhatsApp, whatsAppAttendanceAlert } from "@/lib/services/whatsapp";
import { sendEmail, attendanceEmail } from "@/lib/email";

// Notify the guardians of absent students (Smart School student_absent_attendence).
// Fire-and-forget; silently no-ops if the school has no SMS/email/WhatsApp provider.
async function notifyAbsent(db: any, records: any[], date: Date) {
  const absentType = await db.attendanceType.findFirst({ where: { keyValue: "A" } }).catch(() => null);
  if (!absentType) return;
  const absentIds = records.filter((r) => r.attendanceTypeId === absentType.id).map((r) => r.studentId);
  if (!absentIds.length) return;

  const [students, profile] = await Promise.all([
    db.student.findMany({
      where: { id: { in: absentIds } },
      select: { firstName: true, lastName: true, mobileNo: true, guardianPhone: true, fatherPhone: true, email: true, guardianEmail: true },
    }),
    db.schoolProfile.findFirst({ select: { name: true } }),
  ]);
  const schoolName = profile?.name ?? "School";
  const dateStr = date.toISOString().slice(0, 10);

  for (const s of students) {
    const phones = [s.mobileNo, s.guardianPhone, s.fatherPhone].filter(Boolean) as string[];
    const emails = [s.email, s.guardianEmail].filter(Boolean) as string[];
    const studentName = `${s.firstName} ${s.lastName}`;
    const p = { studentName, status: "Absent", date: dateStr, schoolName };

    if (phones.length) {
      sendSms(phones, attendanceSms(p), db)
        .then((r) => { if (!r.success) console.error("[attendance] SMS failed for", studentName, r.error); })
        .catch((err) => console.error("[attendance] SMS threw for", studentName, err));
      sendWhatsApp(phones, whatsAppAttendanceAlert(p), db)
        .then((r) => { if (!r.success) console.error("[attendance] WhatsApp failed for", studentName, r.error); })
        .catch((err) => console.error("[attendance] WhatsApp threw for", studentName, err));
    }
    if (emails.length) {
      sendEmail(db, {
        to: emails,
        subject: `Attendance Notice — ${studentName}`,
        html: attendanceEmail(p),
      })
        .then((r) => { if (!r.ok) console.error("[attendance] Email failed for", studentName, r.error); })
        .catch((err) => console.error("[attendance] Email threw for", studentName, err));
    }
  }
}

// GET — returns enrolled students + existing attendance for a given day
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const classSectionId = searchParams.get("classSectionId");
  const sessionId      = searchParams.get("sessionId");
  const date           = searchParams.get("date");

  if (!classSectionId || !sessionId || !date) {
    return NextResponse.json({ error: "classSectionId, sessionId and date are required" }, { status: 400 });
  }

  const branchId = await getActiveBranchId();

  // Students enrolled in this classSection for this session (scoped to active branch)
  const enrollments = await ((await getDb()) as any).studentSession.findMany({
    where: { classSectionId, sessionId, isActive: true, ...(branchId ? { student: { branchId } } : {}) },
    include: {
      student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNo: true, gender: true } },
    },
    orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
  });

  // Existing attendance for this day (if already marked)
  const attendanceDay = await ((await getDb()) as any).attendanceDay.findUnique({
    where: { date_classSectionId: { date: new Date(date), classSectionId } },
    include: {
      studentAttendances: {
        include: { attendanceType: true },
      },
    },
  });

  // Map studentSessionId → existing record
  const existing: Record<string, any> = {};
  if (attendanceDay) {
    for (const a of attendanceDay.studentAttendances) {
      existing[a.studentSessionId] = a;
    }
  }

  return NextResponse.json({ enrollments, existing, attendanceDayId: attendanceDay?.id ?? null });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.classSectionId) return NextResponse.json({ error: "classSectionId is required" }, { status: 400 });
    if (!body.sessionId)      return NextResponse.json({ error: "sessionId is required" },      { status: 400 });
    if (!body.date)           return NextResponse.json({ error: "date is required" },           { status: 400 });
    if (!Array.isArray(body.records) || body.records.length === 0)
      return NextResponse.json({ error: "records must be a non-empty array" }, { status: 400 });
    // Each record must carry the enrollment + type ids — otherwise prisma
    // fails deep inside the transaction with a raw 500.
    for (const r of body.records) {
      if (!r?.studentSessionId || !r?.attendanceTypeId) {
        return NextResponse.json(
          { error: "each record requires studentSessionId and attendanceTypeId" },
          { status: 422 }
        );
      }
    }

    const date = new Date(body.date);
    await markAttendance({
      classSectionId: body.classSectionId,
      sessionId:      body.sessionId,
      date,
      records:        body.records,
    });

    if (body.notify) {
      await notifyAbsent(await getDb(), body.records, date).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
