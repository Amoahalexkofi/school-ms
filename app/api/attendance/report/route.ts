import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sessionId      = searchParams.get("sessionId");
  const classSectionId = searchParams.get("classSectionId");
  const from           = searchParams.get("from");
  const to             = searchParams.get("to");

  if (!sessionId || !classSectionId)
    return NextResponse.json({ error: "sessionId and classSectionId required" }, { status: 400 });

  // All enrolled students for this session+class
  const enrollments = await ((await getDb()) as any).studentSession.findMany({
    where: { classSectionId, sessionId, isActive: true },
    include: {
      student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
    },
    orderBy: [{ rollNo: "asc" }, { student: { firstName: "asc" } }],
  });

  const dateFilter: any = {};
  if (from) dateFilter.gte = new Date(from);
  if (to)   dateFilter.lte = new Date(to);

  // Attendance records for the period
  const attendances = await ((await getDb()) as any).studentAttendance.findMany({
    where: {
      studentSessionId: { in: enrollments.map((e: any) => e.id) },
      ...(Object.keys(dateFilter).length > 0 ? { attendanceDay: { date: dateFilter } } : {}),
    },
    include: { attendanceType: true },
  });

  // Group by studentSessionId
  const bySession: Record<string, any[]> = {};
  for (const a of attendances) {
    if (!bySession[a.studentSessionId]) bySession[a.studentSessionId] = [];
    bySession[a.studentSessionId].push(a);
  }

  const rows = enrollments.map((enr: any) => {
    const records = bySession[enr.id] ?? [];
    const total   = records.length;
    const present = records.filter((r: any) => r.attendanceType?.keyValue === "P").length;
    const late    = records.filter((r: any) => r.attendanceType?.keyValue === "L").length;
    const absent  = records.filter((r: any) => r.attendanceType?.keyValue === "A").length;
    const halfDay = records.filter((r: any) => r.attendanceType?.keyValue === "F").length;
    const holiday = records.filter((r: any) => r.attendanceType?.keyValue === "H").length;
    const schoolDays      = total - holiday;
    const effectivePresent = present + late + halfDay * 0.5;
    const percentage = schoolDays > 0 ? Math.round((effectivePresent / schoolDays) * 100) : 0;

    return {
      student:    enr.student,
      rollNo:     enr.rollNo,
      total, present, late, absent, halfDay, holiday, schoolDays, percentage,
    };
  });

  return NextResponse.json(rows);
}
