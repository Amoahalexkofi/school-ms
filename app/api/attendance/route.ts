import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { markAttendance } from "@/lib/services/attendance";

// GET — returns enrolled students + existing attendance for a given day
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const classSectionId = searchParams.get("classSectionId");
  const sessionId      = searchParams.get("sessionId");
  const date           = searchParams.get("date");

  if (!classSectionId || !sessionId || !date) {
    return NextResponse.json({ error: "classSectionId, sessionId and date are required" }, { status: 400 });
  }

  // Students enrolled in this classSection for this session
  const enrollments = await ((await getDb()) as any).studentSession.findMany({
    where: { classSectionId, sessionId, isActive: true },
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

    await markAttendance({
      classSectionId: body.classSectionId,
      sessionId:      body.sessionId,
      date:           new Date(body.date),
      records:        body.records,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
