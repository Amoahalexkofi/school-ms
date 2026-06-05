import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status  = searchParams.get("status");
  const staffId = searchParams.get("staffId");
  const where: any = {};
  if (status)  where.status  = status;
  if (staffId) where.staffId = staffId;
  const requests = await ((await getDb()) as any).staffLeaveRequest.findMany({
    where,
    include: {
      staff:     { select: { firstName: true, lastName: true, employeeId: true, department: { select: { name: true } } } },
      leaveType: { select: { name: true, daysAllowed: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { staffId, leaveTypeId, fromDate, toDate, reason } = body;
    if (!staffId || !leaveTypeId || !fromDate || !toDate)
      return NextResponse.json({ error: "staffId, leaveTypeId, fromDate, toDate required" }, { status: 422 });
    const from = new Date(fromDate); const to = new Date(toDate);
    const leaveDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1);
    const req2 = await ((await getDb()) as any).staffLeaveRequest.create({
      data: { staffId, leaveTypeId, fromDate: from, toDate: to, leaveDays, reason: reason || null },
    });
    return NextResponse.json(req2, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
