import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await (prisma as any).itemCategory.update({ where: { id }, data: await req.json() }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await (prisma as any).item.count({ where: { categoryId: id } });
  if (count > 0) return NextResponse.json({ error: `${count} items use this category` }, { status: 409 });
  await (prisma as any).itemCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
