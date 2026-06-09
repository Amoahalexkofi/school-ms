import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, daysAllowed, isPaid, isActive, description } = await req.json();
  const data: any = {};
  if (name        !== undefined) data.name        = name?.trim()  || null;
  if (daysAllowed !== undefined) data.daysAllowed = daysAllowed ? parseInt(daysAllowed) : 0;
  if (isPaid      !== undefined) data.isPaid      = Boolean(isPaid);
  if (isActive    !== undefined) data.isActive    = Boolean(isActive);
  if (description !== undefined) data.description = description || null;
  const t = await ((await getDb()) as any).leaveType.update({ where: { id }, data });
  return NextResponse.json(t);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).staffLeaveRequest.count({ where: { leaveTypeId: id } });
  if (count > 0) return NextResponse.json({ error: `${count} request(s) use this type` }, { status: 409 });
  await ((await getDb()) as any).leaveType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
