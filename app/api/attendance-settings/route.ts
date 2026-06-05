import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "student" | "staff"

  if (type === "staff") {
    const schedules = await ((await getDb()) as any).staffAttendanceSchedule.findMany({
      where: { isActive: true },
      include: { staffAttendanceType: true },
      orderBy: { role: "asc" },
    });
    return NextResponse.json(schedules);
  }

  // Student attendance schedules
  const schedules = await ((await getDb()) as any).studentAttendanceSchedule.findMany({
    where: { isActive: true },
    include: {
      classSection: {
        include: {
          class: { select: { id: true, name: true } },
          section: { select: { id: true, name: true } },
        },
      },
      attendanceType: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(schedules);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, schedules } = body; // type: "student"|"staff", schedules: array

    if (type === "staff") {
      // Upsert staff schedules
      const results = [];
      for (const s of schedules) {
        const existing = await ((await getDb()) as any).staffAttendanceSchedule.findFirst({
          where: { role: s.role, staffAttendanceTypeId: s.staffAttendanceTypeId },
        });
        const r = existing
          ? await ((await getDb()) as any).staffAttendanceSchedule.update({ where: { id: existing.id }, data: s })
          : await ((await getDb()) as any).staffAttendanceSchedule.create({ data: s });
        results.push(r);
      }
      return NextResponse.json(results);
    }

    // Student schedules
    const results = [];
    for (const s of schedules) {
      const existing = await ((await getDb()) as any).studentAttendanceSchedule.findFirst({
        where: { classSectionId: s.classSectionId, attendanceTypeId: s.attendanceTypeId },
      });
      const r = existing
        ? await ((await getDb()) as any).studentAttendanceSchedule.update({ where: { id: existing.id }, data: s })
        : await ((await getDb()) as any).studentAttendanceSchedule.create({ data: s });
      results.push(r);
    }
    return NextResponse.json(results);
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
