import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");
  const classSectionId = searchParams.get("classSectionId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!sessionId || !from || !to) {
    return NextResponse.json({ error: "sessionId, from, to required" }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const dayWhere: any = {
    sessionId,
    date: { gte: fromDate, lte: toDate },
  };
  if (classSectionId) dayWhere.classSectionId = classSectionId;

  const days = await ((await getDb()) as any).attendanceDay.findMany({
    where: dayWhere,
    include: {
      studentAttendances: {
        include: {
          student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } },
          attendanceType: { select: { keyValue: true } },
        },
      },
      classSection: {
        include: {
          class: { select: { name: true } },
          section: { select: { name: true } },
        },
      },
    },
    orderBy: { date: "asc" },
  });

  // Aggregate per student
  const studentMap: Record<string, any> = {};
  for (const day of days) {
    for (const sa of day.studentAttendances) {
      const sid = sa.student.id;
      if (!studentMap[sid]) {
        studentMap[sid] = {
          student: sa.student,
          classSection: day.classSection,
          P: 0, A: 0, L: 0, H: 0, F: 0, total: 0,
        };
      }
      const kv = sa.attendanceType.keyValue as string;
      if (kv in studentMap[sid]) studentMap[sid][kv]++;
      studentMap[sid].total++;
    }
  }

  const rows = Object.values(studentMap).map((r: any) => ({
    ...r,
    schoolDays: r.P + r.A + r.L + r.F,
    pct: r.total > 0 ? Math.round(((r.P + r.L + r.F) / r.total) * 100) : 0,
  }));

  rows.sort((a: any, b: any) =>
    a.student.firstName.localeCompare(b.student.firstName)
  );

  return NextResponse.json({ rows, totalDays: days.length });
}
