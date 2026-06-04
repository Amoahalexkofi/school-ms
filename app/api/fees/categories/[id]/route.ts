import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const cat = await (prisma as any).feeCategory.update({ where: { id }, data: body });
    return NextResponse.json(cat);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await (prisma as any).feeType.count({ where: { feeCategoryId: id } });
  if (count > 0) return NextResponse.json({ error: `Cannot delete — ${count} fee type(s) linked` }, { status: 409 });
  await (prisma as any).feeCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
