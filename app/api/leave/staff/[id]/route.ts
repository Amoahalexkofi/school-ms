import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const data: any = {};
  const ALLOWED = ["status","approvedAt","approvedBy","remark"];
  for (const f of ALLOWED) {
    if (f in body) data[f] = body[f];
  }
  if (data.approvedAt) data.approvedAt = new Date(data.approvedAt);

  const db = await getDb();
  const r = await (db as any).staffLeaveRequest.update({ where: { id }, data });

  // Smart School doesn't auto-deduct balance, but we do for accurate tracking
  if (body.status === "APPROVED") {
    const req2 = await (db as any).staffLeaveRequest.findUnique({ where: { id } });
    if (req2) {
      await (db as any).staffLeaveBalance.upsert({
        where: { staffId_leaveTypeId: { staffId: req2.staffId, leaveTypeId: req2.leaveTypeId } },
        create: { staffId: req2.staffId, leaveTypeId: req2.leaveTypeId, totalDays: 0, usedDays: req2.leaveDays },
        update: { usedDays: { increment: req2.leaveDays } },
      });
    }
  }

  return NextResponse.json(r);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).staffLeaveRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
