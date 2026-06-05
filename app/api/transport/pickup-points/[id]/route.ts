import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await ((await getDb()) as any).pickupPoint.update({ where: { id }, data: await req.json() });
  return NextResponse.json(p);
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).pickupPoint.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
