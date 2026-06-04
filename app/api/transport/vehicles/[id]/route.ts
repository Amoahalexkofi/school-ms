import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const v = await (prisma as any).vehicle.update({ where: { id }, data: await req.json() });
  return NextResponse.json(v);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await (prisma as any).vehicle.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
