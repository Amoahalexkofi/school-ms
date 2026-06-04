import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.approvedAt) body.approvedAt = new Date(body.approvedAt);
  const r = await (prisma as any).staffLeaveRequest.update({ where: { id }, data: body });
  // If approved, deduct from balance
  if (body.status === "APPROVED") {
    const req2 = await (prisma as any).staffLeaveRequest.findUnique({ where: { id } });
    if (req2) {
      await (prisma as any).staffLeaveBalance.upsert({
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
  await (prisma as any).staffLeaveRequest.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
