import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const m = await ((await getDb()) as any).transportFeemaster.update({ where: { id }, data });
  return NextResponse.json(m);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await ((await getDb()) as any).transportFeemaster.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ ok: true });
}
