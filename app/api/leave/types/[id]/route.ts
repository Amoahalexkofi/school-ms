import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.daysAllowed !== undefined) body.daysAllowed = parseInt(body.daysAllowed);
  const t = await (prisma as any).leaveType.update({ where: { id }, data: body });
  return NextResponse.json(t);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await (prisma as any).staffLeaveRequest.count({ where: { leaveTypeId: id } });
  if (count > 0) return NextResponse.json({ error: `${count} request(s) use this type` }, { status: 409 });
  await (prisma as any).leaveType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
