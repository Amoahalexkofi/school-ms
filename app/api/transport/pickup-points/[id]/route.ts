import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await (prisma as any).pickupPoint.update({ where: { id }, data: await req.json() });
  return NextResponse.json(p);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await (prisma as any).pickupPoint.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
