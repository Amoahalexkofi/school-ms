import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.capacity) body.capacity = parseInt(body.capacity);
  return NextResponse.json(await (prisma as any).hostelRoom.update({ where: { id }, data: body }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await (prisma as any).hostelAllocation.count({ where: { roomId: id } });
  if (count > 0) return NextResponse.json({ error: "Room has occupants" }, { status: 409 });
  await (prisma as any).hostelRoom.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
