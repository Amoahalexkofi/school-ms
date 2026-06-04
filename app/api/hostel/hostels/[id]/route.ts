import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await (prisma as any).hostel.update({ where: { id }, data: await req.json() }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await (prisma as any).hostel.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
