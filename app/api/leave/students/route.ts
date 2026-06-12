import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const requests = await ((await getDb()) as any).studentLeaveRequest.findMany({
    where,
    include: { student: { select: { firstName: true, lastName: true, admissionNo: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}
export async function POST(req: NextRequest) {
  try {
    const { studentId, fromDate, toDate, reason } = await req.json();
    if (!studentId || !fromDate || !toDate)
      return NextResponse.json({ error: "studentId, fromDate, toDate required" }, { status: 422 });
    const from = new Date(fromDate); const to = new Date(toDate);
    const leaveDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1);
    const r = await ((await getDb()) as any).studentLeaveRequest.create({
      data: { studentId, fromDate: from, toDate: to, leaveDays, reason: reason || null },
    });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
