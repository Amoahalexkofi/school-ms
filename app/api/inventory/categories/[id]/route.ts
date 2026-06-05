import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await ((await getDb()) as any).itemCategory.update({ where: { id }, data: await req.json() }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const count = await ((await getDb()) as any).item.count({ where: { categoryId: id } });
  if (count > 0) return NextResponse.json({ error: `${count} items use this category` }, { status: 409 });
  await ((await getDb()) as any).itemCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
