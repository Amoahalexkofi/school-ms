import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

// Student self-service leave (Smart School user/Apply_leave): the student is
// always resolved from the session, so this route can only ever read/create
// the caller's own requests. Approval stays on the staff /leave screen.

async function ownStudent() {
  const session = await auth();
  const userId = (session?.user as any)?.id;
  if (!userId) return null;
  const db = (await getDb()) as any;
  return db.student.findFirst({ where: { userId }, select: { id: true, isActive: true } });
}

export async function GET() {
  const student = await ownStudent();
  if (!student) return NextResponse.json({ error: "No student profile" }, { status: 404 });
  const db = (await getDb()) as any;
  const requests = await db.studentLeaveRequest.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(requests);
}

export async function POST(req: NextRequest) {
  try {
    const student = await ownStudent();
    if (!student) return NextResponse.json({ error: "No student profile" }, { status: 404 });
    const { fromDate, toDate, reason } = await req.json();
    if (!fromDate || !toDate)
      return NextResponse.json({ error: "From and To dates are required" }, { status: 422 });
    const from = new Date(fromDate); const to = new Date(toDate);
    if (to < from)
      return NextResponse.json({ error: "To date cannot be before From date" }, { status: 422 });
    const leaveDays = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86400000) + 1);
    const db = (await getDb()) as any;
    const r = await db.studentLeaveRequest.create({
      data: { studentId: student.id, fromDate: from, toDate: to, leaveDays, reason: reason?.trim() || null },
    });
    return NextResponse.json(r, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed to apply" }, { status: 500 });
  }
}
