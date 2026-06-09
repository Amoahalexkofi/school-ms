import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, location, isActive } = await req.json();
  const data: any = {};
  if (name     !== undefined) data.name     = name?.trim() || null;
  if (location !== undefined) data.location = location     || null;
  if (isActive !== undefined) data.isActive = Boolean(isActive);
  const p = await ((await getDb()) as any).pickupPoint.update({ where: { id }, data });
  return NextResponse.json(p);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).pickupPoint.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
