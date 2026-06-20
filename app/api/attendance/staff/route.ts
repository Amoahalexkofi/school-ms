import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getActiveBranchId } from "@/lib/branch";

// GET — staff list + existing attendance for a date
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const date         = searchParams.get("date");
  const departmentId = searchParams.get("departmentId");

  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  const branchId = await getActiveBranchId();
  const where: any = { isActive: true };
  if (departmentId) where.departmentId = departmentId;
  if (branchId) where.branchId = branchId;

  const [staff, existing] = await Promise.all([
    ((await getDb()) as any).staff.findMany({
      where,
      include: {
        department:  { select: { name: true } },
        designation: { select: { name: true } },
      },
      orderBy: { firstName: "asc" },
    }),
    ((await getDb()) as any).staffAttendance.findMany({
      where: { date: new Date(date) },
      include: { staffAttendanceType: true },
    }),
  ]);

  const existingMap: Record<string, any> = {};
  for (const a of existing) existingMap[a.staffId] = a;

  return NextResponse.json({ staff, existingMap });
}

// POST — upsert staff attendance for a date
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.date) return NextResponse.json({ error: "date is required" }, { status: 400 });
    if (!Array.isArray(body.records) || body.records.length === 0)
      return NextResponse.json({ error: "records required" }, { status: 400 });

    const date = new Date(body.date);
    const db = await getDb();

    await Promise.all(
      body.records.map((r: any) =>
        (db as any).staffAttendance.upsert({
          where: { staffId_date: { staffId: r.staffId, date } },
          create: {
            staffId:              r.staffId,
            date,
            staffAttendanceTypeId: r.staffAttendanceTypeId,
            inTime:  r.inTime  || null,
            outTime: r.outTime || null,
            remark:  r.remark  || null,
          },
          update: {
            staffAttendanceTypeId: r.staffAttendanceTypeId,
            inTime:  r.inTime  || null,
            outTime: r.outTime || null,
            remark:  r.remark  || null,
          },
        })
      )
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
