import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const type = await (prisma as any).feeType.update({ where: { id }, data: body });
  return NextResponse.json(type);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await (prisma as any).feeGroupItem.count({ where: { feeTypeId: id } });
  if (count > 0) return NextResponse.json({ error: `Used in ${count} fee group item(s)` }, { status: 409 });
  await (prisma as any).feeType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
