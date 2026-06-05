import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const departmentId = searchParams.get("departmentId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "from, to required" }, { status: 400 });
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const where: any = { date: { gte: fromDate, lte: toDate } };
  if (departmentId) {
    where.staff = { departmentId };
  }

  const records = await ((await getDb()) as any).staffAttendance.findMany({
    where,
    include: {
      staff: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeId: true,
          department: { select: { name: true } },
          designation: { select: { name: true } },
        },
      },
      staffAttendanceType: { select: { keyValue: true } },
    },
    orderBy: [{ date: "asc" }, { staffId: "asc" }],
  });

  // Aggregate per staff
  const staffMap: Record<string, any> = {};
  for (const r of records) {
    const sid = r.staff.id;
    if (!staffMap[sid]) {
      staffMap[sid] = {
        staff: r.staff,
        P: 0, A: 0, L: 0, H: 0, F: 0, total: 0,
      };
    }
    const kv = r.staffAttendanceType.keyValue as string;
    if (kv in staffMap[sid]) staffMap[sid][kv]++;
    staffMap[sid].total++;
  }

  const rows = Object.values(staffMap).map((r: any) => ({
    ...r,
    pct: r.total > 0 ? Math.round(((r.P + r.L + r.F) / r.total) * 100) : 0,
  }));

  rows.sort((a: any, b: any) =>
    a.staff.firstName.localeCompare(b.staff.firstName)
  );

  return NextResponse.json(rows);
}
