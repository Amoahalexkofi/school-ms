import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status");
  const where: any = {};
  if (status) where.status = status;
  const requests = await (prisma as any).studentLeaveRequest.findMany({
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
    const r = await (prisma as any).studentLeaveRequest.create({
      data: { studentId, fromDate: new Date(fromDate), toDate: new Date(toDate), reason: reason || null },
    });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) { return NextResponse.json({ error: err.message }, { status: 500 }); }
}
