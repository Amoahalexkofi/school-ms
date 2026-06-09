import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, description, isActive } = await req.json();
  const data: any = {};
  if (name        !== undefined) data.name        = name?.trim()  || null;
  if (description !== undefined) data.description = description   || null;
  if (isActive    !== undefined) data.isActive    = Boolean(isActive);
  return NextResponse.json(await ((await getDb()) as any).roomType.update({ where: { id }, data }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).roomType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
