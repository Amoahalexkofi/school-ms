import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return NextResponse.json(await ((await getDb()) as any).roomType.update({ where: { id }, data: await req.json() }));
}
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).roomType.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
