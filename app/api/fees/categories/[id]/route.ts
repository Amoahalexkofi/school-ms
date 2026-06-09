import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const { name, description, isActive } = await req.json();
    const data: any = {};
    if (name        !== undefined) data.name        = name?.trim()  || null;
    if (description !== undefined) data.description = description   || null;
    if (isActive    !== undefined) data.isActive    = Boolean(isActive);
    const cat = await ((await getDb()) as any).feeCategory.update({ where: { id }, data });
    return NextResponse.json(cat);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).feeType.count({ where: { feeCategoryId: id } });
  if (count > 0) return NextResponse.json({ error: `Cannot delete — ${count} fee type(s) linked` }, { status: 409 });
  await ((await getDb()) as any).feeCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
